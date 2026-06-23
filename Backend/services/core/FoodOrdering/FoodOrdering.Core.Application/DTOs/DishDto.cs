namespace FoodOrdering.Core.Application.DTOs;

public class DishDto
{
    public Guid Id { get; set; }
    public Guid ChefId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Ingredients { get; set; }
    public int PrepTime { get; set; }
    public bool IsAvailable { get; set; }
    public int StockQuantity { get; set; }  // <-- اضافه شد
    public DateTime CreatedAt { get; set; }
}