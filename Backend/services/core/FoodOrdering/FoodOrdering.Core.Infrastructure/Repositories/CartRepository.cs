using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Core.Infrastructure.Repositories;

public class CartRepository : ICartRepository
{
    private readonly CoreDbContext _context;

    public CartRepository(CoreDbContext context) => _context = context;

    public async Task<Cart?> GetByUserIdWithItemsAsync(Guid userId, CancellationToken cancellation = default)
        => await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Dish)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellation);

    // فقط افزودن به ChangeTracker، بدون SaveChanges
    public async Task AddAsync(Cart cart, CancellationToken cancellation = default)
    {
        await _context.Carts.AddAsync(cart, cancellation);
        // SaveChanges حذف شد
    }

    public async Task UpdateAsync(Cart cart, CancellationToken cancellation = default)
    {
        foreach (var e in _context.ChangeTracker.Entries())
        {
            Console.WriteLine($"{e.Entity.GetType().Name} : {e.State}");
        }

        await _context.SaveChangesAsync(cancellation);
    }

    public async Task<bool> ExistsByUserIdAsync(Guid userId, CancellationToken cancellation = default)
        => await _context.Carts.AnyAsync(c => c.UserId == userId, cancellation);
}