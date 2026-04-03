namespace Selu383.SP26.Api.Features.Orders;

public static class OrderTypes
{
    public const string Pickup = "Pickup";
    public const string InStore = "InStore";
    public const string DriveThru = "DriveThru";
    public const string CoverCharge = "CoverCharge";
}

public static class OrderStatuses
{
    public const string Placed = "Placed";
    public const string Confirmed = "Confirmed";
    public const string Preparing = "Preparing";
    public const string Ready = "Ready";
    public const string Completed = "Completed";
    public const string Cancelled = "Cancelled";
}

public static class PaymentStatuses
{
    public const string Unpaid = "Unpaid";
    public const string Pending = "Pending";
    public const string Paid = "Paid";
    public const string Removed = "Removed";
    public const string Refunded = "Refunded";
    public const string Failed = "Failed";
}
