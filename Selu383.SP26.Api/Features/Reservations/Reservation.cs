using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Tables;

namespace Selu383.SP26.Api.Features.Reservations;

public class Reservation
{
    public int Id { get; set; }

    public int LocationId { get; set; }
    public virtual Location? Location { get; set; }

    public int UserId { get; set; }
    public virtual User? User { get; set; }

    public int TableId { get; set; }
    public virtual Table? Table { get; set; }

    public DateTime ReservedFor { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int PartySize { get; set; }

    public string Status { get; set; } = "Pending";

    public string? SpecialRequests { get; set; }
}