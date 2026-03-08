using System.ComponentModel.DataAnnotations;
using Selu383.SP26.Api.Features.Auth;

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
    public virtual User? Manager { get; set; }
}

public class LocationCrudDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    public string Type { get; set; } = "Corporate";
    public string? Phone { get; set; }
    [Required]
    public string Address { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Zip { get; set; }
    public TimeOnly? OpeningTime { get; set; }
    public TimeOnly? ClosingTime { get; set; }
    public string? LayoutJson { get; set; }
    [Required]
    public bool IsActive { get; set; }
    [Required]
    public int TableCount { get; set; }
    public int? ManagerId { get; set; }
    public virtual User? Manager { get; set; }
}
