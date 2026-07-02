using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Core.Infrastructure.Repositories;

public class CartRepository : ICartRepository
{
    private readonly CoreDbContext _context;

    public CartRepository(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetByUserIdWithItemsAsync(
        Guid userId,
        CancellationToken cancellation = default
    )
    {
        return await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Dish)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellation);
    }

    public async Task AddAsync(
        Cart cart,
        CancellationToken cancellation = default
    )
    {
        await _context.Carts.AddAsync(cart, cancellation);
    }

    public async Task UpdateAsync(
        Cart cart,
        CancellationToken cancellation = default
    )
    {
        foreach (var entry in _context.ChangeTracker.Entries<CartItem>())
        {
            if (entry.State != EntityState.Modified)
            {
                continue;
            }

            var exists = await _context.CartItems
                .AsNoTracking()
                .AnyAsync(item => item.Id == entry.Entity.Id, cancellation);

            if (!exists)
            {
                entry.State = EntityState.Added;
            }
        }

        await _context.SaveChangesAsync(cancellation);
    }

    public async Task<bool> ExistsByUserIdAsync(
        Guid userId,
        CancellationToken cancellation = default
    )
    {
        return await _context.Carts
            .AnyAsync(c => c.UserId == userId, cancellation);
    }
}