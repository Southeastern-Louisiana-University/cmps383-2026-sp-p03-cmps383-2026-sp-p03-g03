using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Reservations;

public class ReservationDto
{
    public int Id { get; set; }
    public int LocationId { get; set; }
    public int UserId { get; set; }
    public int TableId { get; set; }
    public DateTime ReservedFor { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PartySize { get; set; }
    public string Status { get; set; } = ReservationStatuses.Pending;
    public string? SpecialRequests { get; set; }
}

public class ReservationAvailabilityDto
{
    public int LocationId { get; set; }
    public DateTime ReservedFor { get; set; }
    public List<int> TakenTableIds { get; set; } = new();
}

public class CreateReservationDto
{
    [Required]
    public int LocationId { get; set; }

    [Required]
    public int TableId { get; set; }

    [Required]
    public DateTime ReservedFor { get; set; }

    [Range(2, 6)]
    public int PartySize { get; set; }

    [MaxLength(500)]
    public string? SpecialRequests { get; set; }
}

public class UpdateReservationDto
{
    [Required]
    public int LocationId { get; set; }

    [Required]
    public int TableId { get; set; }

    [Required]
    public DateTime ReservedFor { get; set; }

    [Range(2, 6)]
    public int PartySize { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = ReservationStatuses.Pending;

    [MaxLength(500)]
    public string? SpecialRequests { get; set; }
}
