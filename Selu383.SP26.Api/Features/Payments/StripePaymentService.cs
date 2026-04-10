using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Orders;

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
        var secretKey = _configuration["Stripe:SecretKey"]?.Trim();
        var successUrl = _configuration["Stripe:SuccessUrl"]?.Trim();
        var cancelUrl = _configuration["Stripe:CancelUrl"]?.Trim();

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

        List<SessionLineItemOptions> lineItems;

        if (order.OrderItems.Count == 0)
        {
            if (order.Total <= 0)
                throw new Exception("Order has no billable amount.");

            lineItems = new List<SessionLineItemOptions>
            {
                new()
                {
                    Quantity = 1,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "usd",
                        UnitAmount = (long)(order.Total * 100m),
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = string.Equals(order.OrderType, OrderTypes.CoverCharge, StringComparison.OrdinalIgnoreCase)
                                ? "Reservation Cover Charge"
                                : "Order Charge",
                            Description = string.IsNullOrWhiteSpace(order.Note) ? null : order.Note
                        }
                    }
                }
            };
        }
        else
        {
            lineItems = order.OrderItems.Select(item => new SessionLineItemOptions
            {
                Quantity = item.Quantity,
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "usd",
                    UnitAmount = (long)(item.UnitPrice * 100m),
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = item.MenuItemName,
                        Description = string.IsNullOrWhiteSpace(item.ItemNote) ? null : item.ItemNote
                    }
                }
            }).ToList();
        }

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

    public async Task<PaymentMethodCreateResult> CreatePaymentMethodAsync(string cardholderName, string cardNumber, int expMonth, int expYear, string cvc)
    {
        var secretKey = _configuration["Stripe:SecretKey"]?.Trim();
        if (string.IsNullOrWhiteSpace(secretKey))
            throw new Exception("Stripe secret key is missing.");

        StripeConfiguration.ApiKey = secretKey;

        try
        {
            var options = new PaymentMethodCreateOptions
            {
                Type = "card",
                Card = new PaymentMethodCardOptions
                {
                    Number = cardNumber,
                    ExpMonth = (long)expMonth,
                    ExpYear = (long)expYear,
                    Cvc = cvc
                }
            };

            var service = new PaymentMethodService();
            var paymentMethod = await service.CreateAsync(options);

            return new PaymentMethodCreateResult
            {
                StripePaymentMethodId = paymentMethod.Id,
                Brand = paymentMethod.Card?.Brand ?? "Card",
                Last4 = paymentMethod.Card?.Last4 ?? "0000",
                ExpMonth = expMonth,
                ExpYear = expYear
            };
        }
        catch (StripeException ex)
        {
            throw new Exception($"Stripe API error: {ex.Message}", ex);
        }
    }
}

public class PaymentMethodCreateResult
{
    public string StripePaymentMethodId { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Last4 { get; set; } = string.Empty;
    public int ExpMonth { get; set; }
    public int ExpYear { get; set; }
}
