using FoodOrdering.Core.Application.Commands.AddComment;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Application.Queries.GetDishComments;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrdering.Core.API.Controllers
{
    [ApiController]
    [Route("api/core/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CommentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// ثبت کامنت جدید (نیاز به احراز هویت)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddComment([FromBody] CreateCommentDto dto)
        {
            var command = new AddCommentCommand(dto);
            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.ErrorMessage });

            return CreatedAtAction(nameof(GetDishComments), new { dishId = dto.DishId }, result.Data);
        }

        /// <summary>
        /// دریافت تمام کامنت‌های یک غذا (عمومی)
        /// </summary>
        [HttpGet("dish/{dishId:guid}")]
        public async Task<IActionResult> GetDishComments(Guid dishId)
        {
            var query = new GetDishCommentsQuery(dishId);
            var result = await _mediator.Send(query);

            if (!result.IsSuccess)
                return NotFound(new { message = result.ErrorMessage });

            return Ok(result.Data);
        }
    }
}