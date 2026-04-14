using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/authentication")]
public class AuthenticationController : ControllerBase
{
    private readonly SignInManager<User> signInManager;
    private readonly UserManager<User> userManager;

    public AuthenticationController(
        SignInManager<User> signInManager,
        UserManager<User> userManager)
    {
        this.signInManager = signInManager;
        this.userManager = userManager;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Me()
    {
        var username = User.GetCurrentUserName();
        var resultDto = await GetUserDto(userManager.Users)
            .SingleAsync(x => x.UserName == username);

        return Ok(resultDto);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto dto)
    {
        var user = await userManager.FindByNameAsync(dto.UserName);
        if (user == null)
            return Unauthorized(new { message = "Invalid username or password." });

        var result = await signInManager.CheckPasswordSignInAsync(user, dto.Password, true);
        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid username or password." });

        await signInManager.SignInAsync(user, false);

        var resultDto = await GetUserDto(userManager.Users)
            .SingleAsync(x => x.UserName == user.UserName);

        return Ok(resultDto);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<UserDto>> Register([FromBody] RegisterDto dto)
    {
        var userName = dto.UserName.Trim();

        var existingUser = await userManager.FindByNameAsync(userName);
        if (existingUser != null)
            return BadRequest(new { message = "Username is already taken." });

        var user = new User
        {
            UserName = userName,
            FirstName = dto.FirstName?.Trim(),
            LastName = dto.LastName?.Trim(),
            DisplayName = dto.DisplayName?.Trim(),
            Email = dto.Email?.Trim(),
            PhoneNumber = dto.PhoneNumber?.Trim()
        };

        var createResult = await userManager.CreateAsync(user, dto.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(new
            {
                errors = createResult.Errors.Select(x => x.Description).ToArray()
            });
        }

        await userManager.AddToRoleAsync(user, RoleNames.User);
        await signInManager.SignInAsync(user, false);

        var resultDto = await GetUserDto(userManager.Users)
            .SingleAsync(x => x.UserName == user.UserName);

        return Ok(resultDto);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return Ok();
    }

    private static IQueryable<UserDto> GetUserDto(IQueryable<User> users)
    {
        return users.Select(x => new UserDto
        {
            Id = x.Id,
            UserName = x.UserName!,
            FirstName = x.FirstName,
            LastName = x.LastName,
            DisplayName = x.DisplayName,
            Email = x.Email,
            PhoneNumber = x.PhoneNumber,
            LocationId = x.LocationId,
            Roles = x.UserRoles.Select(y => y.Role.Name!).ToArray(),
            LoyaltyPoints = x.LoyaltyPoints
        });
    }
}
