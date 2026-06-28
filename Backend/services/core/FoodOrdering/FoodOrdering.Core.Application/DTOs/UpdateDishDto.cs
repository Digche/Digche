namespace FoodOrdering.Core.Application.DTOs;

public class UpdateDishDto
{
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public string? Ingredients { get; set; }
    public string? Image { get; set; }
    public int Remaining { get; set; }
    public string? Category { get; set; }

}
