using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public class GetChefOrdersQueryHandler : IRequestHandler<GetChefOrdersQuery, Result<IEnumerable<OrderDto>>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUserContext _userContext;
    private readonly IUserServiceClient _userServiceClient; // برای دریافت اطلاعات مشتریان

    public GetChefOrdersQueryHandler(
        IOrderRepository orderRepository,
        IUserContext userContext,
        IUserServiceClient userServiceClient)
    {
        _orderRepository = orderRepository;
        _userContext = userContext;
        _userServiceClient = userServiceClient;
    }

    public async Task<Result<IEnumerable<OrderDto>>> Handle(GetChefOrdersQuery request, CancellationToken cancellationToken)
    {
        // ۱. دریافت شناسه آشپز جاری
        if (!_userContext.TryGetCurrentUserId(out var chefId))
            return Result<IEnumerable<OrderDto>>.Failure("شناسه کاربر در توکن یافت نشد.");

        // ۲. دریافت لیست سفارش‌های مربوط به این آشپز (همراه آیتم‌ها و غذاها)
        var orders = await _orderRepository.GetByChefIdAsync(chefId, cancellationToken);
        if (orders is null || !orders.Any())
            return Result<IEnumerable<OrderDto>>.Success(Enumerable.Empty<OrderDto>());

        // ۳. دریافت اطلاعات مشتریان (برای هر سفارش)
        // برای جلوگیری از درخواست‌های تکراری، اطلاعات را در دیکشنری کش می‌کنیم
        var customerInfoCache = new Dictionary<Guid, AuthUserDto>();

        foreach (var order in orders)
        {
            if (!customerInfoCache.ContainsKey(order.CustomerId))
            {
                try
                {
                    var userInfo = await _userServiceClient.GetUserInfoAsync(order.CustomerId, cancellationToken);
                    customerInfoCache[order.CustomerId] = userInfo;
                }
                catch
                {
                    customerInfoCache[order.CustomerId] = null; // در صورت خطا، null ذخیره می‌شود
                }
            }
        }

        // ۴. نگاشت به DTO جدید
        var orderDtos = orders.Select(order =>
        {
            var userInfo = customerInfoCache.GetValueOrDefault(order.CustomerId);
            var customerName = userInfo != null ? GetDisplayName(userInfo) : "نامشخص";
            var customerPhone = userInfo?.Phone ?? "نامشخص";

            return new OrderDto
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
        });

        return Result<IEnumerable<OrderDto>>.Success(orderDtos);
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