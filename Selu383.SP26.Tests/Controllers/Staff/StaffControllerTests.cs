using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Selu383.SP26.Tests.Controllers.Authentication;
using Selu383.SP26.Tests.Dtos;
using Selu383.SP26.Tests.Helpers;

namespace Selu383.SP26.Tests.Controllers.Staff;

[TestClass]
public class StaffControllerTests
{
    private WebTestContext context = null!;
    private HttpClient webClient = null!;

    [TestInitialize]
    public void Init()
    {
        context = new WebTestContext();
        webClient = context.GetStandardWebClient();
    }

    [TestCleanup]
    public void Cleanup()
    {
        context.Dispose();
    }

    [TestMethod]
    public async Task GetOrders_AsAdmin_Returns200()
    {
        // arrange
        await webClient.AssertLoggedInAsAdmin();

        // act
        var response = await webClient.GetAsync("/api/staff/orders");

        // assert
        response.StatusCode.Should().Be(HttpStatusCode.OK,
            "an admin should be able to access staff orders endpoint");

        var orders = await response.Content.ReadAsJsonAsync<List<StaffOrderDto>>();
        orders.Should().NotBeNull("we expect a list of orders");
    }

    [TestMethod]
    public async Task GetOrders_AsCustomer_Returns403()
    {
        // arrange
        await webClient.AssertLoggedInAsBob();

        // act
        var response = await webClient.GetAsync("/api/staff/orders");

        // assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden,
            "a customer should not be able to access staff orders endpoint");
    }

    [TestMethod]
    public async Task GetOrders_Anonymous_Returns401()
    {
        // act
        var response = await webClient.GetAsync("/api/staff/orders");

        // assert
        new[] { HttpStatusCode.Unauthorized, HttpStatusCode.Redirect }
            .Should().Contain(response.StatusCode,
            "an anonymous user should not be able to access staff orders endpoint");
    }

    [TestMethod]
    public async Task GetAdminUsers_AsAdmin_Returns200WithUsers()
    {
        // arrange
        await webClient.AssertLoggedInAsAdmin();

        // act
        var response = await webClient.GetAsync("/api/staff/admin/users");

        // assert
        response.StatusCode.Should().Be(HttpStatusCode.OK,
            "an admin should be able to access the admin users endpoint");

        var users = await response.Content.ReadAsJsonAsync<List<AdminUserDto>>();
        users.Should().NotBeNull("we expect a list of users");
        users!.Count.Should().BeGreaterThan(0, "there should be seeded users");
        users.Should().Contain(u => u.UserName == "galkadi",
            "the admin user 'galkadi' should be in the list");
    }

    [TestMethod]
    public async Task GetAdminUsers_AsCustomer_Returns403()
    {
        // arrange
        await webClient.AssertLoggedInAsBob();

        // act
        var response = await webClient.GetAsync("/api/staff/admin/users");

        // assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden,
            "a customer should not be able to access the admin users endpoint");
    }

    [TestMethod]
    public async Task GetDailySummary_AsManager_Returns200()
    {
        // arrange - login as manager1
        var loginResponse = await webClient.PostAsJsonAsync("/api/authentication/login", new LoginDto
        {
            UserName = "manager1",
            Password = AuthenticationHelpers.DefaultUserPassword
        });
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK, "manager1 should be able to log in");

        // act
        var response = await webClient.GetAsync("/api/staff/reports/daily-summary");

        // assert
        response.StatusCode.Should().Be(HttpStatusCode.OK,
            "a manager should be able to access the daily summary endpoint");

        var summary = await response.Content.ReadAsJsonAsync<DailySummaryDto>();
        summary.Should().NotBeNull("we expect a daily summary object");
    }

    [TestMethod]
    public async Task GetDailySummary_AsStaff_Returns403()
    {
        // arrange - login as staff1
        var loginResponse = await webClient.PostAsJsonAsync("/api/authentication/login", new LoginDto
        {
            UserName = "staff1",
            Password = AuthenticationHelpers.DefaultUserPassword
        });
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK, "staff1 should be able to log in");

        // act
        var response = await webClient.GetAsync("/api/staff/reports/daily-summary");

        // assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden,
            "a staff member should not be able to access the daily summary (manager+ only)");
    }
}

internal class StaffOrderDto
{
    public int Id { get; set; }
    public int LocationId { get; set; }
    public int CreatedByUserId { get; set; }
    public string? OrderCode { get; set; }
    public string? OrderType { get; set; }
    public string? Status { get; set; }
    public string? PaymentStatus { get; set; }
    public DateTime OrderTime { get; set; }
    public DateTime? ScheduledPickupTime { get; set; }
    public decimal Total { get; set; }
    public string? PickupName { get; set; }
    public int ItemCount { get; set; }
}

internal class AdminUserDto
{
    public int Id { get; set; }
    public string? UserName { get; set; }
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public List<string>? Roles { get; set; }
    public int LoyaltyPoints { get; set; }
    public DateTime CreatedAt { get; set; }
}

internal class DailySummaryDto
{
    public DateTime Date { get; set; }
    public int TotalOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int CancelledOrders { get; set; }
    public int OpenOrders { get; set; }
    public decimal Revenue { get; set; }
    public List<TopItemDto>? TopItems { get; set; }
}

internal class TopItemDto
{
    public string? MenuItemName { get; set; }
    public int QuantitySold { get; set; }
}
