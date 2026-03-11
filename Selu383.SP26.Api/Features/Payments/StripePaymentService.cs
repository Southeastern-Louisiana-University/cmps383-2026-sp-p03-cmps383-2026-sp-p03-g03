using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using Selu383.SP26.Api.Data;

namespace Selu383.SP26.Api.Features.Payments;

public class StripePaymentService
{
    private readonly IConfiguration _configuration;
    private readonly DataContext _context;

    public StripePaymentService(IConfiguration configuration, DataContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    public async Task<string> CreateCheckoutSessionAsync(int orderId)
    {
        var secretKey = _configuration["Stripe:SecretKey"];
        var successUrl = _configuration["Stripe:SuccessUrl"];
        var cancelUrl = _configuration["Stripe:CancelUrl"];

        if (string.IsNullOrWhiteSpace(secretKey))
            throw new Exception("Stripe secret key is missing.");

        if (string.IsNullOrWhiteSpace(successUrl) || string.IsNullOrWhiteSpace(cancelUrl))
            throw new Exception("Stripe success/cancel URLs are missing.");

        StripeConfiguration.ApiKey = secretKey;

        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            throw new Exception("Order not found.");

        if (order.OrderItems == null || order.OrderItems.Count == 0)
            throw new Exception("Order has no items.");

        var lineItems = order.OrderItems.Select(item => new SessionLineItemOptions
        {
            Quantity = item.Quantity,
            PriceData = new SessionLineItemPriceDataOptions
            {
                Currency = "usd",
                UnitAmount = (long)(item.UnitPrice * 100m),
                ProductData = new SessionLineItemPriceDataProductDataOptions
                {
                    Name = item.MenuItem?.Name ?? $"Item {item.MenuItemId}",
                    Description = string.IsNullOrWhiteSpace(item.ItemNote) ? null : item.ItemNote
                }
            }
        }).ToList();

        var options = new SessionCreateOptions
        {
            Mode = "payment",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            ClientReferenceId = order.Id.ToString(),
            LineItems = lineItems,
            Metadata = new Dictionary<string, string>
            {
                ["orderId"] = order.Id.ToString(),
                ["orderCode"] = order.OrderCode
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return session.Url!;
    }
}