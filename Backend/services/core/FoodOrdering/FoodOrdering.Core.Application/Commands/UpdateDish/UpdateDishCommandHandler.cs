using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.UpdateDish;

public class UpdateDishCommandHandler : IRequestHandler<UpdateDishCommand, Result<bool>>
{
    private readonly IDishRepository _dishRepository;
    private readonly IUserContext _userContext;

    public UpdateDishCommandHandler(IDishRepository dishRepository, IUserContext userContext)
    {
        _dishRepository = dishRepository;
        _userContext = userContext;
    }

    public async Task<Result<bool>> Handle(UpdateDishCommand request, CancellationToken cancellationToken)
    {
        // 1. دریافت شناسه کاربر جاری
        if (!_userContext.TryGetCurrentUserId(out var chefId))
            return Result<bool>.Failure("User ID not found in token.");

        // 2. دریافت غذا از دیتابیس
        var dish = await _dishRepository.GetByIdAsync(request.DishId, cancellationToken);
        if (dish is null)
            return Result<bool>.Failure("غذا یافت نشد.");

        // 3. بررسی مالکیت (فقط آشپز خودش می‌تواند ویرایش کند)
        if (dish.ChefId != chefId)
            return Result<bool>.Failure("شما اجازه ویرایش این غذا را ندارید.");

        var dto = request.Dto;

        // 4. اعتبارسنجی اولیه
        if (string.IsNullOrWhiteSpace(dto.Title))
            return Result<bool>.Failure("نام غذا نمی‌تواند خالی باشد.");

        if (dto.Price <= 0)
            return Result<bool>.Failure("قیمت باید بزرگتر از صفر باشد.");

        // 5. به‌روزرسانی اطلاعات
        var PrepTime = 60;
        if (!dish.UpdateInfo(dto.Title, dto.Description, PrepTime, dto.Ingredients, dto.Image, dto.Category))
            return Result<bool>.Failure("به‌روزرسانی اطلاعات با شکست مواجه شد.");

        if (!dish.UpdatePrice(dto.Price))
            return Result<bool>.Failure("قیمت وارد شده معتبر نیست.");

        if (!dish.SetStockQuantity(dto.Remaining))
            return Result<bool>.Failure("مقدار موجودی نامعتبر است.");

        dish.UpdateAvailability(dto.Remaining > 0);

        // 6. ذخیره تغییرات
        await _dishRepository.UpdateAsync(dish, cancellationToken);

        return Result<bool>.Success(true);
    }
}