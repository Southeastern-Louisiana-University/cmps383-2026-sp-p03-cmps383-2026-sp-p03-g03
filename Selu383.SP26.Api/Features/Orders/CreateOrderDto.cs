using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Orders;

public class CreateOrderDto
{
    [Required]
    public int LocationId { get; set; }

    [Required]
    [MaxLength(20)]
    public string OrderType { get; set; } = OrderTypes.Pickup;

    [MaxLength(500)]
    public string? Note { get; set; }

    [MaxLength(80)]
    public string? PickupName { get; set; }

    public DateTime? ScheduledPickupTime { get; set; }

    [Required]
    [MinLength(1)]
    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class UpdateOrderStatusDto
{
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = string.Empty;
}
