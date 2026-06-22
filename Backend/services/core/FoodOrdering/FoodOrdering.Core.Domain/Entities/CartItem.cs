namespace FoodOrdering.Core.Domain.Entities;

public class CartItem
{
    public Guid Id { get; private set; }
    public Guid CartId { get; private set; }
    public Guid DishId { get; private set; }
    public int Quantity { get; private set; }

    public Cart? Cart { get; private set; }
    public Dish? Dish { get; private set; }

    private CartItem() { }

    public CartItem(Guid cartId, Guid dishId, int quantity)
    {
        Id = Guid.NewGuid();
        CartId = cartId;
        DishId = dishId;
        Quantity = quantity;
    }

    public void IncreaseQuantity(int amount) => Quantity += amount;
}