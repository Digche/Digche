using FoodOrdering.Core.Application.Common;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.RemoveFromCart;

public record RemoveFromCartCommand(Guid DishId) : IRequest<Result<bool>>;