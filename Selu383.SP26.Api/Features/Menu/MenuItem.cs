using Selu383.SP26.Api.Features.Auth;

namespace Selu383.SP26.Api.Features.Menu;

public class MenuItem
{
    public int Id { get; set; }

    public int CategoryId { get; set; }
    public virtual MenuCategory? Category { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImagePath { get; set; }

    public decimal BasePrice { get; set; }

    public bool IsAvailable { get; set; } = true;
    public string? UnavailableReason { get; set; }
    public DateTime? DisabledAt { get; set; }
    public int? DisabledByUserId { get; set; }
    public virtual User? DisabledByUser { get; set; }

    public virtual ICollection<MenuItemLocationOverride> LocationOverrides { get; set; } = new List<MenuItemLocationOverride>();
}
