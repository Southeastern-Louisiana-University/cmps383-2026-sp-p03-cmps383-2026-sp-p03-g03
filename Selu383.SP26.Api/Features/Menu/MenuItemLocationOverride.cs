using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;

namespace Selu383.SP26.Api.Features.Menu;

public class MenuItemLocationOverride
{
    public int MenuItemId { get; set; }
    public virtual MenuItem? MenuItem { get; set; }

    public int LocationId { get; set; }
    public virtual Location? Location { get; set; }

    public bool IsAvailable { get; set; } = true;
    public string? UnavailableReason { get; set; }
    public DateTime? DisabledAt { get; set; }
    public int? DisabledByUserId { get; set; }
    public virtual User? DisabledByUser { get; set; }
}
