using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Reservations;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> userManager;
    private readonly RoleManager<Role> roleManager;
    private readonly DataContext dataContext;

    public UsersController(UserManager<User> userManager, RoleManager<Role> roleManager, DataContext dataContext)
    {
        this.userManager = userManager;
        this.roleManager = roleManager;
        this.dataContext = dataContext;
    }

    [HttpPost]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto dto)
    {
        using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

        var requestedRoles = dto.Roles.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        var includesStaffRole = requestedRoles.Any(x => string.Equals(x, RoleNames.Staff, StringComparison.OrdinalIgnoreCase));

        if (includesStaffRole && !dto.LocationId.HasValue)
            return BadRequest(new { message = "LocationId is required for staff accounts." });

        if (User.IsInRole(RoleNames.Manager))
        {
            if (requestedRoles.Length != 1 || !string.Equals(requestedRoles[0], RoleNames.Staff, StringComparison.OrdinalIgnoreCase))
                return Forbid();

            var managerUserId = User.GetCurrentUserId();
            var locationIsManagedByUser = await dataContext.Set<Location>()
                .AnyAsync(x => x.Id == dto.LocationId!.Value && x.ManagerId == managerUserId);

            if (!locationIsManagedByUser)
                return Forbid();
        }

        foreach (var role in requestedRoles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                return BadRequest(new { message = $"Role '{role}' does not exist." });
        }

        var newUser = new User
        {
            UserName = dto.UserName.Trim(),
            FirstName = dto.FirstName?.Trim(),
            LastName = dto.LastName?.Trim(),
            DisplayName = dto.DisplayName?.Trim(),
            Email = dto.Email?.Trim(),
            PhoneNumber = dto.PhoneNumber?.Trim(),
            LocationId = dto.LocationId ?? 0
        };

        var createResult = await userManager.CreateAsync(newUser, dto.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(new
            {
                errors = createResult.Errors.Select(x => x.Description).ToArray()
            });
        }

        var roleResult = await userManager.AddToRolesAsync(newUser, requestedRoles);
        if (!roleResult.Succeeded)
        {
            return BadRequest(new
            {
                errors = roleResult.Errors.Select(x => x.Description).ToArray()
            });
        }

        transaction.Complete();

        return Ok(new UserDto
        {
            Id = newUser.Id,
            UserName = newUser.UserName!,
            FirstName = newUser.FirstName,
            LastName = newUser.LastName,
            DisplayName = newUser.DisplayName,
            Email = newUser.Email,
            PhoneNumber = newUser.PhoneNumber,
            LocationId = newUser.LocationId,
            Roles = requestedRoles
        });
    }

    [HttpGet("staff")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<IEnumerable<UserDto>>> ListStaff()
    {
        var managerUserId = User.GetCurrentUserId();
        var isAdmin = User.IsInRole(RoleNames.Admin);

        var managedLocationIds = isAdmin
            ? null
            : await dataContext.Set<Location>()
                .Where(x => x.ManagerId == managerUserId)
                .Select(x => x.Id)
                .ToListAsync();

        if (!isAdmin && (managedLocationIds == null || managedLocationIds.Count == 0))
        {
            return Ok(Array.Empty<UserDto>());
        }

        var rolesOfInterest = isAdmin
            ? new[] { RoleNames.Staff, RoleNames.Manager }
            : new[] { RoleNames.Staff };

        var query =
            from user in dataContext.Set<User>()
            join userRole in dataContext.Set<UserRole>() on user.Id equals userRole.UserId
            join role in dataContext.Set<Role>() on userRole.RoleId equals role.Id
            where rolesOfInterest.Contains(role.Name!)
            select new { user, role };

        if (!isAdmin)
        {
            query = query.Where(x => managedLocationIds!.Contains(x.user.LocationId));
        }

        var rows = await query.ToListAsync();

        var grouped = rows
            .GroupBy(x => x.user.Id)
            .Select(g =>
            {
                var u = g.First().user;
                return new { User = u, Roles = g.Select(x => x.role.Name!).Distinct().ToArray() };
            })
            .ToList();

        var locationLookup = await dataContext.Set<Location>()
            .Select(x => new { x.Id, x.Name })
            .ToDictionaryAsync(x => x.Id, x => x.Name);

        var nowUtc = DateTimeOffset.UtcNow;

        var result = grouped.Select(x => new UserDto
        {
            Id = x.User.Id,
            UserName = x.User.UserName!,
            FirstName = x.User.FirstName,
            LastName = x.User.LastName,
            DisplayName = x.User.DisplayName,
            Email = x.User.Email,
            PhoneNumber = x.User.PhoneNumber,
            LocationId = x.User.LocationId,
            LocationName = locationLookup.TryGetValue(x.User.LocationId, out var name) ? name : null,
            Roles = x.Roles,
            LoyaltyPoints = x.User.LoyaltyPoints,
            IsDisabled = x.User.LockoutEnd.HasValue && x.User.LockoutEnd.Value > nowUtc
        })
        .OrderBy(x => x.IsDisabled)
        .ThenBy(x => x.LocationName)
        .ThenBy(x => x.UserName)
        .ToList();

        return Ok(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<UserDto>> Update(int id, [FromBody] UpdateUserDto dto)
    {
        var target = await userManager.FindByIdAsync(id.ToString());
        if (target == null) return NotFound();

        var authError = await EnsureCanManageAsync(target);
        if (authError != null) return authError;

        if (dto.LocationId.HasValue && dto.LocationId.Value != target.LocationId)
        {
            if (!User.IsInRole(RoleNames.Admin))
            {
                var managerUserId = User.GetCurrentUserId();
                var ownsTargetLocation = await dataContext.Set<Location>()
                    .AnyAsync(x => x.Id == dto.LocationId.Value && x.ManagerId == managerUserId);
                if (!ownsTargetLocation) return Forbid();
            }
            target.LocationId = dto.LocationId.Value;
        }

        if (dto.FirstName != null) target.FirstName = dto.FirstName.Trim();
        if (dto.LastName != null) target.LastName = dto.LastName.Trim();
        if (dto.DisplayName != null) target.DisplayName = dto.DisplayName.Trim();
        if (dto.Email != null) target.Email = dto.Email.Trim();
        if (dto.PhoneNumber != null) target.PhoneNumber = dto.PhoneNumber.Trim();
        target.UpdatedAt = DateTime.UtcNow;

        var updateResult = await userManager.UpdateAsync(target);
        if (!updateResult.Succeeded)
        {
            return BadRequest(new { errors = updateResult.Errors.Select(x => x.Description).ToArray() });
        }

        return Ok(await ToDtoAsync(target));
    }

    [HttpPost("{id:int}/disable")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<UserDto>> Disable(int id)
    {
        var target = await userManager.FindByIdAsync(id.ToString());
        if (target == null) return NotFound();

        var authError = await EnsureCanManageAsync(target);
        if (authError != null) return authError;

        if (target.Id == User.GetCurrentUserId())
        {
            return BadRequest(new { message = "You cannot disable your own account." });
        }

        await userManager.SetLockoutEnabledAsync(target, true);
        var lockResult = await userManager.SetLockoutEndDateAsync(target, DateTimeOffset.UtcNow.AddYears(100));
        if (!lockResult.Succeeded)
        {
            return BadRequest(new { errors = lockResult.Errors.Select(x => x.Description).ToArray() });
        }

        return Ok(await ToDtoAsync(target));
    }

    [HttpPost("{id:int}/enable")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<UserDto>> Enable(int id)
    {
        var target = await userManager.FindByIdAsync(id.ToString());
        if (target == null) return NotFound();

        var authError = await EnsureCanManageAsync(target);
        if (authError != null) return authError;

        var unlockResult = await userManager.SetLockoutEndDateAsync(target, null);
        if (!unlockResult.Succeeded)
        {
            return BadRequest(new { errors = unlockResult.Errors.Select(x => x.Description).ToArray() });
        }

        return Ok(await ToDtoAsync(target));
    }

    [HttpPost("{id:int}/reset-password")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult> ResetPassword(int id, [FromBody] ResetUserPasswordDto dto)
    {
        var target = await userManager.FindByIdAsync(id.ToString());
        if (target == null) return NotFound();

        var authError = await EnsureCanManageAsync(target);
        if (authError != null) return authError;

        var token = await userManager.GeneratePasswordResetTokenAsync(target);
        var resetResult = await userManager.ResetPasswordAsync(target, token, dto.NewPassword);
        if (!resetResult.Succeeded)
        {
            return BadRequest(new { errors = resetResult.Errors.Select(x => x.Description).ToArray() });
        }

        return Ok(new { message = "Password updated." });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult> Delete(int id)
    {
        var target = await userManager.FindByIdAsync(id.ToString());
        if (target == null) return NotFound();

        if (target.Id == User.GetCurrentUserId())
        {
            return BadRequest(new { message = "You cannot delete your own account." });
        }

        var authError = await EnsureCanManageAsync(target);
        if (authError != null) return authError;

        var managesLocation = await dataContext.Set<Location>().AnyAsync(x => x.ManagerId == target.Id);
        if (managesLocation)
        {
            return BadRequest(new { message = "This user manages a location. Reassign the location first." });
        }

        var hasOrders = await dataContext.Set<Order>().AnyAsync(x => x.CreatedByUserId == target.Id);
        var hasReservations = await dataContext.Set<Reservation>().AnyAsync(x => x.UserId == target.Id);
        if (hasOrders || hasReservations)
        {
            return BadRequest(new
            {
                message = "This user has order or reservation history. Disable the account instead of deleting."
            });
        }

        var deleteResult = await userManager.DeleteAsync(target);
        if (!deleteResult.Succeeded)
        {
            return BadRequest(new { errors = deleteResult.Errors.Select(x => x.Description).ToArray() });
        }

        return NoContent();
    }

    private async Task<ActionResult?> EnsureCanManageAsync(User target)
    {
        var targetRoles = await userManager.GetRolesAsync(target);
        var isAdmin = User.IsInRole(RoleNames.Admin);
        var callerId = User.GetCurrentUserId();

        if (targetRoles.Contains(RoleNames.Admin)) return Forbid();

        if (isAdmin) return null;

        if (!targetRoles.Contains(RoleNames.Staff)) return Forbid();

        var managesTargetLocation = await dataContext.Set<Location>()
            .AnyAsync(x => x.Id == target.LocationId && x.ManagerId == callerId);

        return managesTargetLocation ? null : Forbid();
    }

    private async Task<UserDto> ToDtoAsync(User target)
    {
        var roles = await userManager.GetRolesAsync(target);
        string? locationName = null;
        if (target.LocationId > 0)
        {
            locationName = await dataContext.Set<Location>()
                .Where(x => x.Id == target.LocationId)
                .Select(x => x.Name)
                .FirstOrDefaultAsync();
        }

        return new UserDto
        {
            Id = target.Id,
            UserName = target.UserName!,
            FirstName = target.FirstName,
            LastName = target.LastName,
            DisplayName = target.DisplayName,
            Email = target.Email,
            PhoneNumber = target.PhoneNumber,
            LocationId = target.LocationId,
            LocationName = locationName,
            Roles = roles.ToArray(),
            LoyaltyPoints = target.LoyaltyPoints,
            IsDisabled = target.LockoutEnd.HasValue && target.LockoutEnd.Value > DateTimeOffset.UtcNow
        };
    }
}
