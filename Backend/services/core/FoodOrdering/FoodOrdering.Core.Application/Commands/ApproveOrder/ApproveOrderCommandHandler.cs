using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.ApproveOrder;

public class ApproveOrderCommandHandler : IRequestHandler<ApproveOrderCommand, Result<bool>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUserContext _userContext;

    public ApproveOrderCommandHandler(
        IOrderRepository orderRepository,
        IUserContext userContext)
    {
        _orderRepository = orderRepository;
        _userContext = userContext;
    }

    public async Task<Result<bool>> Handle(ApproveOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. فقط نقش chef مجاز است
        var role = _userContext.GetCurrentUserRole();
        if (role != "chef")
            return Result<bool>.Failure("Only chefs can approve orders.");

        // 2. دریافت سفارش
        var order = await _orderRepository.GetByIdWithItemsAsync(request.OrderId, cancellationToken);
        if (order is null)
            return Result<bool>.Failure("Order not found.");

        // 3. بررسی اینکه آشپز جاری همان آشپز سفارش است
        var chefId = _userContext.GetCurrentUserId();
        // var chefProfile = await _chefProfileRepository.GetByUserIdAsync(chefId, cancellationToken);
        // if (chefProfile is null || chefProfile.Id != order.ChefId)
        //     return Result<bool>.Failure("You are not the chef for this order.");

        // 4. تأیید سفارش
        if (!order.Approve())
            return Result<bool>.Failure("Order cannot be approved in its current status.");

        await _orderRepository.UpdateAsync(order, cancellationToken);
        return Result<bool>.Success(true);
    }
}