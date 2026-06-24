using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using MediatR;

namespace FoodOrdering.Core.Application.Queries.GetDishComments
{
    public class GetDishCommentsQuery : IRequest<Result<IEnumerable<CommentDto>>>
    {
        public Guid DishId { get; }

        public GetDishCommentsQuery(Guid dishId)
        {
            DishId = dishId;
        }
    }
}