using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Auth;

public class UpdateUserDto
{
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

    public int? LocationId { get; set; }
}

public class ResetUserPasswordDto
{
    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
