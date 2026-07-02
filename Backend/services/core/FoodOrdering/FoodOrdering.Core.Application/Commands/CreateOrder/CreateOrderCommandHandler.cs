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
    private readonly IUserServiceClient _userServiceClient; // ← سرویس جدید

    public CreateOrderCommandHandler(
        ICartRepository cartRepository,
        IOrderRepository orderRepository,
        IDishRepository dishRepository,
        IUserContext userContext,
        IUserServiceClient userServiceClient)
    {
        _cartRepository = cartRepository;
        _orderRepository = orderRepository;
        _dishRepository = dishRepository;
        _userContext = userContext;
        _userServiceClient = userServiceClient;
    }

    public async Task<Result<OrderDto>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // ۱. دریافت شناسه کاربر جاری
        if (!_userContext.TryGetCurrentUserId(out var customerId))
            return Result<OrderDto>.Failure("شناسه کاربر در توکن یافت نشد.");

        // ۲. دریافت اطلاعات کاربر از سرویس Auth
        var userInfo = await _userServiceClient.GetUserInfoAsync(customerId, cancellationToken);
        if (userInfo is null)
            return Result<OrderDto>.Failure("اطلاعات کاربر یافت نشد.");

        // ۳. دریافت سبد خرید
        var cart = await _cartRepository.GetByUserIdWithItemsAsync(customerId, cancellationToken);
        if (cart is null || !cart.Items.Any())
            return Result<OrderDto>.Failure("سبد خرید خالی است.");

        // ۴. استخراج ChefId از آیتم‌های سبد (همه باید یک آشپز داشته باشند)
        var chefIds = new HashSet<Guid>();
        var dishDictionary = new Dictionary<Guid, Dish>(); // برای نگهداری غذاها

        foreach (var cartItem in cart.Items)
        {
            var dish = await _dishRepository.GetByIdAsync(cartItem.DishId, cancellationToken);
            if (dish is null)
                return Result<OrderDto>.Failure($"غذایی با شناسه {cartItem.DishId} یافت نشد.");

            dishDictionary[cartItem.DishId] = dish;
            chefIds.Add(dish.ChefId); // فرض بر این است که Dish دارای ChefId است
        }

        if (chefIds.Count == 0)
            return Result<OrderDto>.Failure("هیچ آشپزی برای سفارش یافت نشد.");
        if (chefIds.Count > 1)
            return Result<OrderDto>.Failure("سبد خرید شامل آیتم‌هایی از چند آشپز است. لطفاً هر آشپز را جداگانه سفارش دهید.");

        var chefId = chefIds.First();

        // ۵. دریافت آدرس تحویل (از اطلاعات کاربر)
        var deliveryAddress = !string.IsNullOrWhiteSpace(userInfo.Address) 
            ? userInfo.Address 
            : "آدرس ثبت نشده";

        // ۶. محاسبه هزینه ارسال (فعلاً ثابت، بعداً از پروفایل آشپز قابل دریافت است)
        var deliveryFee = 100;

        // ۷. ایجاد سفارش
        var order = new Order(
            customerId,
            chefId,
            deliveryAddress,
            deliveryFee
        );

        // ۸. افزودن آیتم‌های سبد به سفارش با بررسی موجودی
        foreach (var cartItem in cart.Items)
        {
            var dish = dishDictionary[cartItem.DishId];

            if (!dish.IsAvailable || !dish.HasEnoughStock(cartItem.Quantity))
                return Result<OrderDto>.Failure($"غذای '{dish.Name}' موجود نیست یا موجودی کافی نیست.");

            if (!order.AddItem(dish, cartItem.Quantity))
                return Result<OrderDto>.Failure($"خطا در افزودن آیتم '{dish.Name}' به سفارش.");

            await _dishRepository.UpdateAsync(dish, cancellationToken);
        }

        // ۹. ذخیره سفارش
        await _orderRepository.AddAsync(order, cancellationToken);

        // ۱۰. خالی کردن سبد خرید
        cart.Clear();
        await _cartRepository.UpdateAsync(cart, cancellationToken);

        // ۱۱. ساخت DTO خروجی مطابق درخواست شما
        var orderDto = new OrderDto
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            ChefId = order.ChefId,
            CustomerName = GetDisplayName(userInfo),
            CustomerPhone = userInfo.Phone ?? "نامشخص",
            Status = order.Status,
            OrderedAt = order.CreatedAt,
            Items = order.Items.Select(item => new OrderItemDto
            {
                FoodId = item.DishId,
                FoodTitle = dishDictionary[item.DishId]?.Name ?? "نامشخص",
                FoodImage = dishDictionary[item.DishId]?.ImageUrl ?? string.Empty,
                Quantity = item.Quantity,
                Price = item.UnitPrice,
                Unit = "تومان"
            }).ToList()
        };

        return Result<OrderDto>.Success(orderDto);
    }

    // متد کمکی برای ساخت نام کامل
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