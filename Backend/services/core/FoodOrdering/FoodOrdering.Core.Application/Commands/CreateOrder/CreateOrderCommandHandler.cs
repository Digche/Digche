using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Domain.Enums;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.CreateOrder;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<OrderDto>>
{
    private readonly ICartRepository _cartRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IDishRepository _dishRepository;
    private readonly IUserContext _userContext;

    public CreateOrderCommandHandler(
        ICartRepository cartRepository,
        IOrderRepository orderRepository,
        IDishRepository dishRepository,
        IUserContext userContext)
    {
        _cartRepository = cartRepository;
        _orderRepository = orderRepository;
        _dishRepository = dishRepository;
        _userContext = userContext;
    }

    public async Task<Result<OrderDto>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. دریافت شناسه کاربر جاری
        if (!_userContext.TryGetCurrentUserId(out var customerId))
            return Result<OrderDto>.Failure("User ID not found in token.");

        var dto = request.Dto;

        // 2. اعتبارسنجی آدرس (بهبود یافته)
        if (string.IsNullOrWhiteSpace(dto.DeliveryAddress))
            return Result<OrderDto>.Failure("آدرس تحویل نمی‌تواند خالی باشد.");

        if (dto.DeliveryAddress.Length < 10) // حداقل طول آدرس
            return Result<OrderDto>.Failure("آدرس تحویل باید حداقل ۱۰ کاراکتر باشد.");

        // // 3. بررسی آشپز و دریافت هزینه ارسال از پروفایل
        // var chef = await _chefProfileRepository.GetByIdAsync(dto.ChefId, cancellationToken);
        // if (chef is null)
        //     return Result<OrderDto>.Failure("آشپز یافت نشد.");
        // if (chef.Status != ChefProfileStatus.Approved)
        //     return Result<OrderDto>.Failure("آشپز تأیید نشده است.");

        var deliveryFee = 100;

        // 4. دریافت سبد خرید کاربر
        var cart = await _cartRepository.GetByUserIdWithItemsAsync(customerId, cancellationToken);
        if (cart is null || !cart.Items.Any())
            return Result<OrderDto>.Failure("سبد خرید خالی است.");

        // 5. ایجاد سفارش با هزینه ارسال محاسبه‌شده در سرور
        var order = new Order(
            customerId,
            dto.ChefId,
            dto.DeliveryAddress,
            deliveryFee  // ← هزینه از سرور
        );

        // 6. اضافه کردن آیتم‌های سبد به سفارش (با بررسی موجودی)
        foreach (var cartItem in cart.Items)
        {
            var dish = await _dishRepository.GetByIdAsync(cartItem.DishId, cancellationToken);
            if (dish is null)
                return Result<OrderDto>.Failure($"غذایی با شناسه {cartItem.DishId} یافت نشد.");

            if (!dish.IsAvailable || !dish.HasEnoughStock(cartItem.Quantity))
                return Result<OrderDto>.Failure($"غذای '{dish.Name}' موجود نیست یا موجودی کافی نیست.");

            if (!order.AddItem(dish, cartItem.Quantity))
                return Result<OrderDto>.Failure($"خطا در افزودن آیتم '{dish.Name}' به سفارش.");
        }

        // 7. ذخیره سفارش
        await _orderRepository.AddAsync(order, cancellationToken);

        // 8. خالی کردن سبد خرید
        cart.Clear();
        await _cartRepository.UpdateAsync(cart, cancellationToken);

        // 9. تبدیل به DTO برای بازگشت به کاربر
        var orderDto = new OrderDto
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            ChefId = order.ChefId,
            DeliveryAddress = order.DeliveryAddress,
            DeliveryFee = order.DeliveryFee,   // مقدار واقعی از سرور
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