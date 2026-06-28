using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries.GetDishComments
{
    public class GetDishCommentsQueryHandler : IRequestHandler<GetDishCommentsQuery, Result<IEnumerable<CommentDto>>>
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IDishRepository _dishRepository;

        public GetDishCommentsQueryHandler(ICommentRepository commentRepository, IDishRepository dishRepository)
        {
            _commentRepository = commentRepository;
            _dishRepository = dishRepository;
        }

        public async Task<Result<IEnumerable<CommentDto>>> Handle(GetDishCommentsQuery request, CancellationToken cancellationToken)
        {
            // بررسی وجود غذا (اختیاری)
            var dishExists = await _dishRepository.ExistsAsync(request.DishId, cancellationToken);
            if (!dishExists)
                return Result<IEnumerable<CommentDto>>.Failure("غذای مورد نظر یافت نشد.");

            var comments = await _commentRepository.GetByDishIdAsync(request.DishId, cancellationToken);

            var commentDtos = comments.Select(c => new CommentDto
            {
                Id = c.Id,
                UserId = c.UserId,
                Text = c.Text,
                CreatedAt = c.CreatedAt,
                Rating = c.Rating
            });

            return Result<IEnumerable<CommentDto>>.Success(commentDtos);
        }
    }
}