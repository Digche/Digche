namespace FoodOrdering.Core.Application.DTOs;

public class UpdateDishDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int PrepTime { get; set; }
    public string? Description { get; set; }
    public string? Ingredients { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; }
}