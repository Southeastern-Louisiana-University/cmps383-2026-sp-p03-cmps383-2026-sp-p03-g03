using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
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
            .Select(c => new MenuCategoryDto
            {
                Id = c.Id,
                LocationIds = c.LocationIds,
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
                IsAvailable = i.IsAvailable
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
            .Where(c => c.LocationIds.Contains(locationId) && c.IsActive)
            .Include(c => c.MenuItems)
            .OrderByDescending(c => c.IsSeasonal)
            .ThenBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                c.LocationIds,
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
                        IsAvailable = i.IsAvailable
                    })
                    .ToList()
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpPost("categories")]
    public async Task<ActionResult<MenuCategoryDto>> CreateCategory(CreateMenuCategoryDto dto)
    {
        var locationExists = await _context.Locations.AnyAsync(l => dto.LocationIds.Contains(l.Id));
        if (!locationExists)
            return BadRequest("Invalid location.");

        var category = new MenuCategory
        {
            LocationIds = dto.LocationIds,
            Name = dto.Name,
            IsSeasonal = dto.IsSeasonal,
            IsActive = dto.IsActive
        };

        _context.MenuCategories.Add(category);
        await _context.SaveChangesAsync();

        var result = new MenuCategoryDto
        {
            Id = category.Id,
            LocationIds = category.LocationIds,
            Name = category.Name,
            IsSeasonal = category.IsSeasonal,
            IsActive = category.IsActive
        };

        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, result);
    }

    [HttpPost("items")]
    public async Task<ActionResult<MenuItemDto>> CreateItem(CreateMenuItemDto dto)
    {
        var categoryExists = await _context.MenuCategories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
            return BadRequest("Invalid category.");

        var item = new MenuItem
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description,
            BasePrice = dto.BasePrice,
            IsAvailable = dto.IsAvailable
        };

        _context.MenuItems.Add(item);
        await _context.SaveChangesAsync();

        var result = new MenuItemDto
        {
            Id = item.Id,
            CategoryId = item.CategoryId,
            Name = item.Name,
            Description = item.Description,
            BasePrice = item.BasePrice,
            IsAvailable = item.IsAvailable
        };

        return CreatedAtAction(nameof(GetItems), new { id = item.Id }, result);
    }
}