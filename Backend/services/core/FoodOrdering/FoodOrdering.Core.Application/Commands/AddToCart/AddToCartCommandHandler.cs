using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Domain.Entities;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.AddToCart;

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, Result<bool>>
{
    private readonly ICartRepository _cartRepository;
    private readonly IDishRepository _dishRepository;
    private readonly IUserContext _userContext;

    public AddToCartCommandHandler(
        ICartRepository cartRepository,
        IDishRepository dishRepository,
        IUserContext userContext)
    {
        _cartRepository = cartRepository;
        _dishRepository = dishRepository;
        _userContext = userContext;
    }

    public async Task<Result<bool>> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        // 1. دریافت شناسه کاربر جاری
        if (!_userContext.TryGetCurrentUserId(out var userId))
            return Result<bool>.Failure("User ID not found in token.");

        // 2. اعتبارسنجی ورودی
        if (request.Quantity <= 0)
            return Result<bool>.Failure("تعداد باید بیشتر از صفر باشد.");

        // 3. بررسی وجود غذا و موجودی
        var dish = await _dishRepository.GetByIdAsync(request.DishId, cancellationToken);
        if (dish is null)
            return Result<bool>.Failure("غذا یافت نشد.");

        if (!dish.IsAvailable || !dish.HasEnoughStock(request.Quantity))
            return Result<bool>.Failure("غذا موجود نیست یا موجودی کافی نیست.");

        // 4. دریافت سبد خرید کاربر یا ایجاد جدید
        var cart = await _cartRepository.GetByUserIdWithItemsAsync(userId, cancellationToken);
        if (cart is null)
        {
            cart = new Cart(userId);
            await _cartRepository.AddAsync(cart, cancellationToken);
        }

        // 5. افزودن آیتم به سبد
        cart.AddItem(request.DishId, request.Quantity);

        // 6. ذخیره تغییرات
        await _cartRepository.UpdateAsync(cart, cancellationToken);

        return Result<bool>.Success(true);
    }
}