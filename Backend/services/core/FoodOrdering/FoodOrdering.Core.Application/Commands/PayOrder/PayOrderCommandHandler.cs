using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.PayOrder;

public class PayOrderCommandHandler : IRequestHandler<PayOrderCommand, Result<bool>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IChefProfileRepository _chefProfileRepository;
    private readonly IUserContext _userContext;

    public PayOrderCommandHandler(
        IOrderRepository orderRepository,
        IChefProfileRepository chefProfileRepository,
        IUserContext userContext)
    {
        _orderRepository = orderRepository;
        _chefProfileRepository = chefProfileRepository;
        _userContext = userContext;
    }

    public async Task<Result<bool>> Handle(PayOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. فقط مشتری (صاحب سفارش) می‌تواند پرداخت کند
        if (!_userContext.TryGetCurrentUserId(out var customerId))
            return Result<bool>.Failure("User not authenticated.");

        // 2. دریافت سفارش
        var order = await _orderRepository.GetByIdWithItemsAsync(request.OrderId, cancellationToken);
        if (order is null)
            return Result<bool>.Failure("Order not found.");

        // 3. بررسی مالکیت
        if (order.CustomerId != customerId)
            return Result<bool>.Failure("You are not the customer of this order.");

        // 4. وضعیت باید ChefApproved باشد
        if (order.Status != Domain.Enums.OrderStatus.ChefApproved)
            return Result<bool>.Failure("Order is not approved by chef yet.");

        // 5. شبیه‌سازی پرداخت (درگاه واقعی نیست)
        //    در اینجا می‌توانید هر منطق دلخواهی قرار دهید

        // 6. تغییر وضعیت به Paid
        if (!order.MarkAsPaid())
            return Result<bool>.Failure("Could not mark order as paid.");

        // 7. واریز مبلغ به حساب آشپز
        var chefProfile = await _chefProfileRepository.GetByIdAsync(order.ChefId, cancellationToken);
        if (chefProfile is null)
            return Result<bool>.Failure("Chef profile not found.");

        chefProfile.AddEarnings(order.TotalPrice);   // کل مبلغ به آشپز تعلق می‌گیرد

        // 8. ذخیره تغییرات (هر دو موجودیت)
        await _orderRepository.UpdateAsync(order, cancellationToken);
        await _chefProfileRepository.UpdateAsync(chefProfile, cancellationToken);

        return Result<bool>.Success(true);
    }
}