namespace Selu383.SP26.Api.Features.Orders;

public class OrderItemDto
{
    public int Id { get; set; }

    public int MenuItemId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal LineTotal { get; set; }

    public string? ItemNote { get; set; }
}