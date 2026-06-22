using FoodOrdering.Core.Domain.Entities;

namespace FoodOrdering.Core.Domain.Repositories;

public interface IOrderRepository
{
    Task<Order?> GetByIdWithItemsAsync(Guid id, CancellationToken cancellation = default);
    Task<IEnumerable<Order>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellation = default);
    Task<IEnumerable<Order>> GetByChefIdAsync(Guid chefId, CancellationToken cancellation = default);
    Task AddAsync(Order order, CancellationToken cancellation = default);
    Task UpdateAsync(Order order, CancellationToken cancellation = default);
}