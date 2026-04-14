using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Menu;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Staff;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/staff")]
public class StaffController : ControllerBase
{
    private readonly DataContext _context;

    public StaffController(DataContext context)
    {
        _context = context;
    }

    [HttpGet("orders")]
    [Authorize(Roles = $"{RoleNames.Staff},{RoleNames.Manager},{RoleNames.Admin}")]
    public async Task<ActionResult<List<StaffOrderDto>>> GetOrders(
        [FromQuery] string? status,
        [FromQuery] int? locationId)
    {
        var query = _context.Orders
            .Include(o => o.OrderItems)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.Status == status);
        }

        if (locationId.HasValue)
        {
            query = query.Where(o => o.LocationId == locationId.Value);
        }

        var orders = await query
            .OrderByDescending(o => o.OrderTime)
            .Take(100)
            .Select(o => new StaffOrderDto
            {
                Id = o.Id,
                LocationId = o.LocationId,
                CreatedByUserId = o.CreatedByUserId,
                OrderCode = o.OrderCode,
                OrderType = o.OrderType,
                Status = o.Status,
                PaymentStatus = o.PaymentStatus,
                OrderTime = o.OrderTime,
                ScheduledPickupTime = o.ScheduledPickupTime,
                Total = o.Total,
                PickupName = o.PickupName,
                ItemCount = o.OrderItems.Count
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpPost("orders/{orderId:int}/advance")]
    [Authorize(Roles = $"{RoleNames.Staff},{RoleNames.Manager},{RoleNames.Admin}")]
    public async Task<ActionResult<StaffOrderDto>> AdvanceOrder(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return NotFound();

        var nextStatus = order.Status switch
        {
            OrderStatuses.Placed => OrderStatuses.Confirmed,
            OrderStatuses.Confirmed => OrderStatuses.Preparing,
            OrderStatuses.Preparing => OrderStatuses.Ready,
            OrderStatuses.Ready => OrderStatuses.Completed,
            _ => null
        };

        if (nextStatus == null)
            return BadRequest($"Cannot advance order with status '{order.Status}'.");

        order.Status = nextStatus;

        if (nextStatus == OrderStatuses.Completed)
        {
            order.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(MapStaffOrder(order));
    }

    [HttpPost("orders/{orderId:int}/cancel")]
    [Authorize(Roles = $"{RoleNames.Staff},{RoleNames.Manager},{RoleNames.Admin}")]
    public async Task<ActionResult<StaffOrderDto>> CancelOrder(int orderId, [FromBody] CancelOrderDto dto)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return NotFound();

        if (order.Status == OrderStatuses.Completed || order.Status == OrderStatuses.Cancelled)
            return BadRequest($"Cannot cancel order with status '{order.Status}'.");

        order.Status = OrderStatuses.Cancelled;
        order.CancelledAt = DateTime.UtcNow;

        var reason = dto.Reason.Trim();
        order.Note = string.IsNullOrWhiteSpace(order.Note)
            ? $"Cancelled: {reason}"
            : $"{order.Note} | Cancelled: {reason}";

        await _context.SaveChangesAsync();

        return Ok(MapStaffOrder(order));
    }

    [HttpPost("menu-items/{id:int}/disable")]
    [Authorize(Roles = $"{RoleNames.Manager},{RoleNames.Admin}")]
    public async Task<ActionResult> DisableMenuItem(int id, [FromBody] DisableMenuItemDto dto)
    {
        var item = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
            return NotFound();

        item.IsAvailable = false;
        item.UnavailableReason = dto.Reason.Trim();
        item.DisabledAt = DateTime.UtcNow;
        item.DisabledByUserId = User.GetCurrentUserId();

        await _context.SaveChangesAsync();

        return Ok(new { item.Id, item.Name, item.IsAvailable, item.UnavailableReason });
    }

    [HttpPost("menu-items/{id:int}/enable")]
    [Authorize(Roles = $"{RoleNames.Manager},{RoleNames.Admin}")]
    public async Task<ActionResult> EnableMenuItem(int id)
    {
        var item = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
            return NotFound();

        item.IsAvailable = true;
        item.UnavailableReason = null;
        item.DisabledAt = null;
        item.DisabledByUserId = null;

        await _context.SaveChangesAsync();

        return Ok(new { item.Id, item.Name, item.IsAvailable });
    }

    [HttpGet("reports/daily-summary")]
    [Authorize(Roles = $"{RoleNames.Manager},{RoleNames.Admin}")]
    public async Task<ActionResult<DailySummaryDto>> GetDailySummary([FromQuery] DateTime? date)
    {
        var targetDate = date?.Date ?? DateTime.UtcNow.Date;
        var nextDate = targetDate.AddDays(1);

        var orders = await _context.Orders
            .Where(o => o.OrderTime >= targetDate && o.OrderTime < nextDate)
            .Include(o => o.OrderItems)
            .ToListAsync();

        var completedOrders = orders.Where(o => o.Status == OrderStatuses.Completed).ToList();
        var cancelledOrders = orders.Where(o => o.Status == OrderStatuses.Cancelled).ToList();
        var openOrders = orders.Where(o =>
            o.Status != OrderStatuses.Completed && o.Status != OrderStatuses.Cancelled).ToList();

        var topItems = orders
            .Where(o => o.Status != OrderStatuses.Cancelled)
            .SelectMany(o => o.OrderItems)
            .GroupBy(oi => oi.MenuItemName)
            .Select(g => new TopItemDto
            {
                MenuItemName = g.Key,
                QuantitySold = g.Sum(oi => oi.Quantity)
            })
            .OrderByDescending(t => t.QuantitySold)
            .Take(5)
            .ToList();

        var summary = new DailySummaryDto
        {
            Date = targetDate,
            TotalOrders = orders.Count,
            CompletedOrders = completedOrders.Count,
            CancelledOrders = cancelledOrders.Count,
            OpenOrders = openOrders.Count,
            Revenue = completedOrders.Sum(o => o.Total),
            TopItems = topItems
        };

        return Ok(summary);
    }

    [HttpGet("admin/users")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<List<AdminUserDto>>> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .OrderBy(u => u.UserName)
            .Select(u => new AdminUserDto
            {
                Id = u.Id,
                UserName = u.UserName ?? string.Empty,
                DisplayName = u.DisplayName,
                Email = u.Email,
                Roles = u.UserRoles.Select(ur => ur.Role.Name ?? string.Empty).ToList(),
                LoyaltyPoints = u.LoyaltyPoints,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    private static StaffOrderDto MapStaffOrder(Order order)
    {
        return new StaffOrderDto
        {
            Id = order.Id,
            LocationId = order.LocationId,
            CreatedByUserId = order.CreatedByUserId,
            OrderCode = order.OrderCode,
            OrderType = order.OrderType,
            Status = order.Status,
            PaymentStatus = order.PaymentStatus,
            OrderTime = order.OrderTime,
            ScheduledPickupTime = order.ScheduledPickupTime,
            Total = order.Total,
            PickupName = order.PickupName,
            ItemCount = order.OrderItems.Count
        };
    }
}
