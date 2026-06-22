namespace FoodOrdering.Core.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public Guid DishId { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalPrice => Quantity * UnitPrice;

    public Order? Order { get; private set; }
    public Dish? Dish { get; private set; }

    private OrderItem() { }

    public OrderItem(Guid orderId, Guid dishId, int quantity, decimal unitPrice)
    {
        Id = Guid.NewGuid();
        OrderId = orderId;
        DishId = dishId;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }
}