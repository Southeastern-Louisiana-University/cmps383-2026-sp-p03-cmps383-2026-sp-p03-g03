using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Reservations;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/reservations")]
public class ReservationsController : ControllerBase
{
    private readonly DataContext _context;

    public ReservationsController(DataContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<ReservationDto>>> GetAll()
    {
        var reservations = await _context.Reservations
            .Select(x => new ReservationDto
            {
                Id = x.Id,
                LocationId = x.LocationId,
                UserId = x.UserId,
                TableId = x.TableId,
                ReservedFor = x.ReservedFor,
                PartySize = x.PartySize,
                Status = x.Status,
                SpecialRequests = x.SpecialRequests
            })
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<ActionResult<ReservationDto>> GetById(int id)
    {
        var reservation = await _context.Reservations.FirstOrDefaultAsync(x => x.Id == id);

        if (reservation == null)
            return NotFound();

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

    [HttpGet("location/{locationId:int}")]
    [Authorize]
    public async Task<ActionResult<List<ReservationDto>>> GetByLocation(int locationId)
    {
        var reservations = await _context.Reservations
            .Where(x => x.LocationId == locationId)
            .Select(x => new ReservationDto
            {
                Id = x.Id,
                LocationId = x.LocationId,
                UserId = x.UserId,
                TableId = x.TableId,
                ReservedFor = x.ReservedFor,
                PartySize = x.PartySize,
                Status = x.Status,
                SpecialRequests = x.SpecialRequests
            })
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReservationDto>> Create(ReservationDto dto)
    {

        if (dto.PartySize < 2 || dto.PartySize > 6)
            return BadRequest("Party size must be between 2 and 6 guests.");


        if (dto.ReservedFor < DateTime.UtcNow.AddHours(2))
            return BadRequest("Reservations must be made at least 2 hours in advance.");


        var timeOfDay = dto.ReservedFor.TimeOfDay;
        if (timeOfDay < new TimeSpan(6, 0, 0) || timeOfDay > new TimeSpan(18, 0, 0))
            return BadRequest("Reservations can only be made between 6:00 AM and 6:00 PM.");

        var locationExists = await _context.Locations.AnyAsync(x => x.Id == dto.LocationId);
        if (!locationExists)
            return BadRequest("Invalid location.");

        var userExists = await _context.Users.AnyAsync(x => x.Id == dto.UserId);
        if (!userExists)
            return BadRequest("Invalid user.");

        var table = await _context.Tables.FirstOrDefaultAsync(x => x.Id == dto.TableId);
        if (table == null)
            return BadRequest("Invalid table.");

        if (table.LocationId != dto.LocationId)
            return BadRequest("Table does not belong to this location.");

        if (!table.IsActive)
            return BadRequest("Table is not active.");


        if (table.IsBarSeat)
            return BadRequest("Individual bar seats cannot be reserved.");


        if (dto.PartySize > table.Seats)
            return BadRequest($"Party size exceeds the table's capacity of {table.Seats}.");

        var conflictingReservation = await _context.Reservations.AnyAsync(x =>
            x.TableId == dto.TableId &&
            x.Status != "Cancelled" &&
            x.ReservedFor == dto.ReservedFor);

        if (conflictingReservation)
            return BadRequest("That table is already reserved for that time.");

        var reservation = new Reservation
        {
            LocationId = dto.LocationId,
            UserId = dto.UserId,
            TableId = dto.TableId,
            ReservedFor = dto.ReservedFor,
            PartySize = dto.PartySize,
            Status = dto.Status,
            SpecialRequests = dto.SpecialRequests
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        dto.Id = reservation.Id;

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<ReservationDto>> Update(int id, ReservationDto dto)
    {

        if (dto.PartySize < 2 || dto.PartySize > 6)
            return BadRequest("Party size must be between 2 and 6 guests.");


        if (dto.ReservedFor < DateTime.UtcNow.AddHours(2))
            return BadRequest("Reservations must be made at least 2 hours in advance.");


        var timeOfDay = dto.ReservedFor.TimeOfDay;
        if (timeOfDay < new TimeSpan(6, 0, 0) || timeOfDay > new TimeSpan(18, 0, 0))
            return BadRequest("Reservations can only be made between 6:00 AM and 6:00 PM.");

        var reservation = await _context.Reservations.FirstOrDefaultAsync(x => x.Id == id);
        if (reservation == null)
            return NotFound();

        var locationExists = await _context.Locations.AnyAsync(x => x.Id == dto.LocationId);
        if (!locationExists)
            return BadRequest("Invalid location.");

        var userExists = await _context.Users.AnyAsync(x => x.Id == dto.UserId);
        if (!userExists)
            return BadRequest("Invalid user.");

        var table = await _context.Tables.FirstOrDefaultAsync(x => x.Id == dto.TableId);
        if (table == null)
            return BadRequest("Invalid table.");

        if (table.LocationId != dto.LocationId)
            return BadRequest("Table does not belong to this location.");


        if (table.IsBarSeat)
            return BadRequest("Individual bar seats cannot be reserved.");


        if (dto.PartySize > table.Seats)
            return BadRequest($"Party size exceeds the table's capacity of {table.Seats}.");

        var conflictingReservation = await _context.Reservations.AnyAsync(x =>
            x.Id != id &&
            x.TableId == dto.TableId &&
            x.Status != "Cancelled" &&
            x.ReservedFor == dto.ReservedFor);

        if (conflictingReservation)
            return BadRequest("That table is already reserved for that time.");

        reservation.LocationId = dto.LocationId;
        reservation.UserId = dto.UserId;
        reservation.TableId = dto.TableId;
        reservation.ReservedFor = dto.ReservedFor;
        reservation.PartySize = dto.PartySize;
        reservation.Status = dto.Status;
        reservation.SpecialRequests = dto.SpecialRequests;

        await _context.SaveChangesAsync();

        dto.Id = reservation.Id;

        return Ok(dto);
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


        var isAdmin = User.IsInRole(RoleNames.Admin);
        if (!isAdmin && reservation.UserId != userId.Value)
            return BadRequest("You can only cancel your own reservations.");


        if (reservation.ReservedFor < DateTime.UtcNow)
            return BadRequest("Cannot cancel a reservation for a past date/time.");

        if (string.Equals(reservation.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Reservation is already cancelled.");

        reservation.Status = "Cancelled";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Reservation cancelled." });
    }
}