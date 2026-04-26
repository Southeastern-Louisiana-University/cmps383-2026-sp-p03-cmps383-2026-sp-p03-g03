using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Staff;

public class StaffOrderDto
{
    public int Id { get; set; }
    public int LocationId { get; set; }
    public int? CreatedByUserId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string OrderType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime OrderTime { get; set; }
    public DateTime? ScheduledPickupTime { get; set; }
    public decimal Total { get; set; }
    public string? PickupName { get; set; }
    public int ItemCount { get; set; }
}

public class CancelOrderDto
{
    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;
}

public class DailySummaryDto
{
    public DateTime Date { get; set; }
    public int TotalOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int CancelledOrders { get; set; }
    public int OpenOrders { get; set; }
    public decimal Revenue { get; set; }
    public List<TopItemDto> TopItems { get; set; } = new();
}

public class TopItemDto
{
    public string MenuItemName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
}

public class AdminUserDto
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public List<string> Roles { get; set; } = new();
    public int LoyaltyPoints { get; set; }
    public DateTime CreatedAt { get; set; }
}
