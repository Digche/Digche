using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Enums;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.AddDish;

public class AddDishCommandHandler : IRequestHandler<AddDishCommand, Result<Guid>>
{
    private readonly IDishRepository _dishRepository;
    private readonly IChefProfileRepository _chefProfileRepository;
    private readonly IUserContext _userContext;

    public AddDishCommandHandler(
        IDishRepository dishRepository,
        IChefProfileRepository chefProfileRepository,
        IUserContext userContext)
    {
        _dishRepository = dishRepository;
        _chefProfileRepository = chefProfileRepository;
        _userContext = userContext;
    }

    public async Task<Result<Guid>> Handle(AddDishCommand request, CancellationToken cancellationToken)
    {
        // 1. دریافت شناسه کاربر جاری
        if (!_userContext.TryGetCurrentUserId(out var chefId))
            return Result<Guid>.Failure("User ID not found in token.");

        var dto = request.Dto;

        // 2. اعتبارسنجی اولیه
        if (string.IsNullOrWhiteSpace(dto.Name))
            return Result<Guid>.Failure("نام غذا نمی‌تواند خالی باشد.");

        if (dto.Price <= 0)
            return Result<Guid>.Failure("قیمت باید بزرگتر از صفر باشد.");

        if (dto.PrepTime <= 0)
            return Result<Guid>.Failure("زمان آماده‌سازی باید بزرگتر از صفر باشد.");

        if (dto.StockQuantity < 0)
            return Result<Guid>.Failure("موجودی نمی‌تواند منفی باشد.");

        // 3. بررسی وجود و تأیید شدن آشپز
        var chef = await _chefProfileRepository.GetByIdAsync(chefId, cancellationToken);
        if (chef is null)
            return Result<Guid>.Failure("آشپز یافت نشد.");

        if (chef.Status != ChefProfileStatus.Approved)
            return Result<Guid>.Failure("آشپز تأیید نشده است.");

        // 4. ایجاد غذا
        var dish = new Dish(
            chefId,
            dto.Name,
            dto.Price,
            dto.PrepTime,
            dto.StockQuantity,
            dto.Description
        );

        // 5. تنظیم فیلدهای اختیاری
        if (!string.IsNullOrWhiteSpace(dto.Ingredients))
            dish.SetIngredients(dto.Ingredients);
        
        if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
            dish.SetImageUrl(dto.ImageUrl);

        // 6. ذخیره
        await _dishRepository.AddAsync(dish, cancellationToken);
        
        return Result<Guid>.Success(dish.Id);
    }
}