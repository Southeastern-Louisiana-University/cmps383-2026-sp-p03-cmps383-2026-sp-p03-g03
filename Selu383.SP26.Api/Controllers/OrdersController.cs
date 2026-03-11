using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Receipts;
using Selu383.SP26.Api.Extensions; // Added for GetUserId()

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ReceiptPdfService _receiptPdfService;
    private readonly BlobStorageService _blobStorageService;

    public OrdersController(
        DataContext context,
        ReceiptPdfService receiptPdfService,
        BlobStorageService blobStorageService)
    {
        _context = context;
        _receiptPdfService = receiptPdfService;
        _blobStorageService = blobStorageService;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound();

        var dto = new OrderDto
        {
            Id = order.Id,
            LocationId = order.LocationId,
            CreatedByUserId = order.CreatedByUserId,
            OrderCode = order.OrderCode,
            OrderType = order.OrderType,
            Status = order.Status,
            PaymentStatus = order.PaymentStatus,
            OrderTime = order.OrderTime,
            Total = order.Total,
            Note = order.Note,
            PickupName = order.PickupName,
            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                MenuItemId = oi.MenuItemId,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                LineTotal = oi.LineTotal,
                ItemNote = oi.ItemNote
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto dto)
    {
        if (dto.Items == null || dto.Items.Count == 0)
            return BadRequest("Order must contain at least one item.");

        var locationExists = await _context.Locations.AnyAsync(l => l.Id == dto.LocationId);
        if (!locationExists)
            return BadRequest("Invalid location.");

        var createdByUserId = User.GetCurrentUserId() ?? 1; 

        var menuItemIds = dto.Items.Select(i => i.MenuItemId).Distinct().ToList();

        var menuItems = await _context.MenuItems
            .Where(m => menuItemIds.Contains(m.Id) && m.IsAvailable)
            .ToDictionaryAsync(m => m.Id);

        if (menuItems.Count != menuItemIds.Count)
            return BadRequest("One or more menu items are invalid or unavailable.");

        var order = new Order
        {
            LocationId = dto.LocationId,
            CreatedByUserId = createdByUserId,
            OrderCode = $"ORD{DateTime.UtcNow:yyyyMMddHHmmss}",
            OrderType = dto.OrderType,
            Status = "Placed",
            PaymentStatus = "Unpaid",
            OrderTime = DateTime.UtcNow,
            Note = dto.Note,
            PickupName = dto.PickupName
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
                Quantity = quantity,
                UnitPrice = unitPrice,
                LineTotal = lineTotal,
                ItemNote = item.ItemNote
            });
        }

        order.Total = order.OrderItems.Sum(i => i.LineTotal);

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var result = new OrderDto
        {
            Id = order.Id,
            LocationId = order.LocationId,
            CreatedByUserId = order.CreatedByUserId,
            OrderCode = order.OrderCode,
            OrderType = order.OrderType,
            Status = order.Status,
            PaymentStatus = order.PaymentStatus,
            OrderTime = order.OrderTime,
            Total = order.Total,
            Note = order.Note,
            PickupName = order.PickupName,
            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                MenuItemId = oi.MenuItemId,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                LineTotal = oi.LineTotal,
                ItemNote = oi.ItemNote
            }).ToList()
        };

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, result);
    }

    [HttpGet("{id:int}/receiptpdf")]
    public async Task<IActionResult> GetReceiptPdf(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound();

        var pdfBytes = _receiptPdfService.GenerateReceipt(order);

        return File(pdfBytes, "application/pdf", $"order{order.Id}receipt.pdf");
    }

    [HttpPost("{id:int}/archivereceipt")]
    public async Task<ActionResult<object>> ArchiveReceipt(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound();

        var pdfBytes = _receiptPdfService.GenerateReceipt(order);

        var fileName = $"receipts/order{order.Id}{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        var blobUrl = await _blobStorageService.UploadReceiptAsync(pdfBytes, fileName);

        return Ok(new
        {
            orderId = order.Id,
            receiptUrl = blobUrl
        });
    }
}