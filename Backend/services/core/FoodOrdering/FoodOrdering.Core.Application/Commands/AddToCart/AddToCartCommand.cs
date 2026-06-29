using FoodOrdering.Core.Application.Common;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.AddToCart;

public record AddToCartCommand(Guid DishId, int Quantity) : IRequest<Result<bool>>;