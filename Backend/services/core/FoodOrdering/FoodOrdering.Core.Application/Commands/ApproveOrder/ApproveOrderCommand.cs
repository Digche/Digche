using MediatR;
using FoodOrdering.Core.Application.Common;

namespace FoodOrdering.Core.Application.Commands.ApproveOrder;

public class ApproveOrderCommand : IRequest<Result<bool>>
{
    public Guid OrderId { get; }
    public ApproveOrderCommand(Guid orderId) => OrderId = orderId;
}