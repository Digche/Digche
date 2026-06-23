using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Core.Infrastructure.Repositories;

public class DishRepository : IDishRepository
{
    private readonly CoreDbContext _context;

    public DishRepository(CoreDbContext context)
        => _context = context;

    public async Task<Dish?> GetByIdAsync(Guid id, CancellationToken cancellation = default)
        => await _context.Dishes.FindAsync(new object[] { id }, cancellation);

    public async Task<IEnumerable<Dish>> GetByChefIdAsync(Guid chefId, CancellationToken cancellation = default)
        => await _context.Dishes
            .Where(d => d.ChefId == chefId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellation);

    public async Task<IEnumerable<Dish>> GetAvailableDishesAsync(CancellationToken cancellation = default)
        => await _context.Dishes
            .Where(d => d.IsAvailable)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellation);

    public async Task AddAsync(Dish dish, CancellationToken cancellation = default)
        => await _context.Dishes.AddAsync(dish, cancellation);

    public Task UpdateAsync(Dish dish, CancellationToken cancellation = default)
    {
        _context.Dishes.Update(dish);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellation = default)
        => await _context.Dishes.AnyAsync(d => d.Id == id, cancellation);
}