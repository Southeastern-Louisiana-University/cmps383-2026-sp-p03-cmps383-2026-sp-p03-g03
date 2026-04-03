using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Menu;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/menu")]
public class MenuController : ControllerBase
{
    private readonly DataContext _context;

    public MenuController(DataContext context)
    {
        _context = context;
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<MenuCategoryDto>>> GetCategories()
    {
        var categories = await _context.MenuCategories
            .Include(c => c.MenuCategoryLocations)
            .Select(c => new MenuCategoryDto
            {
                Id = c.Id,
                LocationIds = c.MenuCategoryLocations
                    .Select(x => x.LocationId)
                    .OrderBy(x => x)
                    .ToList(),
                Name = c.Name,
                IsSeasonal = c.IsSeasonal,
                IsActive = c.IsActive
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("items")]
    public async Task<ActionResult<List<MenuItemDto>>> GetItems()
    {
        var items = await _context.MenuItems
            .Select(i => new MenuItemDto
            {
                Id = i.Id,
                CategoryId = i.CategoryId,
                Name = i.Name,
                Description = i.Description,
                BasePrice = i.BasePrice,
                IsAvailable = i.IsAvailable,
                UnavailableReason = i.UnavailableReason
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("location/{locationId:int}")]
    public async Task<ActionResult<object>> GetMenuByLocation(int locationId)
    {
        var locationExists = await _context.Locations.AnyAsync(l => l.Id == locationId);
        if (!locationExists)
            return NotFound("Location not found.");

        var categories = await _context.MenuCategories
            .Where(c => c.IsActive && c.MenuCategoryLocations.Any(mcl => mcl.LocationId == locationId))
            .Include(c => c.MenuItems)
            .Include(c => c.MenuCategoryLocations)
            .OrderByDescending(c => c.IsSeasonal)
            .ThenBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                LocationIds = c.MenuCategoryLocations
                    .Select(x => x.LocationId)
                    .OrderBy(x => x)
                    .ToList(),
                c.Name,
                c.IsSeasonal,
                c.IsActive,
                Items = c.MenuItems
                    .Where(i => i.IsAvailable)
                    .OrderBy(i => i.Name)
                    .Select(i => new MenuItemDto
                    {
                        Id = i.Id,
                        CategoryId = i.CategoryId,
                        Name = i.Name,
                        Description = i.Description,
                        BasePrice = i.BasePrice,
                        IsAvailable = i.IsAvailable,
                        UnavailableReason = i.UnavailableReason
                    })
                    .ToList()
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpPost("categories")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<MenuCategoryDto>> CreateCategory([FromBody] CreateMenuCategoryDto dto)
    {
        var distinctLocationIds = dto.LocationIds
            .Distinct()
            .ToList();

        var validLocationCount = await _context.Locations
            .CountAsync(l => distinctLocationIds.Contains(l.Id));

        if (validLocationCount != distinctLocationIds.Count)
            return BadRequest("One or more location IDs are invalid.");

        var category = new MenuCategory
        {
            Name = dto.Name.Trim(),
            IsSeasonal = dto.IsSeasonal,
            IsActive = dto.IsActive
        };

        _context.MenuCategories.Add(category);
        await _context.SaveChangesAsync();

        foreach (var locationId in distinctLocationIds)
        {
            _context.MenuCategoryLocations.Add(new MenuCategoryLocation
            {
                MenuCategoryId = category.Id,
                LocationId = locationId
            });
        }

        await _context.SaveChangesAsync();

        var result = new MenuCategoryDto
        {
            Id = category.Id,
            LocationIds = distinctLocationIds,
            Name = category.Name,
            IsSeasonal = category.IsSeasonal,
            IsActive = category.IsActive
        };

        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, result);
    }

    [HttpPost("items")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<MenuItemDto>> CreateItem([FromBody] CreateMenuItemDto dto)
    {
        var categoryExists = await _context.MenuCategories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
            return BadRequest("Invalid category.");

        var item = new MenuItem
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            BasePrice = dto.BasePrice,
            IsAvailable = dto.IsAvailable
        };

        _context.MenuItems.Add(item);
        await _context.SaveChangesAsync();

        return Ok(MapItem(item));
    }

    [HttpPut("items/{id:int}")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<MenuItemDto>> UpdateItem(int id, [FromBody] UpdateMenuItemDto dto)
    {
        var item = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
            return NotFound();

        item.Name = dto.Name.Trim();
        item.Description = dto.Description?.Trim();
        item.BasePrice = dto.BasePrice;
        item.IsAvailable = dto.IsAvailable;

        if (item.IsAvailable)
        {
            item.UnavailableReason = null;
            item.DisabledAt = null;
            item.DisabledByUserId = null;
        }

        await _context.SaveChangesAsync();

        return Ok(MapItem(item));
    }

    [HttpPost("items/{id:int}/disable")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<MenuItemDto>> DisableItem(int id, [FromBody] DisableMenuItemDto dto)
    {
        var item = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
            return NotFound();

        item.IsAvailable = false;
        item.UnavailableReason = dto.Reason.Trim();
        item.DisabledAt = DateTime.UtcNow;
        item.DisabledByUserId = User.GetCurrentUserId();

        await _context.SaveChangesAsync();

        return Ok(MapItem(item));
    }

    [HttpPost("items/{id:int}/enable")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<MenuItemDto>> EnableItem(int id)
    {
        var item = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
            return NotFound();

        item.IsAvailable = true;
        item.UnavailableReason = null;
        item.DisabledAt = null;
        item.DisabledByUserId = null;

        await _context.SaveChangesAsync();

        return Ok(MapItem(item));
    }

    private static MenuItemDto MapItem(MenuItem item)
    {
        return new MenuItemDto
        {
            Id = item.Id,
            CategoryId = item.CategoryId,
            Name = item.Name,
            Description = item.Description,
            BasePrice = item.BasePrice,
            IsAvailable = item.IsAvailable,
            UnavailableReason = item.UnavailableReason
        };
    }
}