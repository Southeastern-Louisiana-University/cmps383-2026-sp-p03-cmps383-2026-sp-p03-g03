using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Receipts;
using Selu383.SP26.Api.Features.Loyalty;
using Selu383.SP26.Api.Features.Payments;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/payments/webhook")]
public class StripeWebhookController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly DataContext _context;
    private readonly ReceiptPdfService _receiptPdfService;
    private readonly BlobStorageService _blobStorageService;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<StripeWebhookController> _logger;

    public StripeWebhookController(
        IConfiguration configuration,
        DataContext context,
        ReceiptPdfService receiptPdfService,
        BlobStorageService blobStorageService,
        UserManager<User> userManager,
        ILogger<StripeWebhookController> logger)
    {
        _configuration = configuration;
        _context = context;
        _receiptPdfService = receiptPdfService;
        _blobStorageService = blobStorageService;
        _userManager = userManager;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Handle()
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync();
        var stripeSignature = Request.Headers["Stripe-Signature"];

        _logger.LogInformation("Received Stripe webhook event.");

        try
        {
            var webhookSecret = _configuration["Stripe:WebhookSecret"]?.Trim();

            if (string.IsNullOrWhiteSpace(webhookSecret))
            {
                _logger.LogWarning("Stripe webhook secret is missing.");
                return BadRequest("Stripe webhook secret is missing.");
            }

            var stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, webhookSecret);

            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Session;
                if (session == null)
                {
                    _logger.LogWarning("Invalid Stripe checkout session.");
                    return BadRequest("Invalid Stripe checkout session.");
                }

                if (!TryResolveOrderId(session, out var orderId))
                {
                    _logger.LogWarning("Could not resolve order ID from webhook payload.");
                    return Ok();
                }

                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                    .Include(o => o.CreatedByUser)
                    .Include(o => o.Receipt)
                    .Include(o => o.Payments)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} was not found for the webhook event.", orderId);
                    return Ok();
                }

                var transactionId = session.PaymentIntentId ?? session.Id;
                var existingPayment = order.Payments.FirstOrDefault(p => p.TransactionId == transactionId);

                if (existingPayment == null)
                {
                    order.Payments.Add(new Payment
                    {
                        OrderId = order.Id,
                        Provider = "Stripe",
                        PaymentMethodType = "CheckoutSession",
                        TransactionId = transactionId,
                        Amount = order.Total,
                        Status = PaymentStatuses.Paid,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                else
                {
                    existingPayment.Status = PaymentStatuses.Paid;
                }

                var wasAlreadyPaid = order.PaymentStatus == PaymentStatuses.Paid;

                order.PaymentStatus = PaymentStatuses.Paid;

                if (!wasAlreadyPaid && order.CreatedByUser != null && !string.Equals(order.OrderType, OrderTypes.CoverCharge, StringComparison.OrdinalIgnoreCase))
                {
                    var userRoles = await _userManager.GetRolesAsync(order.CreatedByUser);
                    var isStaffAccount = userRoles.Any(r =>
                        string.Equals(r, RoleNames.Admin, StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(r, RoleNames.Manager, StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(r, RoleNames.Staff, StringComparison.OrdinalIgnoreCase));

                    if (!isStaffAccount)
                    {
                        var isFirstWeekCustomer = order.CreatedByUser.CreatedAt >= DateTime.UtcNow.AddDays(-7);
                        var pointsRate = isFirstWeekCustomer ? 20 : 10;
                        var pointsEarned = (int)Math.Round(order.Total * pointsRate);

                        var loyaltyExists = await _context.Set<LoyaltyLedger>()
                            .AnyAsync(x => x.OrderId == order.Id);

                        if (!loyaltyExists)
                        {
                            _context.Set<LoyaltyLedger>().Add(new LoyaltyLedger
                            {
                                UserId = order.CreatedByUser.Id,
                                OrderId = order.Id,
                                PointsEarned = pointsEarned,
                                PointsRedeemed = 0,
                                CreatedAt = DateTime.UtcNow
                            });

                            order.CreatedByUser.LoyaltyPoints += pointsEarned;
                        }
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Recorded payment for order {OrderId}.", order.Id);

                if (order.Receipt == null)
                {
                    try
                    {
                        var pdfBytes = _receiptPdfService.GenerateThermalReceipt(order);
                        var fileName = $"order-{order.Id}-receipt.pdf";
                        var receiptUrl = await _blobStorageService.UploadReceiptAsync(pdfBytes, fileName);

                        order.Receipt = new Receipt
                        {
                            OrderId = order.Id,
                            CreatedAt = DateTime.UtcNow,
                            ReceiptUrl = receiptUrl
                        };

                        await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Receipt generation or upload failed for order {OrderId}.", order.Id);
                    }
                }
            }

            return Ok();
        }
        catch (StripeException ex)
        {
            _logger.LogWarning(ex, "Stripe webhook validation failed.");
            return BadRequest($"Stripe webhook error: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled webhook processing error.");
            return BadRequest($"Webhook error: {ex.Message}");
        }
    }

    private static bool TryResolveOrderId(Session session, out int orderId)
    {
        orderId = 0;

        if (session.Metadata != null &&
            session.Metadata.TryGetValue("orderId", out var metadataOrderId) &&
            int.TryParse(metadataOrderId, out orderId))
        {
            return true;
        }

        return !string.IsNullOrWhiteSpace(session.ClientReferenceId) &&
               int.TryParse(session.ClientReferenceId, out orderId);
    }
}