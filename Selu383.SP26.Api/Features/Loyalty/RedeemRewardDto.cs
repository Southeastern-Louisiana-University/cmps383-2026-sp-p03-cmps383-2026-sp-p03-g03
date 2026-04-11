using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Loyalty;

public class RedeemRewardDto
{
    [Required]
    public int RewardId { get; set; }
}