using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.RemoveFromCart;

public class RemoveFromCartCommandHandler : IRequestHandler<RemoveFromCartCommand, Result<bool>>
{
    private readonly ICartRepository _cartRepository;
    private readonly IUserContext _userContext;

    public RemoveFromCartCommandHandler(ICartRepository cartRepository, IUserContext userContext)
    {
        _cartRepository = cartRepository;
        _userContext = userContext;
    }

    public async Task<Result<bool>> Handle(RemoveFromCartCommand request, CancellationToken cancellationToken)
    {
        // 1. دریافت شناسه کاربر جاری
        if (!_userContext.TryGetCurrentUserId(out var userId))
            return Result<bool>.Failure("User ID not found in token.");

        // 2. دریافت سبد خرید کاربر
        var cart = await _cartRepository.GetByUserIdWithItemsAsync(userId, cancellationToken);
        if (cart is null)
            return Result<bool>.Failure("سبد خرید یافت نشد.");

        // 3. حذف آیتم
        cart.RemoveItem(request.DishId);

        // 4. ذخیره تغییرات
        await _cartRepository.UpdateAsync(cart, cancellationToken);

        return Result<bool>.Success(true);
    }
}