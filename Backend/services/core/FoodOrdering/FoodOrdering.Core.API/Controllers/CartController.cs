using FoodOrdering.Core.Application.Commands;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrdering.Core.API.Controllers;

[ApiController]
[Route("api/core/[controller]")]
[Authorize]
public class CartsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CartsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var query = new GetCartQuery();
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(result);
    }

    // [HttpPost("items")]
    // public async Task<IActionResult> AddToCart([FromBody] AddToCartCommand command)
    // {
    //     var result = await _mediator.Send(command);

    //     if (!result.IsSuccess)
    //         return BadRequest(new { message = result.ErrorMessage });

    //     return Ok(result);
    // }

    // [HttpDelete("items/{dishId:guid}")]
    // public async Task<IActionResult> RemoveFromCart(Guid dishId)
    // {
    //     var command = new RemoveFromCartCommand(dishId);
    //     var result = await _mediator.Send(command);

    //     if (!result.IsSuccess)
    //         return BadRequest(new { message = result.ErrorMessage });

    //     return Ok(result);
    // }

    // [HttpDelete]
    // public async Task<IActionResult> ClearCart()
    // {
    //     var command = new ClearCartCommand();
    //     var result = await _mediator.Send(command);

    //     if (!result.IsSuccess)
    //         return BadRequest(new { message = result.ErrorMessage });

    //     return Ok(result);
    // }
}