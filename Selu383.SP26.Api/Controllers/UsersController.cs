using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;

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
}
