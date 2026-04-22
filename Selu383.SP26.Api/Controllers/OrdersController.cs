using System.Linq.Expressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Receipts;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ReceiptPdfService _receiptPdfService;
    private readonly BlobStorageService _blobStorageService;
    private readonly ILocationAccessService _locationAccessService;

    public OrdersController(
        DataContext context,
        ReceiptPdfService receiptPdfService,
        BlobStorageService blobStorageService,
        ILocationAccessService locationAccessService)
    {
        _context = context;
        _receiptPdfService = receiptPdfService;
        _blobStorageService = blobStorageService;
        _locationAccessService = locationAccessService;
    }

    [HttpGet("my-orders")]
    [Authorize]
    public async Task<ActionResult<List<OrderDto>>> GetMyOrders()
    {
        var userId = User.GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized();

        var orders = await _context.Orders
            .Where(o => o.CreatedByUserId == userId.Value)
            .Include(o => o.OrderItems)
            .Include(o => o.Receipt)
            .OrderByDescending(o => o.OrderTime)
            .Select(MapOrderDto())
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager},{RoleNames.Staff}")]
    public async Task<ActionResult<List<OrderDto>>> GetAllOrders()
    {
        var isAdmin = User.IsInRole(RoleNames.Admin);
        var allowedLocationIds = isAdmin ? new List<int>() : await _locationAccessService.GetAccessibleLocationIdsAsync(User);

        var query = _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Receipt)
            .OrderByDescending(o => o.OrderTime)
            .AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(o => allowedLocationIds.Contains(o.LocationId));
        }

        var orders = await query
            .Select(MapOrderDto())
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        var order = await _context.Orders
            .Where(o => o.Id == id)
            .Include(o => o.OrderItems)
            .Include(o => o.Receipt)
            .Select(MapOrderDto())
            .FirstOrDefaultAsync();

        if (order == null)
            return NotFound("Order not found.");

        var currentUserId = User.GetCurrentUserId();
        var isPrivileged = User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.Manager) || User.IsInRole(RoleNames.Staff);

        // guest orders have a null UserId — they can still access their own
        if (order.CreatedByUserId.HasValue && !isPrivileged && order.CreatedByUserId != currentUserId)
            return Forbid();

        if (isPrivileged && !await _locationAccessService.CanAccessLocationAsync(User, order.LocationId))
            return Forbid();

        return Ok(order);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var currentUserId = User.GetCurrentUserId();

        var normalizedOrderType = (dto.OrderType ?? string.Empty).Trim();
        var canonicalOrderType = normalizedOrderType.Replace(" ", string.Empty).Replace("-", string.Empty).ToLowerInvariant() switch
        {
            "pickup" => OrderTypes.Pickup,
            "dinein" => OrderTypes.DineIn,
            "instore" => OrderTypes.InStore,
            "drivethru" => OrderTypes.DriveThru,
            "covercharge" => OrderTypes.CoverCharge,
            _ => normalizedOrderType
        };

        var allowedOrderTypes = new[] { OrderTypes.Pickup, OrderTypes.DineIn, OrderTypes.InStore, OrderTypes.DriveThru, OrderTypes.CoverCharge };
        if (!allowedOrderTypes.Contains(canonicalOrderType, StringComparer.OrdinalIgnoreCase))
            return BadRequest("Invalid order type.");

        if (dto.ScheduledPickupTime.HasValue)
        {
            if (!string.Equals(canonicalOrderType, OrderTypes.Pickup, StringComparison.OrdinalIgnoreCase))
                return BadRequest("Scheduled pickup is only available for pickup orders.");

            if (dto.ScheduledPickupTime.Value <= DateTime.UtcNow)
                return BadRequest("Scheduled pickup time must be in the future.");
        }

        var locationExists = await _context.Locations.AnyAsync(l => l.Id == dto.LocationId);
        if (!locationExists)
            return BadRequest("Invalid location.");

        var menuItemIds = dto.Items.Select(i => i.MenuItemId).Distinct().ToList();

        var menuItems = await _context.MenuItems
            .Where(m => menuItemIds.Contains(m.Id) && m.IsAvailable)
            .ToDictionaryAsync(m => m.Id);

        if (menuItems.Count != menuItemIds.Count)
            return BadRequest("One or more menu items are invalid or unavailable.");

        var order = new Order
        {
            LocationId = dto.LocationId,
            CreatedByUserId = currentUserId,
            OrderCode = $"ORD{DateTime.UtcNow:yyyyMMddHHmmss}",
            OrderType = canonicalOrderType,
            Status = OrderStatuses.Placed,
            PaymentStatus = PaymentStatuses.Unpaid,
            OrderTime = DateTime.UtcNow,
            ScheduledPickupTime = dto.ScheduledPickupTime,
            Note = dto.Note?.Trim(),
            PickupName = dto.PickupName?.Trim()
        };

        foreach (var item in dto.Items)
        {
            var menuItem = menuItems[item.MenuItemId];
            var quantity = item.Quantity < 1 ? 1 : item.Quantity;
            var unitPrice = menuItem.BasePrice;
            var lineTotal = unitPrice * quantity;

            order.OrderItems.Add(new OrderItem
            {
                MenuItemId = item.MenuItemId,
                MenuItemName = menuItem.Name,
                Quantity = quantity,
                UnitPrice = unitPrice,
                LineTotal = lineTotal,
                ItemNote = item.ItemNote?.Trim()
            });
        }

        order.Subtotal = order.OrderItems.Sum(i => i.LineTotal);
        order.Tax = 0m;
        order.Total = order.Subtotal + order.Tax;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        string? receiptUrl = null;
        try
        {
            var orderWithItems = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == order.Id);

            if (orderWithItems != null)
            {
                var pdfBytes = _receiptPdfService.GenerateThermalReceipt(orderWithItems);
                var fileName = $"receipts/order-{orderWithItems.Id}-{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
                receiptUrl = await _blobStorageService.UploadReceiptAsync(pdfBytes, fileName);

                orderWithItems.Receipt = new Receipt
                {
                    OrderId = orderWithItems.Id,
                    CreatedAt = DateTime.UtcNow,
                    ReceiptUrl = receiptUrl
                };

                await _context.SaveChangesAsync();
            }
        }
        catch
        {
            // receipt failure shouldn't block the order
        }

        var result = await _context.Orders
            .Where(o => o.Id == order.Id)
            .Include(o => o.OrderItems)
            .Include(o => o.Receipt)
            .Select(MapOrderDto())
            .FirstAsync();

        result.ReceiptUrl = receiptUrl ?? result.ReceiptUrl;

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, result);
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager},{RoleNames.Staff}")]
    public async Task<ActionResult<OrderDto>> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Receipt)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound("Order not found.");

        if (!TryNormalizeOrderStatus(dto.Status, out var nextStatus))
            return BadRequest("Invalid order status.");

        if (!await _locationAccessService.CanAccessLocationAsync(User, order.LocationId))
            return Forbid();

        if (string.Equals(nextStatus, OrderStatuses.Completed, StringComparison.OrdinalIgnoreCase)
            && !string.Equals(order.PaymentStatus, PaymentStatuses.Paid, StringComparison.OrdinalIgnoreCase))
            return BadRequest("Order must be paid before it can be completed.");

        order.Status = nextStatus;
        await _context.SaveChangesAsync();

        return Ok(new OrderDto
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
            Subtotal = order.Subtotal,
            Tax = order.Tax,
            Total = order.Total,
            Note = order.Note,
            PickupName = order.PickupName,
            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                MenuItemId = oi.MenuItemId,
                MenuItemName = oi.MenuItemName,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                LineTotal = oi.LineTotal,
                ItemNote = oi.ItemNote
            }).ToList(),
            ReceiptUrl = order.Receipt != null ? order.Receipt.ReceiptUrl : null
        });
    }

    [HttpGet("{id:int}/receiptpdf")]
    [HttpGet("{id:int}/receipt-pdf")]
    [Authorize]
    public async Task<IActionResult> GetReceiptPdf(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound("Order not found.");

        var currentUserId = User.GetCurrentUserId();
        var isPrivileged = User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.Manager) || User.IsInRole(RoleNames.Staff);
        if (!isPrivileged && currentUserId != order.CreatedByUserId)
            return Forbid();

        if (isPrivileged && !await _locationAccessService.CanAccessLocationAsync(User, order.LocationId))
            return Forbid();

        var pdfBytes = _receiptPdfService.GenerateReceipt(order);

        return File(pdfBytes, "application/pdf", $"order-{order.Id}-receipt.pdf");
    }

    [HttpPost("{id:int}/archive-receipt")]
    [Authorize]
    public async Task<ActionResult<object>> ArchiveReceipt(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Receipt)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound("Order not found.");

        var currentUserId = User.GetCurrentUserId();
        var isPrivileged = User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.Manager) || User.IsInRole(RoleNames.Staff);
        if (!isPrivileged && currentUserId != order.CreatedByUserId)
            return Forbid();

        if (isPrivileged && !await _locationAccessService.CanAccessLocationAsync(User, order.LocationId))
            return Forbid();

        var pdfBytes = _receiptPdfService.GenerateThermalReceipt(order);
        var fileName = $"receipts/order-{order.Id}-{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        var blobUrl = await _blobStorageService.UploadReceiptAsync(pdfBytes, fileName);

        if (order.Receipt == null)
        {
            order.Receipt = new Receipt
            {
                OrderId = order.Id,
                CreatedAt = DateTime.UtcNow,
                ReceiptUrl = blobUrl
            };
        }
        else
        {
            order.Receipt.ReceiptUrl = blobUrl;
            order.Receipt.CreatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            orderId = order.Id,
            receiptUrl = blobUrl
        });
    }

    private static bool TryNormalizeOrderStatus(string? rawStatus, out string normalized)
    {
        normalized = (rawStatus ?? string.Empty).Trim().ToLowerInvariant() switch
        {
            "placed" => OrderStatuses.Placed,
            "confirmed" => OrderStatuses.Confirmed,
            "preparing" => OrderStatuses.Preparing,
            "ready" => OrderStatuses.Ready,
            "completed" => OrderStatuses.Completed,
            "cancelled" => OrderStatuses.Cancelled,
            _ => string.Empty,
        };

        return !string.IsNullOrWhiteSpace(normalized);
    }

    private static Expression<Func<Order, OrderDto>> MapOrderDto()
    {
        return o => new OrderDto
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
            Subtotal = o.Subtotal,
            Tax = o.Tax,
            Total = o.Total,
            Note = o.Note,
            PickupName = o.PickupName,
            Items = o.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                MenuItemId = oi.MenuItemId,
                MenuItemName = oi.MenuItemName,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                LineTotal = oi.LineTotal,
                ItemNote = oi.ItemNote
            }).ToList(),
            ReceiptUrl = o.Receipt != null ? o.Receipt.ReceiptUrl : null
        };
    }
}
