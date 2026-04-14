namespace Selu383.SP26.Api.Features.Menu;

public class MenuCategory
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public bool IsSeasonal { get; set; } = false;
    public bool IsActive { get; set; } = true;

    public virtual ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
    public virtual ICollection<MenuCategoryLocation> MenuCategoryLocations { get; set; } = new List<MenuCategoryLocation>();
}