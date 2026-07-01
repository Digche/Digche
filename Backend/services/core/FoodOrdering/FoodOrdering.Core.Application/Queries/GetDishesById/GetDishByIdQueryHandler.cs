using System.ComponentModel;
using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public class GetDishByIdQueryHandler : IRequestHandler<GetDishByIdQuery, Result<DishDto>>
{
    private readonly IDishRepository _dishRepository;

    public GetDishByIdQueryHandler(IDishRepository dishRepository)
    {
        _dishRepository = dishRepository;
    }

    public async Task<Result<DishDto>> Handle(GetDishByIdQuery request, CancellationToken cancellationToken)
    {
        var dish = await _dishRepository.GetByIdAsync(request.Id, cancellationToken);
        if (dish is null)
            return Result<DishDto>.Failure("غذا یافت نشد.");

        double? averageRating = null;
        if (dish.Comments.Any(c => c.Rating.HasValue))
        {
            averageRating = dish.Comments
                .Where(c => c.Rating.HasValue)
                .Average(c => c.Rating.Value);
        }

        var dto = new DishDto
        {
            Id = dish.Id,
            ChefId = dish.ChefId,
            Title = dish.Name,
            Description = dish.Description,
            Price = dish.Price,
            Image = dish.ImageUrl,
            Ingredients = dish.Ingredients,
            IsAvailable = dish.IsAvailable,
            Remaining = dish.StockQuantity,
            Category = dish.Category,
            Rating = averageRating
        };

        return Result<DishDto>.Success(dto);
    }
}