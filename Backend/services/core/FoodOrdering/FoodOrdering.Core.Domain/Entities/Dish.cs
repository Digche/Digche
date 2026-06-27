using System;

namespace FoodOrdering.Core.Domain.Entities
{
    public class Dish
    {
        private int _stockQuantity;
        private readonly List<Comment> _comments = new();

        public Guid Id { get; private set; }
        public Guid ChefId { get; private set; }
        public string Name { get; private set; }
        public string? Description { get; private set; }
        public decimal Price { get; private set; }
        public string? ImageUrl { get; private set; }
        public string? Ingredients { get; private set; }
        public int PrepTime { get; private set; }
        public bool IsAvailable { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public string? Category { get; set; }

        public int StockQuantity => _stockQuantity;
        // public ChefProfile Chef { get; private set; }  // <-- حذف شد

        public IReadOnlyCollection<Comment> Comments => _comments.AsReadOnly();

        private Dish() { }

        public Dish(Guid chefId, string name, decimal price, int prepTime, int stockQuantity, string? description = null, string? category = null)
        {
            Id = Guid.NewGuid();
            ChefId = chefId;
            Name = name ?? string.Empty;
            Price = price;
            PrepTime = prepTime;
            Description = description;
            IsAvailable = stockQuantity > 0;
            CreatedAt = DateTime.UtcNow;
            Category = category ?? string.Empty;
            _stockQuantity = stockQuantity < 0 ? 0 : stockQuantity;
        }

        public bool UpdateInfo(string name, string? description, int prepTime,
                               string? ingredients = null, string? imageUrl = null,
                               string? category = null)
        {
            if (string.IsNullOrWhiteSpace(name) || prepTime <= 0)
                return false;

            Name = name;
            Description = description;
            PrepTime = prepTime;
            Ingredients = ingredients ?? Ingredients;
            Category = category;
            ImageUrl = imageUrl ?? ImageUrl;
            return true;
        }

        public bool UpdatePrice(decimal newPrice)
        {
            if (newPrice <= 0)
                return false;

            Price = newPrice;
            return true;
        }

        public bool UpdateAvailability(bool isAvailable)
        {
            if (isAvailable && _stockQuantity == 0)
                return false;

            IsAvailable = isAvailable;
            return true;
        }

        public void UpdateCategory(string newCategory)
        {
            if (!string.IsNullOrWhiteSpace(newCategory))
                Category = newCategory;
        }

        public void SetImageUrl(string? url) => ImageUrl = url;
        public void SetIngredients(string? ingredients) => Ingredients = ingredients;

        public bool ReduceStock(int quantity)
        {
            if (quantity <= 0 || !HasEnoughStock(quantity))
                return false;

            _stockQuantity -= quantity;
            if (_stockQuantity == 0)
                IsAvailable = false;

            return true;
        }

        public bool IncreaseStock(int quantity)
        {
            if (quantity <= 0)
                return false;

            _stockQuantity += quantity;
            return true;
        }

        public bool SetStockQuantity(int newStock)
        {
            if (newStock < 0)
                return false;

            _stockQuantity = newStock;
            if (_stockQuantity == 0)
                IsAvailable = false;

            return true;
        }

        public bool HasEnoughStock(int quantity) => quantity > 0 && _stockQuantity >= quantity;

        public override string ToString() => $"{Name} (موجودی: {_stockQuantity} - {(IsAvailable ? "فعال" : "غیرفعال")})";
    }
}