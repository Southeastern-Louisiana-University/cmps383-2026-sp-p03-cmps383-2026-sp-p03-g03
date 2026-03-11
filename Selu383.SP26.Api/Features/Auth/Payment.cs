using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Features.Payments;

public class Payment
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public virtual Order? Order { get; set; }

    public string PaymentMethod { get; set; } = string.Empty; 

    //stripe
    public string? TransactionId { get; set; } 

    public decimal Amount { get; set; }

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
}