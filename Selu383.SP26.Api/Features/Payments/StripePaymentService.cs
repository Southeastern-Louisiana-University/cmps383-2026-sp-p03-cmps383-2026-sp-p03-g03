using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Features.Payments;

public class StripePaymentService
{
    private const string HostedCheckoutBaseUrl = "https://selu383-sp26-p03-g03.azurewebsites.net";
    private readonly IConfiguration _configuration;
    private readonly DataContext _context;

    public StripePaymentService(IConfiguration configuration, DataContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    public async Task<string> CreateCheckoutSessionAsync(int orderId, string? requestBaseUrl = null)
    {
        var secretKey = _configuration["Stripe:SecretKey"]?.Trim();
        var configuredSuccessUrl = _configuration["Stripe:SuccessUrl"]?.Trim();
        var configuredCancelUrl = _configuration["Stripe:CancelUrl"]?.Trim();

        if (string.IsNullOrWhiteSpace(secretKey))
            throw new Exception("Stripe secret key is missing.");

        var successUrl = ResolveCheckoutUrl(
            configuredSuccessUrl,
            requestBaseUrl,
            "/checkout/success.html?session_id={CHECKOUT_SESSION_ID}");

        var cancelUrl = ResolveCheckoutUrl(
            configuredCancelUrl,
            requestBaseUrl,
            "/checkout/cancel.html");

        if (string.IsNullOrWhiteSpace(successUrl) || string.IsNullOrWhiteSpace(cancelUrl))
            throw new Exception("Stripe success/cancel URLs are missing or invalid.");

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

    private static string? ResolveCheckoutUrl(string? configuredUrl, string? requestBaseUrl, string fallbackPath)
    {
        if (Uri.TryCreate(configuredUrl, UriKind.Absolute, out var configuredUri) && !IsLocalHost(configuredUri.Host))
        {
            return configuredUri.ToString();
        }

        if (Uri.TryCreate(HostedCheckoutBaseUrl, UriKind.Absolute, out var hostedBaseUri))
        {
            return new Uri(hostedBaseUri, fallbackPath).ToString();
        }

        if (Uri.TryCreate(requestBaseUrl, UriKind.Absolute, out var requestBaseUri))
        {
            return new Uri(requestBaseUri, fallbackPath).ToString();
        }

        if (Uri.TryCreate(configuredUrl, UriKind.Absolute, out configuredUri))
        {
            return configuredUri.ToString();
        }

        return null;
    }

    private static bool IsLocalHost(string host)
    {
        return string.Equals(host, "localhost", StringComparison.OrdinalIgnoreCase)
               || string.Equals(host, "127.0.0.1", StringComparison.OrdinalIgnoreCase)
               || string.Equals(host, "::1", StringComparison.OrdinalIgnoreCase);
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

    public async Task<bool> SyncOrderPaymentStatusFromStripeAsync(int orderId)
    {
        var secretKey = _configuration["Stripe:SecretKey"]?.Trim();
        if (string.IsNullOrWhiteSpace(secretKey))
            throw new Exception("Stripe secret key is missing.");

        StripeConfiguration.ApiKey = secretKey;

        var order = await _context.Orders
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            throw new Exception("Order not found.");

        if (order.PaymentStatus == PaymentStatuses.Paid)
            return false;

        var sessionService = new SessionService();
        var sessions = await sessionService.ListAsync(new SessionListOptions { Limit = 100 });
        var targetOrderId = orderId.ToString();

        var paidSession = sessions.Data.FirstOrDefault(s =>
        {
            var matchesOrder =
                (!string.IsNullOrWhiteSpace(s.ClientReferenceId) && s.ClientReferenceId == targetOrderId) ||
                (s.Metadata != null && s.Metadata.TryGetValue("orderId", out var metadataOrderId) && metadataOrderId == targetOrderId);

            if (!matchesOrder)
                return false;

            return string.Equals(s.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase)
                   || string.Equals(s.Status, "complete", StringComparison.OrdinalIgnoreCase);
        });

        if (paidSession == null)
            return false;

        var transactionId = paidSession.PaymentIntentId ?? paidSession.Id;
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

        order.PaymentStatus = PaymentStatuses.Paid;
        order.Status = OrderStatuses.Confirmed;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<string> ChargeOrderWithSavedMethodAsync(int orderId, string stripePaymentMethodId)
    {
        var secretKey = _configuration["Stripe:SecretKey"]?.Trim();
        if (string.IsNullOrWhiteSpace(secretKey))
            throw new Exception("Stripe secret key is missing.");

        StripeConfiguration.ApiKey = secretKey;

        var order = await _context.Orders
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            throw new Exception("Order not found.");

        if (order.PaymentStatus == PaymentStatuses.Paid)
            return "Order is already paid.";

        var intentService = new PaymentIntentService();

        var createOptions = new PaymentIntentCreateOptions
        {
            Amount = (long)(order.Total * 100m),
            Currency = "usd",
            Confirm = true,
            PaymentMethod = stripePaymentMethodId,
            OffSession = true,
            Description = $"Order {order.OrderCode}",
            Metadata = new Dictionary<string, string>
            {
                ["orderId"] = order.Id.ToString(),
                ["orderCode"] = order.OrderCode
            }
        };

        PaymentIntent intent;
        try
        {
            intent = await intentService.CreateAsync(createOptions);
        }
        catch (StripeException ex) when (string.Equals(ex.StripeError?.Code, "authentication_required", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Saved card requires authentication. Please complete checkout flow.");
        }

        if (!string.Equals(intent.Status, "succeeded", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Saved card payment did not complete. Please use checkout.");

        var existingPayment = order.Payments.FirstOrDefault(p => p.TransactionId == intent.Id);
        if (existingPayment == null)
        {
            order.Payments.Add(new Payment
            {
                OrderId = order.Id,
                Provider = "Stripe",
                PaymentMethodType = "SavedPaymentMethod",
                TransactionId = intent.Id,
                Amount = order.Total,
                Status = PaymentStatuses.Paid,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            existingPayment.Status = PaymentStatuses.Paid;
        }

        order.PaymentStatus = PaymentStatuses.Paid;
        order.Status = OrderStatuses.Confirmed;

        await _context.SaveChangesAsync();

        return intent.Id;
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
