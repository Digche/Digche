namespace FoodOrdering.Core.Application.DTOs;

public class CreateOrderDto
{
    public Guid ChefId { get; set; }
    public string DeliveryAddress { get; set; } = string.Empty;
}