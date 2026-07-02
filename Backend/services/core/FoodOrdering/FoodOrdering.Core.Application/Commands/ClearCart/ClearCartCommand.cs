using FoodOrdering.Core.Application.Common;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.ClearCart;

public record ClearCartCommand : IRequest<Result<bool>>;