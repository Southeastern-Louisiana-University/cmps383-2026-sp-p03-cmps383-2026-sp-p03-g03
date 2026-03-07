using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Tables;

public class TableDto
{
    public int Id { get; set; }

    [Required]
    public int LocationId { get; set; }

    [Required]
    public string TableNumber { get; set; } = string.Empty;

    public int Seats { get; set; }

    public bool IsActive { get; set; }
}