using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Menu;

public class CreateMenuCategoryDto
{
    [Required]
    public int LocationId { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    public bool IsSeasonal { get; set; } = false;

    public bool IsActive { get; set; } = true;
}