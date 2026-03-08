using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    public IQueryable<LocationGetDto> GetAll()
    {
        return dataContext.Set<Location>()
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
            });
    }

    [HttpGet("{id}")]
    public ActionResult<LocationGetDto> GetById(int id)
    {
        var result = dataContext.Set<Location>()
            .FirstOrDefault(x => x.Id == id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(new LocationGetDto
        {
            Id = result.Id,
            Name = result.Name,
            Type = result.Type,
            Phone = result.Phone,
            Address = result.Address,
            City = result.City,
            State = result.State,
            Zip = result.Zip,
            OpeningTime = result.OpeningTime,
            ClosingTime = result.ClosingTime,
            LayoutJson = result.LayoutJson,
            IsActive = result.IsActive,
            TableCount = result.TableCount,
            ManagerId = result.ManagerId,
            Manager = result.Manager
        });
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public ActionResult<LocationCrudDto> Create(LocationCrudDto dto)
    {
        if (dto.TableCount < 1)
        {
            return BadRequest();
        }

        var location = new Location
        {
            Name = dto.Name,
            Type = dto.Type,
            Phone = dto.Phone,
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            Zip = dto.Zip,
            OpeningTime = dto.OpeningTime,
            ClosingTime = dto.ClosingTime,
            LayoutJson = dto.LayoutJson,
            IsActive = dto.IsActive,
            TableCount = dto.TableCount,
            ManagerId = dto.ManagerId
        };

        dataContext.Set<Location>().Add(location);
        dataContext.SaveChanges();

        return CreatedAtAction(nameof(GetById), new { id = location.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize]
    public ActionResult<LocationGetDto> Update(int id, LocationCrudDto dto)
    {
        if (dto.TableCount < 1)
        {
            return BadRequest();
        }

        var location = dataContext.Set<Location>()
            .FirstOrDefault(x => x.Id == id);

        if (location == null)
        {
            return NotFound();
        }

        if (!User.IsInRole(RoleNames.Admin) && User.GetCurrentUserId() != location.ManagerId)
        {
            return Forbid();
        }

        location.Name = dto.Name;
        location.Type = dto.Type;
        location.Phone = dto.Phone;
        location.Address = dto.Address;
        location.City = dto.City;
        location.State = dto.State;
        location.Zip = dto.Zip;
        location.OpeningTime = dto.OpeningTime;
        location.ClosingTime = dto.ClosingTime;
        location.LayoutJson = dto.LayoutJson;
        location.IsActive = dto.IsActive;
        location.TableCount = dto.TableCount;
        location.ManagerId = dto.ManagerId;
        location.Manager = dto.Manager;

        dataContext.SaveChanges();

        return Ok(new LocationGetDto
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
            ManagerId = location.ManagerId,
            Manager = location.Manager
        });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public ActionResult Delete(int id)
    {
        var location = dataContext.Set<Location>()
            .FirstOrDefault(x => x.Id == id);

        if (location == null)
        {
            return NotFound();
        }

        if (!User.IsInRole(RoleNames.Admin) && User.GetCurrentUserId() != location.ManagerId)
        {
            return Forbid();
        }

        dataContext.Set<Location>().Remove(location);
        dataContext.SaveChanges();

        return Ok();
    }
}
