using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.CreateOrder;

public record CreateOrderCommand(CreateOrderDto Dto) : IRequest<Result<OrderDto>>;