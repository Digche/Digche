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
        // دریافت غذاهای موجود
        var dishes = await _dishRepository.GetAvailableDishesAsync(cancellationToken);
        
        if (dishes == null || !dishes.Any())
            return Result<IEnumerable<DishDto>>.Success(Enumerable.Empty<DishDto>());

        // نگاشت دستی به DTO
        var dtos = dishes.Select(d => new DishDto
        {
            Id = d.Id,
            ChefId = d.ChefId,
            Name = d.Name,
            Description = d.Description,
            Price = d.Price,
            ImageUrl = d.ImageUrl,
            Ingredients = d.Ingredients,
            PrepTime = d.PrepTime,
            IsAvailable = d.IsAvailable,
            StockQuantity = d.StockQuantity,
            CreatedAt = d.CreatedAt
        });

        return Result<IEnumerable<DishDto>>.Success(dtos);
    }
}