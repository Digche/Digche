using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUserContext _userContext;
    private readonly IUserServiceClient _userServiceClient;

    public GetOrderByIdQueryHandler(
        IOrderRepository orderRepository,
        IUserContext userContext,
        IUserServiceClient userServiceClient)
    {
        _orderRepository = orderRepository;
        _userContext = userContext;
        _userServiceClient = userServiceClient;
    }

    public async Task<Result<OrderDto>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        // بررسی احراز هویت
        if (!_userContext.IsAuthenticated())
            return Result<OrderDto>.Failure("User not authenticated.");

        // دریافت سفارش با آیتم‌ها (شامل بارگذاری Dish)
        var order = await _orderRepository.GetByIdWithItemsAsync(request.OrderId, cancellationToken);
        if (order is null)
            return Result<OrderDto>.Failure("سفارش یافت نشد.");

        // بررسی دسترسی: مشتری یا آشپز مربوطه
        if (!_userContext.TryGetCurrentUserId(out var userId))
            return Result<OrderDto>.Failure("User ID not found in token.");

        if (order.CustomerId != userId && order.ChefId != userId)
            return Result<OrderDto>.Failure("شما دسترسی به این سفارش را ندارید.");

        // دریافت اطلاعات کاربر (مشتری) برای نام و تلفن
        AuthUserDto userInfo = null;
        try
        {
            // اگر کاربر جاری خود مشتری است، اطلاعات خودش را می‌گیریم
            // در غیر این صورت (آشپز) اطلاعات مشتری را درخواست می‌کنیم
            var targetUserId = (order.CustomerId == userId) ? userId : order.CustomerId;
            userInfo = await _userServiceClient.GetUserInfoAsync(targetUserId, cancellationToken);
        }
        catch
        {
            // در صورت خطا در دریافت اطلاعات، مقدار پیش‌فرض استفاده می‌شود
        }

        var customerName = userInfo != null ? GetDisplayName(userInfo) : "نامشخص";
        var customerPhone = userInfo?.Phone ?? "نامشخص";

        // نگاشت به DTO جدید
        var orderDto = new OrderDto
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            ChefId = order.ChefId,
            CustomerName = customerName,
            CustomerPhone = customerPhone,
            Status = order.Status,
            OrderedAt = order.CreatedAt,
            Items = order.Items.Select(item => new OrderItemDto
            {
                FoodId = item.DishId,
                FoodTitle = item.Dish?.Name ?? "نامشخص",
                FoodImage = item.Dish?.ImageUrl ?? string.Empty,
                Quantity = item.Quantity,
                Price = item.UnitPrice,
                Unit = "تومان"
            }).ToList()
        };

        return Result<OrderDto>.Success(orderDto);
    }

    private static string GetDisplayName(AuthUserDto user)
    {
        if (!string.IsNullOrWhiteSpace(user.FirstName) && !string.IsNullOrWhiteSpace(user.LastName))
            return $"{user.FirstName} {user.LastName}";
        if (!string.IsNullOrWhiteSpace(user.DisplayName))
            return user.DisplayName;
        if (!string.IsNullOrWhiteSpace(user.Username))
            return user.Username;
        return "کاربر";
    }
}