using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Auth;

public class CreateUserDto
{
    [Required]
    [MaxLength(100)]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? FirstName { get; set; }

    [MaxLength(100)]
    public string? LastName { get; set; }

    [MaxLength(150)]
    public string? DisplayName { get; set; }

    [EmailAddress]
    [MaxLength(256)]
    public string? Email { get; set; }

    [Phone]
    [MaxLength(30)]
    public string? PhoneNumber { get; set; }

    [Required, MinLength(1)]
    public string[] Roles { get; set; } = Array.Empty<string>();
}
