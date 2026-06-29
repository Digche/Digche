namespace FoodOrdering.Core.Application.DTOs
{
    public class CreateCommentDto
    {
        public Guid DishId { get; set; }
        public string Text { get; set; } = string.Empty;
        public int? Rating { get; set; } // 1 تا 5
    }
}