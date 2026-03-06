using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Orders;

public class CreateOrderDto
{
    [Required]
    public int LocationId { get; set; }

    public string OrderType { get; set; } = "Pickup";

    public string? Note { get; set; }

    public string? PickupName { get; set; }

    public List<CreateOrderItemDto> Items { get; set; } = new();
}