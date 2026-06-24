using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.AddComment
{
    public class AddCommentCommand : IRequest<Result<CommentDto>>
    {
        public CreateCommentDto Dto { get; }

        public AddCommentCommand(CreateCommentDto dto)
        {
            Dto = dto;
        }
    }
}