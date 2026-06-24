using MediatR;
using FoodOrdering.Core.Application.Common;

namespace FoodOrdering.Core.Application.Commands.PayOrder;

public class PayOrderCommand : IRequest<Result<bool>>
{
    public Guid OrderId { get; }
    public PayOrderCommand(Guid orderId) => OrderId = orderId;
}