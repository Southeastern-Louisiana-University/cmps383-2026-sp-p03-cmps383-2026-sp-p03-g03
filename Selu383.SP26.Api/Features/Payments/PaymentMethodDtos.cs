using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Payments;

public class CreatePaymentMethodDto
{
    [Required]
    [MaxLength(100)]
    public string CardholderName { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^[0-9]{4}$")]
    public string Last4 { get; set; } = string.Empty;

    [Range(1, 12)]
    public int ExpMonth { get; set; }

    [Range(2024, 2100)]
    public int ExpYear { get; set; }

    public bool IsDefault { get; set; }
}

public class PaymentMethodDto
{
    public int Id { get; set; }
    public string CardholderName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Last4 { get; set; } = string.Empty;
    public int ExpMonth { get; set; }
    public int ExpYear { get; set; }
    public bool IsDefault { get; set; }
}

public class OrderPaymentDto
{
    public int Id { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string PaymentMethodType { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? RemovedAt { get; set; }
    public string? RemovedReason { get; set; }
}

public class RemovePaymentDto
{
    [Required]
    [MaxLength(250)]
    public string Reason { get; set; } = string.Empty;
}
