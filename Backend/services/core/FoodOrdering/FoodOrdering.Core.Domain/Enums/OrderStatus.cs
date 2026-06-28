namespace FoodOrdering.Core.Domain.Enums;

public enum OrderStatus
{
    Registered,
    ChefApproved,
    Paid,
    Preparing,
    Shipped,
    Delivered,
    Cancelled
}