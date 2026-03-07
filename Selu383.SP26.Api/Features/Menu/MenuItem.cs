namespace Selu383.SP26.Api.Features.Menu;

public class MenuItem
{
    public int Id { get; set; }

    public int CategoryId { get; set; }
    public virtual MenuCategory? Category { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public decimal BasePrice { get; set; }

    public bool IsAvailable { get; set; } = true;
}