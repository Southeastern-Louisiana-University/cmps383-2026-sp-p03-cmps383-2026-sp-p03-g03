using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Loyalty;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/loyalty")]
public class LoyaltyController : ControllerBase
{
    private readonly DataContext _context;

    public LoyaltyController(DataContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<object>> GetMyLoyalty()
    {
        var userId = User.GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized();

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == userId.Value);

        if (user == null)
            return NotFound();

        var history = await _context.LoyaltyLedgers
            .Where(x => x.UserId == userId.Value)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.OrderId,
                x.RewardId,
                x.RewardName,
                x.PointsEarned,
                x.PointsRedeemed,
                x.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            points = user.LoyaltyPoints,
            history
        });
    }

    [HttpGet("rewards")]
    public async Task<ActionResult<List<RewardDto>>> GetRewards()
    {
        var rewards = await _context.Set<Reward>()
            .Where(x => x.IsActive)
            .OrderBy(x => x.PointsCost)
            .Select(x => new RewardDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                PointsCost = x.PointsCost,
                IsActive = x.IsActive
            })
            .ToListAsync();

        return Ok(rewards);
    }

    [HttpPost("redeem")]
    [Authorize]
    public async Task<ActionResult> RedeemReward([FromBody] RedeemRewardDto dto)
    {
        var userId = User.GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId.Value);
        if (user == null)
            return NotFound();

        var reward = await _context.Set<Reward>()
            .FirstOrDefaultAsync(x => x.Id == dto.RewardId && x.IsActive);

        if (reward == null)
            return NotFound("Reward not found.");

        if (user.LoyaltyPoints < reward.PointsCost)
            return BadRequest("Not enough points.");

        user.LoyaltyPoints -= reward.PointsCost;

        _context.LoyaltyLedgers.Add(new LoyaltyLedger
        {
            UserId = user.Id,
            RewardId = reward.Id,
            RewardName = reward.Name,
            PointsEarned = 0,
            PointsRedeemed = reward.PointsCost,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Redeemed reward: {reward.Name}",
            remainingPoints = user.LoyaltyPoints
        });
    }
}
