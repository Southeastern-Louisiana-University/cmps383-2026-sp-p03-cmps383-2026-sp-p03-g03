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

    public UsersController(UserManager<User> userManager)
    {
        this.userManager = userManager;
    }

    [HttpPost]
[Authorize(Roles = RoleNames.Admin)]
public async Task<ActionResult<UserDto>> Create(CreateUserDto dto)
{
    using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

    var newUser = new User
    {
        UserName = dto.UserName,
        FirstName = dto.FirstName,
        LastName = dto.LastName,
        DisplayName = dto.DisplayName,
        Email = dto.Email,
        PhoneNumber = dto.PhoneNumber
    };

    var createResult = await userManager.CreateAsync(newUser, dto.Password);
    if (!createResult.Succeeded)
    {
        return BadRequest();
    }

    try
    {
        var roleResult = await userManager.AddToRolesAsync(newUser, dto.Roles);
        if (!roleResult.Succeeded)
        {
            return BadRequest();
        }
    }
    catch (InvalidOperationException e) when (e.Message.StartsWith("Role") && e.Message.EndsWith("does not exist."))
    {
        return BadRequest();
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
        Roles = dto.Roles
    });
}   
}