using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public class GetAvailableDishesQueryHandler : IRequestHandler<GetAvailableDishesQuery, Result<IEnumerable<DishDto>>>
{
    private readonly IDishRepository _dishRepository;

    public GetAvailableDishesQueryHandler(IDishRepository dishRepository)
    {
        _dishRepository = dishRepository;
    }

    public async Task<Result<IEnumerable<DishDto>>> Handle(GetAvailableDishesQuery request, CancellationToken cancellationToken)
    {
        var dishes = await _dishRepository.GetAvailableDishesAsync(cancellationToken);
        
        if (dishes == null || !dishes.Any())
            return Result<IEnumerable<DishDto>>.Success(Enumerable.Empty<DishDto>());

        var dtos = dishes.Select(d =>
        {
            double? avg = null;
            if (d.Comments.Any(c => c.Rating.HasValue))
            {
                avg = d.Comments
                    .Where(c => c.Rating.HasValue)
                    .Average(c => c.Rating.Value);
            }

            return new DishDto
            {
                Id = d.Id,
                ChefId = d.ChefId,
                Title = d.Name,
                Description = d.Description,
                Price = d.Price,
                Image = d.ImageUrl,
                Ingredients = d.Ingredients,
                IsAvailable = d.IsAvailable,
                Remaining = d.StockQuantity,
                Category = d.Category,
                Rating = avg
            };
        });

        return Result<IEnumerable<DishDto>>.Success(dtos);
    }
}