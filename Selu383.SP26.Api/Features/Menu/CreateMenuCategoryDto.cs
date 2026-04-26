using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Menu;

public class CreateMenuCategoryDto
{
    [Required]
    [MinLength(1)]
    public List<int> LocationIds { get; set; } = new();

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? IconPath { get; set; }

    public bool IsSeasonal { get; set; } = false;
    public bool IsActive { get; set; } = true;
}
