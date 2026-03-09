namespace Selu383.SP26.Api.Features.Auth;

public class UserDto
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;

    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? DisplayName { get; set; }

    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }

    public string[] Roles { get; set; } = Array.Empty<string>();
}