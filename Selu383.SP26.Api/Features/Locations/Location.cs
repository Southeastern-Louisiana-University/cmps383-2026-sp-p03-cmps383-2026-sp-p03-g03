using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Menu;

namespace Selu383.SP26.Api.Features.Locations;

public class Location
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Corporate";
    public string? Phone { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Zip { get; set; }
    public TimeOnly? OpeningTime { get; set; }
    public TimeOnly? ClosingTime { get; set; }
    public string? LayoutJson { get; set; }
    public bool IsActive { get; set; } = true;
    public int TableCount { get; set; }
    public int? ManagerId { get; set; }
    public virtual User? Manager { get; set; }
    public virtual ICollection<MenuCategory> MenuCategories { get; set; } = new List<MenuCategory>();
}