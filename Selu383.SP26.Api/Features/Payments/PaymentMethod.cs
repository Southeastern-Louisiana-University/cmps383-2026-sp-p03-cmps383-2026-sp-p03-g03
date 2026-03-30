namespace Selu383.SP26.Api.Features.Payments;

public class PaymentMethod
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string CardholderName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Last4 { get; set; } = string.Empty;
    public int ExpMonth { get; set; }
    public int ExpYear { get; set; }

    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
