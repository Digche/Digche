using FoodOrdering.Core.Domain.Enums;

namespace FoodOrdering.Core.Domain.Entities;

public class ChefProfile
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string? KitchenName { get; private set; }
    public string? Specialty { get; private set; }
    public string? Bio { get; private set; }
    public ChefProfileStatus Status { get; private set; }

    private readonly List<Dish> _dishes = new();
    public IReadOnlyCollection<Dish> Dishes => _dishes.AsReadOnly();

    private readonly List<Order> _orders = new();
    public IReadOnlyCollection<Order> Orders => _orders.AsReadOnly();

    private ChefProfile() { }

    public ChefProfile(Guid userId, string? kitchenName = null, string? specialty = null, string? bio = null)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        KitchenName = kitchenName;
        Specialty = specialty;
        Bio = bio;
        Status = ChefProfileStatus.Pending;
    }

    public void Approve() => Status = ChefProfileStatus.Approved;
    public void Suspend() => Status = ChefProfileStatus.Suspended;
    public void UpdateProfile(string? kitchenName, string? specialty, string? bio)
    {
        KitchenName = kitchenName ?? KitchenName;
        Specialty = specialty ?? Specialty;
        Bio = bio ?? Bio;
    }
}