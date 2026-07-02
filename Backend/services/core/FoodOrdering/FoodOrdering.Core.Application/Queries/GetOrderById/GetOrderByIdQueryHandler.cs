using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUserContext _userContext;

    public GetOrderByIdQueryHandler(IOrderRepository orderRepository, IUserContext userContext)
    {
        _orderRepository = orderRepository;
        _userContext = userContext;
    }

    public async Task<Result<OrderDto>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        // بررسی احراز هویت
        if (!_userContext.IsAuthenticated())
            return Result<OrderDto>.Failure("User not authenticated.");

        // دریافت سفارش با آیتم‌ها
        var order = await _orderRepository.GetByIdWithItemsAsync(request.OrderId, cancellationToken);
        if (order is null)
            return Result<OrderDto>.Failure("سفارش یافت نشد.");

        // بررسی دسترسی: مشتری یا آشپز مربوطه
        if (!_userContext.TryGetCurrentUserId(out var userId))
            return Result<OrderDto>.Failure("User ID not found in token.");

        // اگر کاربر نه مشتری این سفارش است و نه آشپز آن، دسترسی ندارد
        if (order.CustomerId != userId && order.ChefId != userId)
            return Result<OrderDto>.Failure("شما دسترسی به این سفارش را ندارید.");

        // نگاشت به DTO
        var orderDto = new OrderDto
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
        };

        return Result<OrderDto>.Success(orderDto);
    }
}