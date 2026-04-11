using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using Selu383.SP26.Api.Data;
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
    private readonly ILogger<StripeWebhookController> _logger;

    public StripeWebhookController(
        IConfiguration configuration,
        DataContext context,
        ReceiptPdfService receiptPdfService,
        BlobStorageService blobStorageService,
        ILogger<StripeWebhookController> logger)
    {
        _configuration = configuration;
        _context = context;
        _receiptPdfService = receiptPdfService;
        _blobStorageService = blobStorageService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Handle()
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync();
        var stripeSignature = Request.Headers["Stripe-Signature"];

        _logger.LogInformation("[Webhook] Received event");

        try
        {
            var webhookSecret = _configuration["Stripe:WebhookSecret"]?.Trim();

            if (string.IsNullOrWhiteSpace(webhookSecret))
            {
                _logger.LogWarning("[Webhook] Stripe webhook secret is missing");
                return BadRequest("Stripe webhook secret is missing.");
            }

            var stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, webhookSecret);
            _logger.LogInformation("[Webhook] Event type: {EventType}", stripeEvent.Type);

            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Session;
                if (session == null)
                {
                    _logger.LogWarning("[Webhook] Invalid Stripe checkout session");
                    return BadRequest("Invalid Stripe checkout session.");
                }

                if (!TryResolveOrderId(session, out var orderId))
                {
                    _logger.LogWarning("[Webhook] Could not resolve orderId from metadata or client_reference_id");
                    return Ok();
                }

                _logger.LogInformation("[Webhook] Processing payment for order {OrderId}", orderId);

                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                    .Include(o => o.CreatedByUser)
                    .Include(o => o.Receipt)
                    .Include(o => o.Payments)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    _logger.LogWarning("[Webhook] Order {OrderId} not found", orderId);
                    return Ok();
                }

                _logger.LogInformation("[Webhook] Order found. Current status: {Status}, Current payment status: {PaymentStatus}", 
                    order.Status, order.PaymentStatus);

                var transactionId = session.PaymentIntentId ?? session.Id;
                var existingPayment = order.Payments.FirstOrDefault(p => p.TransactionId == transactionId);

                if (existingPayment == null)
                {
                    _logger.LogInformation("[Webhook] Creating new Payment record for order {OrderId}", orderId);
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
                    _logger.LogInformation("[Webhook] Updating existing Payment for order {OrderId}", orderId);
                    existingPayment.Status = PaymentStatuses.Paid;
                }

                var wasAlreadyPaid = order.PaymentStatus == PaymentStatuses.Paid;

                order.PaymentStatus = PaymentStatuses.Paid;
                order.Status = OrderStatuses.Confirmed;
                _logger.LogInformation("[Webhook] Order status updated to {Status}, payment status to {PaymentStatus}", 
                    order.Status, order.PaymentStatus);

                if (!wasAlreadyPaid && order.CreatedByUser != null)
                {
                    var pointsEarned = (int)Math.Round(order.Total * 10);
                    _logger.LogInformation("[Webhook] Adding {Points} loyalty points to user {UserId}", pointsEarned, order.CreatedByUser.Id);

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

                // Save the payment/order state FIRST so webhook success does not depend on receipt upload
                await _context.SaveChangesAsync();
                _logger.LogInformation("[Webhook] Changes saved to database");

                // Receipt generation is best-effort only
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
                        _logger.LogError(ex, "[Webhook] Receipt generation/upload failed for order {OrderId}", order.Id);
                    }
                }
            }

            return Ok();
        }
        catch (StripeException ex)
        {
            return BadRequest($"Stripe webhook error: {ex.Message}");
        }
        catch (Exception ex)
        {
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