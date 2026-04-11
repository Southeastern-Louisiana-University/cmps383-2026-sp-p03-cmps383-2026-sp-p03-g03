using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Locations;

public class LocationGetDto
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
    public bool IsActive { get; set; }
    public int TableCount { get; set; }
    public int? ManagerId { get; set; }
    public string? ManagerDisplayName { get; set; }
}

public class LocationCrudDto
{
    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Type { get; set; } = "Corporate";

    [MaxLength(20)]
    public string? Phone { get; set; }

    [Required]
    public string Address { get; set; } = string.Empty;

    [MaxLength(80)]
    public string? City { get; set; }

    [MaxLength(2)]
    public string? State { get; set; }

    [MaxLength(10)]
    public string? Zip { get; set; }

    public TimeOnly? OpeningTime { get; set; }
    public TimeOnly? ClosingTime { get; set; }
    public string? LayoutJson { get; set; }
    public bool IsActive { get; set; } = true;

    [Range(1, 500)]
    public int TableCount { get; set; }

    public int? ManagerId { get; set; }
}
