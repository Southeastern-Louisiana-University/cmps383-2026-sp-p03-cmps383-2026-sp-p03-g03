using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Auth;

public class CreateUserDto
{
    [Required]
    public string UserName { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? DisplayName { get; set; }

    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }

    [Required, MinLength(1)]
    public string[] Roles { get; set; } = Array.Empty<string>();
}