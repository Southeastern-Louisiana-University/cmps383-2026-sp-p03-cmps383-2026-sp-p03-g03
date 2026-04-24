using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Menu;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/menu")]
public class MenuController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILocationAccessService _locationAccessService;

    public MenuController(DataContext context, ILocationAccessService locationAccessService)
    {
        _context = context;
        _locationAccessService = locationAccessService;
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

        var overrides = await _context.MenuItemLocationOverrides
            .Where(o => o.LocationId == locationId)
            .ToDictionaryAsync(o => o.MenuItemId);

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

        var result = categories.Select(c => new
        {
            c.Id,
            c.LocationIds,
            c.Name,
            c.IsSeasonal,
            c.IsActive,
            Items = c.Items.Select(i =>
            {
                if (overrides.TryGetValue(i.Id, out var ov))
                {
                    return new MenuItemDto
                    {
                        Id = i.Id,
                        CategoryId = i.CategoryId,
                        Name = i.Name,
                        Description = i.Description,
                        BasePrice = i.BasePrice,
                        IsAvailable = ov.IsAvailable,
                        UnavailableReason = ov.UnavailableReason
                    };
                }
                return i;
            }).ToList()
        }).ToList();

        return Ok(result);
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
        var category = await _context.MenuCategories
            .Include(c => c.MenuCategoryLocations)
            .FirstOrDefaultAsync(c => c.Id == dto.CategoryId);

        if (category == null)
            return BadRequest("Invalid category.");

        if (dto.LocationId.HasValue)
        {
            var locationId = dto.LocationId.Value;

            if (!await _locationAccessService.CanAccessLocationAsync(User, locationId))
                return StatusCode(403, "You do not have access to this location.");

            if (!category.MenuCategoryLocations.Any(link => link.LocationId == locationId))
                return BadRequest("Selected category is not available at this location.");
        }
        else if (User.IsInRole(RoleNames.Manager) && !User.IsInRole(RoleNames.Admin))
        {
            return BadRequest("Managers must select a location when creating menu items.");
        }

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

        if (dto.LocationId.HasValue)
        {
            var scopedLocationId = dto.LocationId.Value;
            var otherLocationIds = category.MenuCategoryLocations
                .Select(link => link.LocationId)
                .Where(locationId => locationId != scopedLocationId)
                .Distinct()
                .ToList();

            foreach (var otherLocationId in otherLocationIds)
            {
                _context.MenuItemLocationOverrides.Add(new MenuItemLocationOverride
                {
                    MenuItemId = item.Id,
                    LocationId = otherLocationId,
                    IsAvailable = false,
                    UnavailableReason = "Not offered at this location.",
                    DisabledAt = DateTime.UtcNow,
                    DisabledByUserId = User.GetCurrentUserId()
                });
            }

            if (otherLocationIds.Count > 0)
            {
                await _context.SaveChangesAsync();
            }
        }

        return Ok(MapItem(item));
    }

    [HttpPut("items/{id:int}")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<MenuItemDto>> UpdateItem(int id, [FromBody] UpdateMenuItemDto dto)
    {
        var item = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
            return NotFound("Menu item not found.");

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

    [HttpDelete("items/{id:int}")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult> DeleteItem(int id)
    {
        var item = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
            return NotFound("Menu item not found.");

        _context.MenuItems.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Menu item deleted successfully." });
    }

    [HttpPost("items/{id:int}/disable")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<MenuItemDto>> DisableItem(int id, [FromBody] DisableMenuItemDto dto)
    {
        if (User.IsInRole(RoleNames.Manager) && !User.IsInRole(RoleNames.Admin))
            return StatusCode(403, "Managers must use location-specific availability controls.");

        var item = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
            return NotFound("Menu item not found.");

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
        if (User.IsInRole(RoleNames.Manager) && !User.IsInRole(RoleNames.Admin))
            return StatusCode(403, "Managers must use location-specific availability controls.");

        var item = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
            return NotFound("Menu item not found.");

        item.IsAvailable = true;
        item.UnavailableReason = null;
        item.DisabledAt = null;
        item.DisabledByUserId = null;

        await _context.SaveChangesAsync();

        return Ok(MapItem(item));
    }

    [HttpGet("items/location/{locationId:int}/availability")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<List<MenuItemAvailabilityDto>>> GetLocationAvailability(int locationId)
    {
        if (!await _locationAccessService.CanAccessLocationAsync(User, locationId))
            return StatusCode(403, "You do not have access to this location.");

        var locationExists = await _context.Locations.AnyAsync(l => l.Id == locationId);
        if (!locationExists)
            return NotFound("Location not found.");

        var overrides = await _context.MenuItemLocationOverrides
            .Where(o => o.LocationId == locationId)
            .ToDictionaryAsync(o => o.MenuItemId);

        var items = await _context.MenuItems
            .Where(i => i.Category!.MenuCategoryLocations.Any(mcl => mcl.LocationId == locationId))
            .OrderBy(i => i.Name)
            .Select(i => new { i.Id, i.CategoryId, i.Name, i.BasePrice, i.IsAvailable, i.UnavailableReason })
            .ToListAsync();

        var result = items.Select(i =>
        {
            var hasOverride = overrides.TryGetValue(i.Id, out var ov);
            return new MenuItemAvailabilityDto
            {
                MenuItemId = i.Id,
                CategoryId = i.CategoryId,
                Name = i.Name,
                BasePrice = i.BasePrice,
                LocationId = locationId,
                IsAvailable = hasOverride ? ov!.IsAvailable : i.IsAvailable,
                UnavailableReason = hasOverride ? ov!.UnavailableReason : i.UnavailableReason,
                IsOverridden = hasOverride
            };
        }).ToList();

        return Ok(result);
    }

    [HttpPost("items/{id:int}/location/{locationId:int}/disable")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<MenuItemAvailabilityDto>> DisableItemAtLocation(int id, int locationId, [FromBody] DisableMenuItemDto dto)
    {
        if (!await _locationAccessService.CanAccessLocationAsync(User, locationId))
            return StatusCode(403, "You do not have access to this location.");

        var item = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
            return NotFound("Menu item not found.");

        var locationExists = await _context.Locations.AnyAsync(l => l.Id == locationId);
        if (!locationExists)
            return NotFound("Location not found.");

        var existing = await _context.MenuItemLocationOverrides
            .FirstOrDefaultAsync(o => o.MenuItemId == id && o.LocationId == locationId);

        if (existing != null)
        {
            existing.IsAvailable = false;
            existing.UnavailableReason = dto.Reason.Trim();
            existing.DisabledAt = DateTime.UtcNow;
            existing.DisabledByUserId = User.GetCurrentUserId();
        }
        else
        {
            _context.MenuItemLocationOverrides.Add(new MenuItemLocationOverride
            {
                MenuItemId = id,
                LocationId = locationId,
                IsAvailable = false,
                UnavailableReason = dto.Reason.Trim(),
                DisabledAt = DateTime.UtcNow,
                DisabledByUserId = User.GetCurrentUserId()
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new MenuItemAvailabilityDto
        {
            MenuItemId = item.Id,
            CategoryId = item.CategoryId,
            Name = item.Name,
            BasePrice = item.BasePrice,
            LocationId = locationId,
            IsAvailable = false,
            UnavailableReason = dto.Reason.Trim(),
            IsOverridden = true
        });
    }

    [HttpPost("items/{id:int}/location/{locationId:int}/enable")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<MenuItemAvailabilityDto>> EnableItemAtLocation(int id, int locationId)
    {
        if (!await _locationAccessService.CanAccessLocationAsync(User, locationId))
            return StatusCode(403, "You do not have access to this location.");

        var item = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (item == null)
            return NotFound("Menu item not found.");

        var locationExists = await _context.Locations.AnyAsync(l => l.Id == locationId);
        if (!locationExists)
            return NotFound("Location not found.");

        var existing = await _context.MenuItemLocationOverrides
            .FirstOrDefaultAsync(o => o.MenuItemId == id && o.LocationId == locationId);

        if (existing != null)
        {
            existing.IsAvailable = true;
            existing.UnavailableReason = null;
            existing.DisabledAt = null;
            existing.DisabledByUserId = null;
        }
        else
        {
            _context.MenuItemLocationOverrides.Add(new MenuItemLocationOverride
            {
                MenuItemId = id,
                LocationId = locationId,
                IsAvailable = true,
                UnavailableReason = null,
                DisabledAt = null,
                DisabledByUserId = null
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new MenuItemAvailabilityDto
        {
            MenuItemId = item.Id,
            CategoryId = item.CategoryId,
            Name = item.Name,
            BasePrice = item.BasePrice,
            LocationId = locationId,
            IsAvailable = true,
            UnavailableReason = null,
            IsOverridden = true
        });
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