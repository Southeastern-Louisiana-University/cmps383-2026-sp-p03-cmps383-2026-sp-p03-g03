using Microsoft.AspNetCore.Mvc;
using Selu383.SP26.Api.Features.Payments;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly StripePaymentService _stripePaymentService;

    public PaymentsController(StripePaymentService stripePaymentService)
    {
        _stripePaymentService = stripePaymentService;
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