using System.Linq.Expressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Payments;
using Selu383.SP26.Api.Features.Reservations;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/reservations")]
public class ReservationsController : ControllerBase
{
    private const decimal ReservationCoverChargeAmount = 5.00m;

    private readonly DataContext _context;
    private readonly StripePaymentService _stripePaymentService;

    public ReservationsController(DataContext context, StripePaymentService stripePaymentService)
    {
        _context = context;
        _stripePaymentService = stripePaymentService;
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<List<ReservationDto>>> GetMine()
    {
        var userId = User.GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized();

        var reservations = await _context.Reservations
            .Where(x => x.UserId == userId.Value)
            .OrderByDescending(x => x.ReservedFor)
            .Select(MapReservationDto())
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<ActionResult<ReservationDto>> GetById(int id)
    {
        var reservation = await _context.Reservations
            .Where(x => x.Id == id)
            .Select(MapReservationDto())
            .FirstOrDefaultAsync();

        if (reservation == null)
            return NotFound();

        var userId = User.GetCurrentUserId();
        var isPrivileged = User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.Manager) || User.IsInRole(RoleNames.Staff);
        if (!isPrivileged && reservation.UserId != userId)
            return Forbid();

        return Ok(reservation);
    }

    [HttpGet("location/{locationId:int}")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager},{RoleNames.Staff}")]
    public async Task<ActionResult<List<ReservationDto>>> GetByLocation(int locationId)
    {
        var reservations = await _context.Reservations
            .Where(x => x.LocationId == locationId)
            .OrderBy(x => x.ReservedFor)
            .Select(MapReservationDto())
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReservationDto>> Create([FromBody] CreateReservationDto dto)
    {
        var userId = User.GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized();

        var validationMessage = await ValidateReservationRequest(dto.LocationId, dto.TableId, dto.ReservedFor, dto.PartySize);
        if (validationMessage != null)
            return BadRequest(validationMessage);

        var reservationDayStartUtc = dto.ReservedFor.Date;
        var reservationDayEndUtc = reservationDayStartUtc.AddDays(1);

        var hasQualifyingPurchase = await _context.Orders.AnyAsync(x =>
            x.CreatedByUserId == userId.Value &&
            x.LocationId == dto.LocationId &&
            x.OrderType != OrderTypes.CoverCharge &&
            x.PaymentStatus == PaymentStatuses.Paid &&
            x.Subtotal >= 10.00m &&
            x.OrderTime >= reservationDayStartUtc &&
            x.OrderTime < reservationDayEndUtc);

        var hasPaidCoverCharge = await _context.Orders.AnyAsync(x =>
            x.CreatedByUserId == userId.Value &&
            x.LocationId == dto.LocationId &&
            x.OrderType == OrderTypes.CoverCharge &&
            x.PaymentStatus == PaymentStatuses.Paid &&
            x.Note != null &&
            x.Note.Contains($"table {dto.TableId}") &&
            x.Note.Contains($"{dto.ReservedFor:O}"));

        if (!hasQualifyingPurchase && !hasPaidCoverCharge)
        {
            var coverChargeOrder = await _context.Orders
                .Where(x =>
                    x.CreatedByUserId == userId.Value &&
                    x.LocationId == dto.LocationId &&
                    x.OrderType == OrderTypes.CoverCharge &&
                    x.PaymentStatus != PaymentStatuses.Paid &&
                    x.Note != null &&
                    x.Note.Contains($"table {dto.TableId}") &&
                    x.Note.Contains($"{dto.ReservedFor:O}"))
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            if (coverChargeOrder == null)
            {
                coverChargeOrder = new Order
                {
                    LocationId = dto.LocationId,
                    CreatedByUserId = userId.Value,
                    OrderCode = $"COV{DateTime.UtcNow:yyyyMMddHHmmss}",
                    OrderType = OrderTypes.CoverCharge,
                    Status = OrderStatuses.Placed,
                    PaymentStatus = PaymentStatuses.Unpaid,
                    OrderTime = DateTime.UtcNow,
                    Subtotal = ReservationCoverChargeAmount,
                    Tax = 0m,
                    Total = ReservationCoverChargeAmount,
                    Note = $"Reservation cover charge for table {dto.TableId} at {dto.ReservedFor:O}"
                };

                _context.Orders.Add(coverChargeOrder);
                await _context.SaveChangesAsync();
            }

            string? checkoutUrl = null;
            try
            {
                var requestBaseUrl = $"{Request.Scheme}://{Request.Host.Value}";
                checkoutUrl = await _stripePaymentService.CreateCheckoutSessionAsync(coverChargeOrder.Id, requestBaseUrl);
            }
            catch
            {
            }

            return StatusCode(StatusCodes.Status402PaymentRequired, new
            {
                message = "To reserve this table and time, pay the $5.00 non-refundable cover charge. It is waived if you already have a paid food or drink order over $10 at this location today.",
                coverChargeAmount = ReservationCoverChargeAmount,
                coverChargeOrderId = coverChargeOrder.Id,
                checkoutUrl
            });
        }

        var reservation = new Reservation
        {
            LocationId = dto.LocationId,
            UserId = userId.Value,
            TableId = dto.TableId,
            ReservedFor = dto.ReservedFor,
            PartySize = dto.PartySize,
            Status = ReservationStatuses.Confirmed,
            SpecialRequests = dto.SpecialRequests?.Trim()
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, new ReservationDto
        {
            Id = reservation.Id,
            LocationId = reservation.LocationId,
            UserId = reservation.UserId,
            TableId = reservation.TableId,
            ReservedFor = reservation.ReservedFor,
            PartySize = reservation.PartySize,
            Status = reservation.Status,
            SpecialRequests = reservation.SpecialRequests
        });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
    public async Task<ActionResult<ReservationDto>> Update(int id, [FromBody] UpdateReservationDto dto)
    {
        var reservation = await _context.Reservations.FirstOrDefaultAsync(x => x.Id == id);
        if (reservation == null)
            return NotFound();

        var validationMessage = await ValidateReservationRequest(dto.LocationId, dto.TableId, dto.ReservedFor, dto.PartySize, id);
        if (validationMessage != null)
            return BadRequest(validationMessage);

        reservation.LocationId = dto.LocationId;
        reservation.TableId = dto.TableId;
        reservation.ReservedFor = dto.ReservedFor;
        reservation.PartySize = dto.PartySize;
        reservation.Status = dto.Status.Trim();
        reservation.SpecialRequests = dto.SpecialRequests?.Trim();

        await _context.SaveChangesAsync();

        return Ok(new ReservationDto
        {
            Id = reservation.Id,
            LocationId = reservation.LocationId,
            UserId = reservation.UserId,
            TableId = reservation.TableId,
            ReservedFor = reservation.ReservedFor,
            PartySize = reservation.PartySize,
            Status = reservation.Status,
            SpecialRequests = reservation.SpecialRequests
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<ActionResult> Delete(int id)
    {
        var reservation = await _context.Reservations.FirstOrDefaultAsync(x => x.Id == id);
        if (reservation == null)
            return NotFound();

        var userId = User.GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized();

        var isPrivileged = User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.Manager);
        if (!isPrivileged && reservation.UserId != userId.Value)
            return Forbid();

        if (reservation.ReservedFor < DateTime.UtcNow)
            return BadRequest("Cannot cancel a reservation for a past date/time.");

        if (string.Equals(reservation.Status, ReservationStatuses.Cancelled, StringComparison.OrdinalIgnoreCase))
            return BadRequest("Reservation is already cancelled.");

        reservation.Status = ReservationStatuses.Cancelled;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Reservation cancelled." });
    }

    private async Task<string?> ValidateReservationRequest(int locationId, int tableId, DateTime reservedFor, int partySize, int? reservationIdToExclude = null)
    {
        if (partySize < 2 || partySize > 6)
            return "Party size must be between 2 and 6 guests.";

        if (reservedFor < DateTime.UtcNow.AddHours(2))
            return "Reservations must be made at least 2 hours in advance.";

        var location = await _context.Locations.FirstOrDefaultAsync(x => x.Id == locationId);
        if (location == null)
            return "Invalid location.";

        var opening = location.OpeningTime?.ToTimeSpan() ?? new TimeSpan(6, 0, 0);
        var closing = location.ClosingTime?.ToTimeSpan() ?? new TimeSpan(18, 0, 0);
        var latestStart = closing.Subtract(TimeSpan.FromHours(2));

        var timeOfDay = reservedFor.TimeOfDay;
        if (timeOfDay < opening || timeOfDay > latestStart)
            return $"Reservations must start between {opening:hh\\:mm} and {latestStart:hh\\:mm} so the 2-hour booking ends by closing.";

        var table = await _context.Tables.FirstOrDefaultAsync(x => x.Id == tableId);
        if (table == null)
            return "Invalid table.";

        if (table.LocationId != locationId)
            return "Table does not belong to this location.";

        if (!table.IsActive)
            return "Table is not active.";

        if (table.IsBarSeat)
            return "Individual bar seats cannot be reserved.";

        if (partySize > table.Seats)
            return $"Party size exceeds the table's capacity of {table.Seats}.";

        var twoHours = TimeSpan.FromHours(2);
        var earliestBoundary = reservedFor.Subtract(twoHours);
        var latestBoundary = reservedFor.Add(twoHours);

        var conflictingReservation = await _context.Reservations.AnyAsync(x =>
            (reservationIdToExclude == null || x.Id != reservationIdToExclude.Value) &&
            x.TableId == tableId &&
            x.Status != ReservationStatuses.Cancelled &&
            x.ReservedFor > earliestBoundary &&
            x.ReservedFor < latestBoundary);

        if (conflictingReservation)
            return "That table is held for 2 hours per reservation. Please choose a time at least 2 hours before or after an existing booking.";

        return null;
    }

    private static Expression<Func<Reservation, ReservationDto>> MapReservationDto()
    {
        return x => new ReservationDto
        {
            Id = x.Id,
            LocationId = x.LocationId,
            UserId = x.UserId,
            TableId = x.TableId,
            ReservedFor = x.ReservedFor,
            PartySize = x.PartySize,
            Status = x.Status,
            SpecialRequests = x.SpecialRequests
        };
    }
}
