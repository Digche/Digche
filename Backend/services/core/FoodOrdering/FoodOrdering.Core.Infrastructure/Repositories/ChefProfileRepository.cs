using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Core.Infrastructure.Repositories;

public class ChefProfileRepository : IChefProfileRepository
{
    private readonly CoreDbContext _context;

    public ChefProfileRepository(CoreDbContext context) => _context = context;

    public async Task<ChefProfile?> GetByIdAsync(Guid id, CancellationToken cancellation = default)
        => await _context.ChefProfiles.FirstOrDefaultAsync(c => c.Id == id, cancellation);

    public async Task<ChefProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellation = default)
        => await _context.ChefProfiles.FirstOrDefaultAsync(c => c.UserId == userId, cancellation);

    public async Task<IEnumerable<ChefProfile>> GetAllApprovedAsync(CancellationToken cancellation = default)
        => await _context.ChefProfiles
            .Where(c => c.Status == Domain.Enums.ChefProfileStatus.Approved)
            .ToListAsync(cancellation);

    public async Task AddAsync(ChefProfile chef, CancellationToken cancellation = default)
        => await _context.ChefProfiles.AddAsync(chef, cancellation);

    public Task UpdateAsync(ChefProfile chef, CancellationToken cancellation = default)
    {
        _context.ChefProfiles.Update(chef);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsByUserIdAsync(Guid userId, CancellationToken cancellation = default)
        => await _context.ChefProfiles.AnyAsync(c => c.UserId == userId, cancellation);
}