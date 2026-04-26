using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Menu;

public class CreateMenuItemDto
{
    [Required]
    public int CategoryId { get; set; }

    public int? LocationId { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? ImagePath { get; set; }

    [Required]
    [Range(0.01, 1000)]
    public decimal BasePrice { get; set; }

    public bool IsAvailable { get; set; } = true;
}

public class UpdateMenuItemDto
{
    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? ImagePath { get; set; }

    [Required]
    [Range(0.01, 1000)]
    public decimal BasePrice { get; set; }

    public bool IsAvailable { get; set; } = true;
}

public class DisableMenuItemDto
{
    [Required]
    [MaxLength(250)]
    public string Reason { get; set; } = string.Empty;
}
