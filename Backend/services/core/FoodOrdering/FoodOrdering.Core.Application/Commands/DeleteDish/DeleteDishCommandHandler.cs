using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Domain.Entities;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.DeleteDish;

public class DeleteDishCommandHandler : IRequestHandler<DeleteDishCommand, Result<bool>>
{
    private readonly IDishRepository _dishRepository;
    private readonly IUserContext _userContext;

    public DeleteDishCommandHandler(
        IDishRepository dishRepository,
        IUserContext userContext)
    {
        _dishRepository = dishRepository;
        _userContext = userContext;
    }

    public async Task<Result<bool>> Handle(DeleteDishCommand request, CancellationToken cancellationToken)
    {
        // ۱. دریافت شناسه کاربر جاری
        if (!_userContext.TryGetCurrentUserId(out var chefId))
            return Result<bool>.Failure("User ID not found in token.");

        // ۲. یافتن غذا
        var dish = await _dishRepository.GetByIdAsync(request.DishId, cancellationToken);
        if (dish is null)
            return Result<bool>.Failure("غذا یافت نشد.");

        // ۳. بررسی مالکیت (فقط آشپز ایجادکننده می‌تواند حذف کند)
        if (dish.ChefId != chefId)
            return Result<bool>.Failure("شما اجازه حذف این غذا را ندارید.");

        // ۴. تلاش برای حذف (خطا در ریپازیتوری مدیریت می‌شود)
        try
        {
            await _dishRepository.DeleteAsync(dish, cancellationToken);
        }
        catch (InvalidOperationException ex) // استثنایی که در ریپازیتوری پرتاب می‌شود
        {
            return Result<bool>.Failure(ex.Message);
        }

        return Result<bool>.Success(true);
    }
}