using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.UpdateDish;

public record UpdateDishCommand(
    Guid DishId,
    UpdateDishDto Dto
) : IRequest<Result<bool>>;