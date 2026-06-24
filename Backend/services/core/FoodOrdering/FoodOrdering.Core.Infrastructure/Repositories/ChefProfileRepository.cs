using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Core.Infrastructure.Repositories;

public class ChefProfileRepository : IChefProfileRepository
{
    private readonly CoreDbContext _context;

    public ChefProfileRepository(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<ChefProfile?> GetByIdAsync(Guid id, CancellationToken cancellation = default)
        => await _context.ChefProfiles
            .Include(c => c.Dishes)
            .FirstOrDefaultAsync(c => c.Id == id, cancellation);

    public async Task<ChefProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellation = default)
        => await _context.ChefProfiles
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellation);

    public async Task<IEnumerable<ChefProfile>> GetAllAsync(CancellationToken cancellation = default)
        => await _context.ChefProfiles.ToListAsync(cancellation);

    public async Task AddAsync(ChefProfile profile, CancellationToken cancellation = default)
        => await _context.ChefProfiles.AddAsync(profile, cancellation);

    public Task UpdateAsync(ChefProfile profile, CancellationToken cancellation = default)
    {
        _context.ChefProfiles.Update(profile);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsByUserIdAsync(Guid userId, CancellationToken cancellation = default)
        => await _context.ChefProfiles.AnyAsync(c => c.UserId == userId, cancellation);
}