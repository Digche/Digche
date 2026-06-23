namespace FoodOrdering.Core.Application.DTOs;

public class CreateDishDto
{
    public Guid ChefId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int PrepTime { get; set; }
    public int StockQuantity { get; set; }
    public string? Description { get; set; }
    public string? Ingredients { get; set; }
    public string? ImageUrl { get; set; }
}