using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.AddComment
{
    public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, Result<CommentDto>>
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IDishRepository _dishRepository;
        private readonly IUserContext _userContext;

        public AddCommentCommandHandler(
            ICommentRepository commentRepository,
            IDishRepository dishRepository,
            IUserContext userContext)
        {
            _commentRepository = commentRepository;
            _dishRepository = dishRepository;
            _userContext = userContext;
        }

        public async Task<Result<CommentDto>> Handle(AddCommentCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;

            // 1. اعتبارسنجی
            if (string.IsNullOrWhiteSpace(dto.Text))
                return Result<CommentDto>.Failure("متن کامنت نمی‌تواند خالی باشد.");

            if (dto.Rating.HasValue && (dto.Rating.Value < 1 || dto.Rating.Value > 5))
                return Result<CommentDto>.Failure("امتیاز باید بین ۱ تا ۵ باشد.");

            // 2. بررسی وجود غذا
            var dishExists = await _dishRepository.ExistsAsync(dto.DishId, cancellationToken);
            if (!dishExists)
                return Result<CommentDto>.Failure("غذای مورد نظر یافت نشد.");

            // 3. دریافت کاربر جاری
            if (!_userContext.TryGetCurrentUserId(out var userId))
                return Result<CommentDto>.Failure("کاربر احراز هویت نشده است.");

            // 4. ساخت کامنت
            var comment = new Comment(dto.DishId, userId, dto.Text, dto.Rating);

            // 5. ذخیره
            await _commentRepository.AddAsync(comment, cancellationToken);

            await _commentRepository.SaveChangesAsync(cancellationToken);
            // 6. تبدیل به DTO
            var commentDto = new CommentDto
            {
                Id = comment.Id,
                UserId = comment.UserId,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                Rating = comment.Rating
            };

            return Result<CommentDto>.Success(commentDto);
        }
    }
}