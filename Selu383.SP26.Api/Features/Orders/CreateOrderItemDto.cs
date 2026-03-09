using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Orders;

public class CreateOrderItemDto
{
    [Required]
    public int MenuItemId { get; set; }

    public int Quantity { get; set; } = 1;

    public string? ItemNote { get; set; }
}