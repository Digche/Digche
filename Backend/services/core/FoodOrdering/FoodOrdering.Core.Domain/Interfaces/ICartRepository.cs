using FoodOrdering.Core.Domain.Entities;

namespace FoodOrdering.Core.Domain.Interfaces;


public interface ICartRepository
{
    Task<Cart?> GetByUserIdWithItemsAsync(Guid userId, CancellationToken cancellation = default);
    Task AddAsync(Cart cart, CancellationToken cancellation = default);
    Task UpdateAsync(Cart cart, CancellationToken cancellation = default);
    Task<bool> ExistsByUserIdAsync(Guid userId, CancellationToken cancellation = default);
}