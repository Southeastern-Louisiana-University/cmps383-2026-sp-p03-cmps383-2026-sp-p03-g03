using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;

namespace Selu383.SP26.Api.Features.Orders;

public class Order
{
    public int Id { get; set; }

    public int LocationId { get; set; }
    public virtual Location? Location { get; set; }

    public int CreatedByUserId { get; set; }
    public virtual User? CreatedByUser { get; set; }

    public string OrderCode { get; set; } = string.Empty;

    public string OrderType { get; set; } = "Pickup";

    public string Status { get; set; } = "Placed";

    public string PaymentStatus { get; set; } = "Unpaid";

    public DateTime OrderTime { get; set; } = DateTime.UtcNow;

    public decimal Total { get; set; }

    public string? Note { get; set; }

    public string? PickupName { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual Receipt? Receipt { get; set; }
}