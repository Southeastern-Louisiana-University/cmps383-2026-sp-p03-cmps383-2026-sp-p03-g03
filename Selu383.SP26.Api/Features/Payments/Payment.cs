using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Features.Payments;

public class Payment
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public virtual Order? Order { get; set; }

    public string Provider { get; set; } = "Stripe";
    public string PaymentMethodType { get; set; } = string.Empty;
    public string? TransactionId { get; set; }

    public decimal Amount { get; set; }

    public string Status { get; set; } = PaymentStatuses.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RemovedAt { get; set; }
    public string? RemovedReason { get; set; }
}
