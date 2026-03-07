namespace Selu383.SP26.Api.Features.Orders;

public class Receipt
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public virtual Order? Order { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? ReceiptText { get; set; }
}