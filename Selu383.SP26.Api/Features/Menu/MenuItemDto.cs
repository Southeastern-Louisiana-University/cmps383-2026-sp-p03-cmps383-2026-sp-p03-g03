using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Menu;

public class MenuItemDto
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal BasePrice { get; set; }

    public bool IsAvailable { get; set; }
}