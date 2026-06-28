using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public record GetChefOrdersQuery : IRequest<Result<IEnumerable<OrderDto>>>;