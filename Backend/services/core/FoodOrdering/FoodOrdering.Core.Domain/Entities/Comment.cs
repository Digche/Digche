using System;

namespace FoodOrdering.Core.Domain.Entities
{
    public class Comment
    {
        public Guid Id { get; private set; }
        public Guid DishId { get; private set; }
        public Guid UserId { get; private set; }
        public string Text { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public int? Rating { get; private set; } // اختیاری (۱ تا ۵)

        // Navigation property (اختیاری، برای بارگذاری Eager)
        public Dish? Dish { get; private set; }

        private Comment() { }

        public Comment(Guid dishId, Guid userId, string text, int? rating = null)
        {
            Id = Guid.NewGuid();
            DishId = dishId;
            UserId = userId;
            Text = text ?? throw new ArgumentNullException(nameof(text));
            CreatedAt = DateTime.UtcNow;
            Rating = rating;
        }

        public void UpdateText(string newText)
        {
            Text = newText ?? throw new ArgumentNullException(nameof(newText));
        }
    }
}