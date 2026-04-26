using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;

namespace Selu383.SP26.Api.Features.Locations;

public interface ILocationAccessService
{
    Task<List<int>> GetAccessibleLocationIdsAsync(ClaimsPrincipal user);
    Task<bool> CanAccessLocationAsync(ClaimsPrincipal user, int locationId);
}

public class LocationAccessService : ILocationAccessService
{
    private readonly DataContext _context;

    public LocationAccessService(DataContext context)
    {
        _context = context;
    }

    public async Task<List<int>> GetAccessibleLocationIdsAsync(ClaimsPrincipal user)
    {
        if (user.IsInRole(RoleNames.Admin))
        {
            return await _context.Locations.Select(x => x.Id).ToListAsync();
        }

        var currentUserId = user.GetCurrentUserId();
        if (!currentUserId.HasValue)
        {
            return new List<int>();
        }

        if (user.IsInRole(RoleNames.Manager))
        {
            return await _context.Locations
                .Where(x => x.ManagerId == currentUserId.Value)
                .Select(x => x.Id)
                .ToListAsync();
        }

        if (user.IsInRole(RoleNames.Staff))
        {
            var staffLocationId = await _context.Users
                .Where(x => x.Id == currentUserId.Value)
                .Select(x => x.LocationId)
                .FirstOrDefaultAsync();

            return staffLocationId > 0 ? new List<int> { staffLocationId } : new List<int>();
        }

        return new List<int>();
    }

    public async Task<bool> CanAccessLocationAsync(ClaimsPrincipal user, int locationId)
    {
        if (user.IsInRole(RoleNames.Admin))
        {
            return true;
        }

        var allowedLocationIds = await GetAccessibleLocationIdsAsync(user);
        return allowedLocationIds.Contains(locationId);
    }
}