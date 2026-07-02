using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public record GetDishesByChefIdQuery(Guid ChefId) : IRequest<Result<IEnumerable<DishDto>>>;