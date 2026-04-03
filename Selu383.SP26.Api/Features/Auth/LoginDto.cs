using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Auth;

public class LoginDto
{
    [Required]
    [MaxLength(100)]
    public string UserName { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
