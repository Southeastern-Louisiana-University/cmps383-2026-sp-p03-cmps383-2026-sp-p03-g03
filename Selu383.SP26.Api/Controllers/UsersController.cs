using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Selu383.SP26.Api.Features.Auth;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> userManager;
    private readonly RoleManager<Role> roleManager;

    public UsersController(UserManager<User> userManager, RoleManager<Role> roleManager)
    {
        this.userManager = userManager;
        this.roleManager = roleManager;
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto dto)
    {
        using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

        var requestedRoles = dto.Roles.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
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
            PhoneNumber = dto.PhoneNumber?.Trim()
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
            Roles = requestedRoles
        });
    }
}
