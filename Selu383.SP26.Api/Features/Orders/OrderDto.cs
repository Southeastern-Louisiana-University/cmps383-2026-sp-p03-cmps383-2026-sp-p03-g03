namespace Selu383.SP26.Api.Features.Orders;

public class OrderDto
{
    public int Id { get; set; }

    public int LocationId { get; set; }

    public int CreatedByUserId { get; set; }

    public string OrderCode { get; set; } = string.Empty;

    public string OrderType { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string PaymentStatus { get; set; } = string.Empty;

    public DateTime OrderTime { get; set; }

    public decimal Total { get; set; }

    public string? Note { get; set; }

    public string? PickupName { get; set; }

    public List<OrderItemDto> Items { get; set; } = new();
}