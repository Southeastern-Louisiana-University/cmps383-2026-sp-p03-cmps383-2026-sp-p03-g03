namespace Selu383.SP26.Api.Features.Auth;

public static class RoleNames
{
    public const string Admin = nameof(Admin);
    public const string Manager = nameof(Manager);
    public const string Staff = nameof(Staff);
    public const string Customer = nameof(Customer);

    // Backward-compatible alias for older code/seed data.
    public const string User = nameof(Customer);
}
