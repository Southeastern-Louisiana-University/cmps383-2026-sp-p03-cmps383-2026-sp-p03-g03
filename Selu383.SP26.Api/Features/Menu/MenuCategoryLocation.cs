using Selu383.SP26.Api.Features.Locations;

namespace Selu383.SP26.Api.Features.Menu;

public class MenuCategoryLocation
{
    public int MenuCategoryId { get; set; }
    public virtual MenuCategory? MenuCategory { get; set; }

    public int LocationId { get; set; }
    public virtual Location? Location { get; set; }
}