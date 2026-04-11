using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Orders;

public class CreateOrderItemDto
{
    [Required]
    public int MenuItemId { get; set; }

    [Range(1, 50)]
    public int Quantity { get; set; } = 1;

    [MaxLength(500)]
    public string? ItemNote { get; set; }
}
