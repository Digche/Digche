using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Core.Application.Commands.DeleteDish;

public class DeleteDishCommandHandler : IRequestHandler<DeleteDishCommand, Result<bool>>
{
    private readonly IDishRepository _dishRepository;
    private readonly IUserContext _userContext;
    private readonly IOrderRepository _orderRepository;   // برای بررسی وابستگی سفارش
    private readonly ICartRepository _cartRepository;     // برای بررسی وابستگی سبد خرید

    public DeleteDishCommandHandler(
        IDishRepository dishRepository,
        IUserContext userContext,
        IOrderRepository orderRepository,
        ICartRepository cartRepository)
    {
        _dishRepository = dishRepository;
        _userContext = userContext;
        _orderRepository = orderRepository;
        _cartRepository = cartRepository;
    }

    public async Task<Result<bool>> Handle(DeleteDishCommand request, CancellationToken cancellationToken)
    {
        // ۱. دریافت ChefId از توکن
        if (!_userContext.TryGetCurrentUserId(out var chefId))
            return Result<bool>.Failure("User ID not found in token.");

        // ۲. دریافت غذا
        var dish = await _dishRepository.GetByIdAsync(request.DishId, cancellationToken);
        if (dish is null)
            return Result<bool>.Failure("غذا یافت نشد.");

        // ۳. بررسی مالکیت
        if (dish.ChefId != chefId)
            return Result<bool>.Failure("شما اجازه حذف این غذا را ندارید.");

        // ۴. بررسی وابستگی‌ها (آیا غذا در سفارش‌ها یا سبد خرید استفاده شده است؟)
        var hasOrders = await _orderRepository.HasOrdersForDishAsync(dish.Id, cancellationToken);
        if (hasOrders)
            return Result<bool>.Failure("این غذا در سفارش‌های ثبت‌شده استفاده شده است و قابل حذف نیست.");

        var hasCarts = await _cartRepository.HasDishInAnyCartAsync(dish.Id, cancellationToken);
        if (hasCarts)
            return Result<bool>.Failure("این غذا در سبد خرید کاربران وجود دارد و قابل حذف نیست.");

        // ۵. حذف
        await _dishRepository.DeleteAsync(dish, cancellationToken);

        return Result<bool>.Success(true);
    }
}