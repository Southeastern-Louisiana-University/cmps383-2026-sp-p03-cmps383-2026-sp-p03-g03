using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Reservations;

public class ReservationDto
{
    public int Id { get; set; }

    [Required]
    public int LocationId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int TableId { get; set; }

    [Required]
    public DateTime ReservedFor { get; set; }

    [Required]
    public int PartySize { get; set; }

    public string Status { get; set; } = "Pending";

    public string? SpecialRequests { get; set; }
}