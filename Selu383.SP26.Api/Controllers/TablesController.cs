using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Tables;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/tables")]
public class TablesController : ControllerBase
{
    private readonly DataContext _context;

    public TablesController(DataContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<TableDto>>> GetAll()
    {
        var tables = await _context.Tables
            .Select(x => new TableDto
            {
                Id = x.Id,
                LocationId = x.LocationId,
                TableNumber = x.TableNumber,
                Seats = x.Seats,
                IsActive = x.IsActive
            })
            .ToListAsync();

        return Ok(tables);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TableDto>> GetById(int id)
    {
        var table = await _context.Tables.FirstOrDefaultAsync(x => x.Id == id);

        if (table == null)
            return NotFound();

        return Ok(new TableDto
        {
            Id = table.Id,
            LocationId = table.LocationId,
            TableNumber = table.TableNumber,
            Seats = table.Seats,
            IsActive = table.IsActive
        });
    }

    [HttpGet("location/{locationId:int}")]
    public async Task<ActionResult<List<TableDto>>> GetByLocation(int locationId)
    {
        var locationExists = await _context.Locations.AnyAsync(x => x.Id == locationId);
        if (!locationExists)
            return NotFound("Location not found.");

        var tables = await _context.Tables
            .Where(x => x.LocationId == locationId)
            .Select(x => new TableDto
            {
                Id = x.Id,
                LocationId = x.LocationId,
                TableNumber = x.TableNumber,
                Seats = x.Seats,
                IsActive = x.IsActive
            })
            .ToListAsync();

        return Ok(tables);
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<TableDto>> Create(TableDto dto)
    {
        if (dto.Seats < 1)
            return BadRequest("Seats must be at least 1.");

        var locationExists = await _context.Locations.AnyAsync(x => x.Id == dto.LocationId);
        if (!locationExists)
            return BadRequest("Invalid location.");

       var duplicateTable = await _context.Tables.AnyAsync(x =>
        x.LocationId == dto.LocationId &&
        x.TableNumber == dto.TableNumber);

        if (duplicateTable)
        return BadRequest("Table number already exists for this location.");

        var table = new Table
        {
            LocationId = dto.LocationId,
            TableNumber = dto.TableNumber,
            Seats = dto.Seats,
            IsActive = dto.IsActive
        };

        _context.Tables.Add(table);
        await _context.SaveChangesAsync();

        dto.Id = table.Id;

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<TableDto>> Update(int id, TableDto dto)
    {
        if (dto.Seats < 1)
            return BadRequest("Seats must be at least 1.");

        var table = await _context.Tables.FirstOrDefaultAsync(x => x.Id == id);
        if (table == null)
            return NotFound();

        var locationExists = await _context.Locations.AnyAsync(x => x.Id == dto.LocationId);
        if (!locationExists)
            return BadRequest("Invalid location.");

        var duplicateTable = await _context.Tables.AnyAsync(x =>
            x.Id != id &&
            x.LocationId == dto.LocationId &&
            x.TableNumber == dto.TableNumber);

        if (duplicateTable)
            return BadRequest("Table number already exists for this location.");

        table.LocationId = dto.LocationId;
        table.TableNumber = dto.TableNumber;
        table.Seats = dto.Seats;
        table.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        dto.Id = table.Id;

        return Ok(dto);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult> Delete(int id)
    {
        var table = await _context.Tables.FirstOrDefaultAsync(x => x.Id == id);
        if (table == null)
            return NotFound();

        _context.Tables.Remove(table);
        await _context.SaveChangesAsync();

        return Ok();
    }
}