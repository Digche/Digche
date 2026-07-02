using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using FoodOrdering.Core.Application.Commands.AddDish;
using FoodOrdering.Core.Application.Commands.UpdateDish;
using FoodOrdering.Core.Application.Commands.DeleteDish;

namespace FoodOrdering.Core.API.Controllers;

[ApiController]
[Route("api/core/[controller]")]
public class DishesController : ControllerBase
{
    private readonly IMediator _mediator;

    public DishesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "chef")]
    public async Task<IActionResult> AddDish([FromBody] CreateDishDto dto)
    {
        var command = new AddDishCommand(dto);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDish(Guid id)
    {
        var query = new GetDishByIdQuery(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { message = result.ErrorMessage });

        return Ok(result);
    }

    // === دریافت غذاهای یک آشپز خاص (برای همه کاربران) ===
    [HttpGet("chef/{chefId:guid}")]
    public async Task<IActionResult> GetDishesByChefId(Guid chefId)
    {
        var query = new GetDishesByChefIdQuery(chefId);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(result);
    }

    // === دریافت غذاهای موجود (برای مشتریان) ===
    [HttpGet("available")]
    public async Task<IActionResult> GetAvailableDishes()
    {
        var query = new GetAvailableDishesQuery();
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(result);
    }

    // === ویرایش غذا (فقط آشپز مالک) ===
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "chef")]
    public async Task<IActionResult> UpdateDish(Guid id, [FromBody] UpdateDishDto dto)
    {
        var command = new UpdateDishCommand(id, dto);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDish(Guid id)
    {
        var command = new DeleteDishCommand { DishId = id };
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return NoContent();
    }

}