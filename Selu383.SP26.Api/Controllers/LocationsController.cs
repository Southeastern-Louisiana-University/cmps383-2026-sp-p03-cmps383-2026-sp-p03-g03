using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;

namespace Selu383.SP26.Api.Controllers;

[Route("api/locations")]
[ApiController]
public class LocationsController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<LocationGetDto>>> GetAll()
    {
        var result = await dataContext.Set<Location>()
            .Select(x => new LocationGetDto
            {
                Id = x.Id,
                Name = x.Name,
                Type = x.Type,
                Phone = x.Phone,
                Address = x.Address,
                City = x.City,
                State = x.State,
                Zip = x.Zip,
                OpeningTime = x.OpeningTime,
                ClosingTime = x.ClosingTime,
                LayoutJson = x.LayoutJson,
                IsActive = x.IsActive,
                TableCount = x.TableCount,
                ManagerId = x.ManagerId,
                ManagerDisplayName = x.Manager != null
                    ? (x.Manager.DisplayName ?? x.Manager.UserName)
                    : null
            })
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LocationGetDto>> GetById(int id)
    {
        var result = await dataContext.Set<Location>()
            .Where(x => x.Id == id)
            .Select(x => new LocationGetDto
            {
                Id = x.Id,
                Name = x.Name,
                Type = x.Type,
                Phone = x.Phone,
                Address = x.Address,
                City = x.City,
                State = x.State,
                Zip = x.Zip,
                OpeningTime = x.OpeningTime,
                ClosingTime = x.ClosingTime,
                LayoutJson = x.LayoutJson,
                IsActive = x.IsActive,
                TableCount = x.TableCount,
                ManagerId = x.ManagerId,
                ManagerDisplayName = x.Manager != null
                    ? (x.Manager.DisplayName ?? x.Manager.UserName)
                    : null
            })
            .FirstOrDefaultAsync();

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<LocationGetDto>> Create([FromBody] LocationCrudDto dto)
    {
        var location = new Location
        {
            Name = dto.Name.Trim(),
            Type = dto.Type.Trim(),
            Phone = dto.Phone?.Trim(),
            Address = dto.Address.Trim(),
            City = dto.City?.Trim(),
            State = dto.State?.Trim(),
            Zip = dto.Zip?.Trim(),
            OpeningTime = dto.OpeningTime,
            ClosingTime = dto.ClosingTime,
            LayoutJson = dto.LayoutJson,
            IsActive = dto.IsActive,
            TableCount = dto.TableCount,
            ManagerId = dto.ManagerId
        };

        dataContext.Set<Location>().Add(location);
        await dataContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = location.Id }, new LocationGetDto
        {
            Id = location.Id,
            Name = location.Name,
            Type = location.Type,
            Phone = location.Phone,
            Address = location.Address,
            City = location.City,
            State = location.State,
            Zip = location.Zip,
            OpeningTime = location.OpeningTime,
            ClosingTime = location.ClosingTime,
            LayoutJson = location.LayoutJson,
            IsActive = location.IsActive,
            TableCount = location.TableCount,
            ManagerId = location.ManagerId
        });
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<LocationGetDto>> Update(int id, [FromBody] LocationCrudDto dto)
    {
        var location = await dataContext.Set<Location>().FirstOrDefaultAsync(x => x.Id == id);
        if (location == null)
            return NotFound();

        if (!User.IsInRole(RoleNames.Admin) && User.GetCurrentUserId() != location.ManagerId)
            return Forbid();

        location.Name = dto.Name.Trim();
        location.Type = dto.Type.Trim();
        location.Phone = dto.Phone?.Trim();
        location.Address = dto.Address.Trim();
        location.City = dto.City?.Trim();
        location.State = dto.State?.Trim();
        location.Zip = dto.Zip?.Trim();
        location.OpeningTime = dto.OpeningTime;
        location.ClosingTime = dto.ClosingTime;
        location.LayoutJson = dto.LayoutJson;
        location.IsActive = dto.IsActive;
        location.TableCount = dto.TableCount;
        location.ManagerId = dto.ManagerId;

        await dataContext.SaveChangesAsync();

        return await GetById(id);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> Delete(int id)
    {
        var location = await dataContext.Set<Location>()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (location == null)
            return NotFound();

        if (!User.IsInRole(RoleNames.Admin) && User.GetCurrentUserId() != location.ManagerId)
            return Forbid();

        dataContext.Set<Location>().Remove(location);
        await dataContext.SaveChangesAsync();

        return Ok();
    }
}
