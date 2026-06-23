using FoodOrdering.Core.Domain.Entities;

namespace FoodOrdering.Core.Domain.Repositories;

public interface IChefProfileRepository
{
    Task<ChefProfile?> GetByIdAsync(Guid id, CancellationToken cancellation = default);
    Task<ChefProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellation = default);
    Task<IEnumerable<ChefProfile>> GetAllApprovedAsync(CancellationToken cancellation = default);
    Task AddAsync(ChefProfile chef, CancellationToken cancellation = default);
    Task UpdateAsync(ChefProfile chef, CancellationToken cancellation = default);
    Task<bool> ExistsByUserIdAsync(Guid userId, CancellationToken cancellation = default);
}