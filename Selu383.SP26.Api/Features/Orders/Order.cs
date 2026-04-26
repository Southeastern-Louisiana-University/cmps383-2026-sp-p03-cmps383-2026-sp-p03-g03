using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Payments;

namespace Selu383.SP26.Api.Features.Orders;

public class Order
{
    public int Id { get; set; }

    public int LocationId { get; set; }
    public virtual Location? Location { get; set; }

    public int? CreatedByUserId { get; set; }
    public virtual User? CreatedByUser { get; set; }

    public string OrderCode { get; set; } = string.Empty;
    public string OrderType { get; set; } = OrderTypes.Pickup;
    public string Status { get; set; } = OrderStatuses.Placed;
    public string PaymentStatus { get; set; } = PaymentStatuses.Pending;

    public DateTime OrderTime { get; set; } = DateTime.UtcNow;
    public DateTime? ScheduledPickupTime { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }

    public string? Note { get; set; }
    public string? PickupName { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public virtual Receipt? Receipt { get; set; }
}
