using FoodOrdering.Core.Application.Common;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.DeleteDish;

public record DeleteDishCommand(Guid DishId) : IRequest<Result<bool>>;