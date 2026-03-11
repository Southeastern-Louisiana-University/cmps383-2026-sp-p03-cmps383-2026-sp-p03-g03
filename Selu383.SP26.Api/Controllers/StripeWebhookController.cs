using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Receipts;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/payments/webhook")]
public class StripeWebhookController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly DataContext _context;
    private readonly ReceiptPdfService _receiptPdfService;
    private readonly BlobStorageService _blobStorageService;

    public StripeWebhookController(
        IConfiguration configuration,
        DataContext context,
        ReceiptPdfService receiptPdfService,
        BlobStorageService blobStorageService)
    {
        _configuration = configuration;
        _context = context;
        _receiptPdfService = receiptPdfService;
        _blobStorageService = blobStorageService;
    }

    [HttpPost]
    public async Task<IActionResult> Handle()
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync();
        var stripeSignature = Request.Headers["Stripe-Signature"];

        try
        {
            var webhookSecret = _configuration["Stripe:WebhookSecret"];

            if (string.IsNullOrWhiteSpace(webhookSecret))
                return BadRequest("Stripe webhook secret is missing.");

            var stripeEvent = EventUtility.ConstructEvent(
                json,
                stripeSignature,
                webhookSecret
            );

            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Session;

                if (session == null)
                    return BadRequest("Invalid Stripe checkout session.");

                if (session.Metadata == null ||
                    !session.Metadata.TryGetValue("orderId", out var orderIdValue))
                {
                    return BadRequest("Missing orderId metadata.");
                }

                if (!int.TryParse(orderIdValue, out var orderId))
                    return BadRequest("Invalid orderId metadata.");

                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.MenuItem)
                    .Include(o => o.Location)
                    .Include(o => o.CreatedByUser)
                    .Include(o => o.Receipt)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                    return NotFound("Order not found.");

                order.PaymentStatus = "Paid";
                order.Status = "Confirmed";

                if (order.Receipt == null)
                {
                    var pdfBytes = _receiptPdfService.GenerateReceipt(order);
                    var fileName = $"order-{order.Id}-receipt.pdf";
                    var receiptUrl = await _blobStorageService.UploadReceiptAsync(pdfBytes, fileName);

                    order.Receipt = new Receipt
                    {
                        OrderId = order.Id,
                        CreatedAt = DateTime.UtcNow,
                        ReceiptText = receiptUrl
                    };
                }

                await _context.SaveChangesAsync();
            }

            return Ok();
        }
     catch (StripeException ex)
{
    Console.WriteLine($"Stripe webhook error: {ex.Message}");
    return BadRequest($"Stripe webhook error: {ex.Message}");
}
catch (Exception ex)
{
    Console.WriteLine($"Webhook error: {ex.Message}");
    return BadRequest($"Webhook error: {ex.Message}");
}
    }
}