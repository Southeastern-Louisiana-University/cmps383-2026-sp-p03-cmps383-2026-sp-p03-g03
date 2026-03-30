using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Payments;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly DataContext _context;
    private readonly StripePaymentService _stripePaymentService;

    public PaymentsController(DataContext context, StripePaymentService stripePaymentService)
    {
        _context = context;
        _stripePaymentService = stripePaymentService;
    }

    [HttpGet("methods")]
    [Authorize]
    public async Task<ActionResult<List<PaymentMethodDto>>> GetMyPaymentMethods()
    {
        var userId = User.GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var methods = await _context.PaymentMethods
            .Where(m => m.UserId == userId.Value)
            .OrderByDescending(m => m.IsDefault)
            .ThenByDescending(m => m.CreatedAt)
            .Select(m => new PaymentMethodDto
            {
                Id = m.Id,
                CardholderName = m.CardholderName,
                Brand = m.Brand,
                Last4 = m.Last4,
                ExpMonth = m.ExpMonth,
                ExpYear = m.ExpYear,
                IsDefault = m.IsDefault,
            })
            .ToListAsync();

        return Ok(methods);
    }

    [HttpPost("methods")]
    [Authorize]
    public async Task<ActionResult<PaymentMethodDto>> AddPaymentMethod([FromBody] CreatePaymentMethodDto dto)
    {
        var userId = User.GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var cardholderName = dto.CardholderName.Trim();
        var brand = dto.Brand.Trim();

        if (string.IsNullOrWhiteSpace(cardholderName) || string.IsNullOrWhiteSpace(brand))
        {
            return BadRequest("Cardholder name and brand are required.");
        }

        if (dto.ExpYear == DateTime.UtcNow.Year && dto.ExpMonth < DateTime.UtcNow.Month)
        {
            return BadRequest("Card expiration cannot be in the past.");
        }

        var shouldBeDefault = dto.IsDefault || !await _context.PaymentMethods.AnyAsync(m => m.UserId == userId.Value);

        if (shouldBeDefault)
        {
            var existingDefaultMethods = await _context.PaymentMethods
                .Where(m => m.UserId == userId.Value && m.IsDefault)
                .ToListAsync();

            foreach (var method in existingDefaultMethods)
            {
                method.IsDefault = false;
            }
        }

        var paymentMethod = new PaymentMethod
        {
            UserId = userId.Value,
            CardholderName = cardholderName,
            Brand = brand,
            Last4 = dto.Last4,
            ExpMonth = dto.ExpMonth,
            ExpYear = dto.ExpYear,
            IsDefault = shouldBeDefault,
        };

        _context.PaymentMethods.Add(paymentMethod);
        await _context.SaveChangesAsync();

        return Ok(new PaymentMethodDto
        {
            Id = paymentMethod.Id,
            CardholderName = paymentMethod.CardholderName,
            Brand = paymentMethod.Brand,
            Last4 = paymentMethod.Last4,
            ExpMonth = paymentMethod.ExpMonth,
            ExpYear = paymentMethod.ExpYear,
            IsDefault = paymentMethod.IsDefault,
        });
    }

    [HttpPost("methods/{id:int}/default")]
    [Authorize]
    public async Task<ActionResult<PaymentMethodDto>> SetDefaultPaymentMethod(int id)
    {
        var userId = User.GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var target = await _context.PaymentMethods
            .FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId.Value);

        if (target == null)
        {
            return NotFound();
        }

        var userMethods = await _context.PaymentMethods
            .Where(m => m.UserId == userId.Value)
            .ToListAsync();

        foreach (var method in userMethods)
        {
            method.IsDefault = method.Id == id;
        }

        await _context.SaveChangesAsync();
        
        return Ok(new PaymentMethodDto
        {
            Id = target.Id,
            CardholderName = target.CardholderName,
            Brand = target.Brand,
            Last4 = target.Last4,
            ExpMonth = target.ExpMonth,
            ExpYear = target.ExpYear,
            IsDefault = target.IsDefault,
        });
    }

    [HttpDelete("methods/{id:int}")]
    [Authorize]
    public async Task<ActionResult<object>> DeletePaymentMethod(int id)
    {
        var userId = User.GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var method = await _context.PaymentMethods
            .FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId.Value);

        if (method == null)
        {
            return NotFound();
        }

        var wasDefault = method.IsDefault;
        _context.PaymentMethods.Remove(method);
        await _context.SaveChangesAsync();

        if (wasDefault)
        {
            var nextMethod = await _context.PaymentMethods
                .Where(m => m.UserId == userId.Value)
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefaultAsync();

            if (nextMethod != null)
            {
                nextMethod.IsDefault = true;
                await _context.SaveChangesAsync();
            }
        }

        return Ok(new
        {
            message = "Payment method deleted successfully",
            deletedId = id,
            wasDefault,
        });
    }

    [HttpPost("create-checkout-session")]
    public async Task<ActionResult<object>> CreateCheckoutSession(CreateCheckoutSessionDto dto)
    {
        try
        {
            var url = await _stripePaymentService.CreateCheckoutSessionAsync(dto.OrderId);

            return Ok(new
            {
                checkoutUrl = url
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}