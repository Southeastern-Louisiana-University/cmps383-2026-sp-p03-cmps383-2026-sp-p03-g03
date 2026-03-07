using Selu383.SP26.Api.Features.Menu;

namespace Selu383.SP26.Api.Features.Orders;

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public virtual Order? Order { get; set; }

    public int MenuItemId { get; set; }
    public virtual MenuItem? MenuItem { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal LineTotal { get; set; }

    public string? ItemNote { get; set; }
}