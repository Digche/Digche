namespace FoodOrdering.Core.Domain.Entities;

public class Cart
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private readonly List<CartItem> _items = new();
    public IReadOnlyCollection<CartItem> Items => _items;

    private Cart() { }

    public Cart(Guid userId)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        CreatedAt = DateTime.UtcNow;
    }

    public bool AddItem(Guid dishId, int quantity)
    {
        if (quantity <= 0) return false;
        var existing = _items.FirstOrDefault(i => i.DishId == dishId);
        if (existing != null)
            existing.IncreaseQuantity(quantity);
        else
            _items.Add(new CartItem(Id, dishId, quantity));
        return true;
    }

    public bool RemoveItem(Guid dishId)
    {
        var item = _items.FirstOrDefault(i => i.DishId == dishId);
        if (item == null) return false;
        _items.Remove(item);
        return true;
    }

    public bool Clear()
    {
        if (_items.Count == 0) return false;
        _items.Clear();
        return true;
    }
}