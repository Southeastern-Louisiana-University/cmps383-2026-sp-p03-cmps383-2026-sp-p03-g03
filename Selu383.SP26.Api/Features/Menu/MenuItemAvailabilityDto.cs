namespace Selu383.SP26.Api.Features.Menu;

public class MenuItemAvailabilityDto
{
    public int MenuItemId { get; set; }
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int LocationId { get; set; }
    public bool IsAvailable { get; set; }
    public string? UnavailableReason { get; set; }
    public bool IsOverridden { get; set; }
}
