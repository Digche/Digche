using FoodOrdering.Core.Application.Common;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.DeleteDish;

public class DeleteDishCommand : IRequest<Result<bool>>
{
    public Guid DishId { get; set; }
}