using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Payments;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly DataContext _context;
    private readonly StripePaymentService _stripePaymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(DataContext context, StripePaymentService stripePaymentService, ILogger<PaymentsController> logger)
    {
        _context = context;
        _stripePaymentService = stripePaymentService;
        _logger = logger;
    }

    [HttpGet("methods")]
    [Authorize]
    public async Task<ActionResult<List<PaymentMethodDto>>> GetMyPaymentMethods()
    {
        var userId = User.GetCurrentUserId();
        _logger.LogInformation("[GetMyPaymentMethods] Fetching methods for userId: {UserId}", userId);
        
        if (!userId.HasValue)
        {
            _logger.LogWarning("[GetMyPaymentMethods] No userId found in claims");
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

        _logger.LogInformation("[GetMyPaymentMethods] Returning {Count} methods for userId {UserId}", methods.Count, userId);
        return Ok(methods);
    }

    [HttpPost("methods")]
    [Authorize]
    public async Task<ActionResult<PaymentMethodDto>> AddPaymentMethod([FromBody] CreatePaymentMethodDto dto)
    {
        try
        {
            _logger.LogInformation("[AddPaymentMethod] START: Received request");
            
            if (dto == null)
            {
                _logger.LogWarning("[AddPaymentMethod] Payload is null");
                return BadRequest("Payment method payload is required.");
            }

            var userId = User.GetCurrentUserId();
            _logger.LogInformation("[AddPaymentMethod] UserId extracted: {UserId}", userId);
            
            if (!userId.HasValue)
            {
                _logger.LogWarning("[AddPaymentMethod] No userId in claims");
                return Unauthorized();
            }

            // Verify user exists in database
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId.Value);
            _logger.LogInformation("[AddPaymentMethod] User {UserId} exists: {Exists}", userId, userExists);
            
            if (!userExists)
            {
                return Unauthorized();
            }

            var cardholderName = dto.CardholderName?.Trim();
            var brand = dto.Brand?.Trim();
            var last4 = dto.Last4?.Trim();

            _logger.LogInformation("[AddPaymentMethod] Validating inputs: name={Name}, brand={Brand}, last4={Last4}, expMonth={ExpMonth}, expYear={ExpYear}", 
                cardholderName, brand, last4, dto.ExpMonth, dto.ExpYear);

            // Validation
            if (string.IsNullOrWhiteSpace(cardholderName))
                return BadRequest("Cardholder name is required.");

            if (string.IsNullOrWhiteSpace(brand))
                return BadRequest("Card brand is required.");

            if (string.IsNullOrWhiteSpace(last4) || last4.Length != 4 || !last4.All(char.IsDigit))
                return BadRequest("Last4 must be exactly 4 digits.");

            if (dto.ExpMonth < 1 || dto.ExpMonth > 12)
                return BadRequest("Expiration month must be between 1 and 12.");

            if (dto.ExpYear < DateTime.UtcNow.Year)
                return BadRequest("Expiration year is invalid.");

            if (dto.ExpYear == DateTime.UtcNow.Year && dto.ExpMonth < DateTime.UtcNow.Month)
                return BadRequest("Card expiration cannot be in the past.");

            // Reconstruct full card number from dto (it only has last4, so we use it for validation)
            // In production, the card number should come via tokenized form from Stripe Elements
            // For now, we need the full card number to create the Stripe PaymentMethod
            // This is the DTO's CardNumber field which should contain the full card number
            var cardNumber = dto.CardNumber ?? string.Empty;
            if (string.IsNullOrWhiteSpace(cardNumber) || cardNumber.Length < 13)
                return BadRequest("Valid card number is required.");

            var cvc = dto.Cvc ?? string.Empty;
            if (string.IsNullOrWhiteSpace(cvc) || cvc.Length < 3 || cvc.Length > 4)
                return BadRequest("Valid CVV is required.");

            _logger.LogInformation("[AddPaymentMethod] Creating Stripe PaymentMethod");
            
            // Tokenize with Stripe
            var stripeResult = await _stripePaymentService.CreatePaymentMethodAsync(
                cardholderName, cardNumber, dto.ExpMonth, dto.ExpYear, cvc);
            
            _logger.LogInformation("[AddPaymentMethod] Stripe PaymentMethod created: {StripeId}", stripeResult.StripePaymentMethodId);

            _logger.LogInformation("[AddPaymentMethod] Checking for existing methods");
            var userHasExistingMethods = await _context.PaymentMethods
                .AnyAsync(m => m.UserId == userId.Value);
            
            _logger.LogInformation("[AddPaymentMethod] User has existing methods: {Has}", userHasExistingMethods);

            var shouldBeDefault = dto.IsDefault || !userHasExistingMethods;
            _logger.LogInformation("[AddPaymentMethod] Should be default: {ShouldBeDefault}", shouldBeDefault);

            if (shouldBeDefault && userHasExistingMethods)
            {
                _logger.LogInformation("[AddPaymentMethod] Clearing other defaults");
                var existingDefaults = await _context.PaymentMethods
                    .Where(m => m.UserId == userId.Value && m.IsDefault)
                    .ToListAsync();

                foreach (var method in existingDefaults)
                {
                    method.IsDefault = false;
                }
                
                await _context.SaveChangesAsync();
                _logger.LogInformation("[AddPaymentMethod] Cleared {Count} defaults", existingDefaults.Count);
            }

            // Create and add the new payment method (with Stripe ID)
            var paymentMethod = new PaymentMethod
            {
                UserId = userId.Value,
                StripePaymentMethodId = stripeResult.StripePaymentMethodId,
                CardholderName = cardholderName,
                Brand = stripeResult.Brand,
                Last4 = stripeResult.Last4,
                ExpMonth = stripeResult.ExpMonth,
                ExpYear = stripeResult.ExpYear,
                IsDefault = shouldBeDefault,
            };

            _logger.LogInformation("[AddPaymentMethod] Adding new payment method to context");
            _context.PaymentMethods.Add(paymentMethod);
            
            _logger.LogInformation("[AddPaymentMethod] Saving to database");
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("[AddPaymentMethod] SUCCESS: Payment method saved with ID {MethodId}", paymentMethod.Id);

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AddPaymentMethod] FAILED with exception: {Message}", ex.Message);
            if (ex.InnerException != null)
            {
                _logger.LogError(ex.InnerException, "[AddPaymentMethod] Inner exception: {Message}", ex.InnerException.Message);
            }
            
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "Failed to add payment method", details = ex.Message });
        }
    }

    [HttpPost("methods/{id:int}/default")]
    [Authorize]
    public async Task<ActionResult<PaymentMethodDto>> SetDefaultPaymentMethod(int id)
    {
        var userId = User.GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized();

        var target = await _context.PaymentMethods
            .FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId.Value);

        if (target == null)
            return NotFound();

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
            return Unauthorized();

        var method = await _context.PaymentMethods
            .FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId.Value);

        if (method == null)
            return NotFound();

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
    [Authorize]
    public async Task<ActionResult<object>> CreateCheckoutSession([FromBody] CreateCheckoutSessionDto dto)
    {
        var currentUserId = User.GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var order = await _context.Orders.FirstOrDefaultAsync(x => x.Id == dto.OrderId);
        if (order == null)
            return NotFound("Order not found.");

        var isPrivileged = User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.Manager) || User.IsInRole(RoleNames.Staff);
        if (!isPrivileged && order.CreatedByUserId != currentUserId.Value)
            return Forbid();

        if (order.PaymentStatus == PaymentStatuses.Paid)
            return BadRequest("Order is already paid.");

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

    [HttpGet("orders/{orderId:int}")]
    [Authorize]
    public async Task<ActionResult<List<OrderPaymentDto>>> GetOrderPayments(int orderId)
    {
        var currentUserId = User.GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var order = await _context.Orders.FirstOrDefaultAsync(x => x.Id == orderId);
        if (order == null)
            return NotFound();

        var isPrivileged = User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.Manager) || User.IsInRole(RoleNames.Staff);
        if (!isPrivileged && order.CreatedByUserId != currentUserId.Value)
            return Forbid();

        var payments = await _context.Payments
            .Where(x => x.OrderId == orderId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new OrderPaymentDto
            {
                Id = x.Id,
                Provider = x.Provider,
                PaymentMethodType = x.PaymentMethodType,
                TransactionId = x.TransactionId,
                Amount = x.Amount,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                RemovedAt = x.RemovedAt,
                RemovedReason = x.RemovedReason
            })
            .ToListAsync();

        return Ok(payments);
    }

    [HttpDelete("orders/{orderId:int}/{paymentId:int}")]
    [Authorize]
    public async Task<ActionResult> RemoveOrderPayment(int orderId, int paymentId, [FromBody] RemovePaymentDto dto)
    {
        var currentUserId = User.GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var order = await _context.Orders.FirstOrDefaultAsync(x => x.Id == orderId);
        if (order == null)
            return NotFound("Order not found.");

        var isPrivileged = User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.Manager) || User.IsInRole(RoleNames.Staff);
        if (!isPrivileged && order.CreatedByUserId != currentUserId.Value)
            return Forbid();

        var payment = await _context.Payments.FirstOrDefaultAsync(x => x.Id == paymentId && x.OrderId == orderId);
        if (payment == null)
            return NotFound("Payment not found.");

        if (payment.Status == PaymentStatuses.Removed)
            return BadRequest("Payment is already removed.");

        payment.Status = PaymentStatuses.Removed;
        payment.RemovedAt = DateTime.UtcNow;
        payment.RemovedReason = dto.Reason.Trim();

        if (order.PaymentStatus == PaymentStatuses.Paid)
            order.PaymentStatus = PaymentStatuses.Removed;

        await _context.SaveChangesAsync();

        return Ok();
    }

}
