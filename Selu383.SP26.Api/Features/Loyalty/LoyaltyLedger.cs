using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Features.Loyalty;

public class LoyaltyLedger
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public virtual User? User { get; set; }

    public int? OrderId { get; set; }
    public virtual Order? Order { get; set; }

    public int PointsEarned { get; set; }
    public int PointsRedeemed { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}