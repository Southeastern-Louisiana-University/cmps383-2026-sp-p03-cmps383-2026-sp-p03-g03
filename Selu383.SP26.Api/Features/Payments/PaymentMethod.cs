using Selu383.SP26.Api.Features.Auth;

namespace Selu383.SP26.Api.Features.Payments;

public class PaymentMethod
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public virtual User? User { get; set; }

    // Stripe payment method ID (secure storage, actual card tokenized by Stripe)
    public string StripePaymentMethodId { get; set; } = string.Empty;

    // Display info only (last 4 digits, brand, cardholder name)
    public string CardholderName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Last4 { get; set; } = string.Empty;
    public int ExpMonth { get; set; }
    public int ExpYear { get; set; }

    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
