using Microsoft.AspNetCore.Identity;

namespace Selu383.SP26.Api.Features.Auth;

public class UserRole : IdentityUserRole<int>
{
    public virtual Role Role { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
