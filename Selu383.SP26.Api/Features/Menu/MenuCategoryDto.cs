using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Menu;

public class MenuCategoryDto
{
    public int Id { get; set; }

    public int[]? LocationIds { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    public bool IsSeasonal { get; set; }

    public bool IsActive { get; set; }
}