using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public class GetCustomerOrdersQueryHandler : IRequestHandler<GetCustomerOrdersQuery, Result<IEnumerable<OrderDto>>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUserContext _userContext;

    public GetCustomerOrdersQueryHandler(IOrderRepository orderRepository, IUserContext userContext)
    {
        _orderRepository = orderRepository;
        _userContext = userContext;
    }

    public async Task<Result<IEnumerable<OrderDto>>> Handle(GetCustomerOrdersQuery request, CancellationToken cancellationToken)
    {
        if (!_userContext.TryGetCurrentUserId(out var customerId))
            return Result<IEnumerable<OrderDto>>.Failure("User ID not found in token.");

        var orders = await _orderRepository.GetByCustomerIdAsync(customerId, cancellationToken);
        if (orders is null || !orders.Any())
            return Result<IEnumerable<OrderDto>>.Success(Enumerable.Empty<OrderDto>());

        var orderDtos = orders.Select(order => new OrderDto
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            ChefId = order.ChefId,
            DeliveryAddress = order.DeliveryAddress,
            DeliveryFee = order.DeliveryFee,
            EstimatedDeliveryTime = order.EstimatedDeliveryTime,
            Status = order.Status,
            TotalPrice = order.TotalPrice,
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(item => new OrderItemDto
            {
                DishId = item.DishId,
                DishName = item.Dish?.Name ?? "نامشخص",
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            }).ToList()
        });

        return Result<IEnumerable<OrderDto>>.Success(orderDtos);
    }
}