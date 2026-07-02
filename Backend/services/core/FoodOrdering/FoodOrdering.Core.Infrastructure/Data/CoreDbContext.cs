using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Core.Infrastructure.Data;

public class CoreDbContext : DbContext
{
    public CoreDbContext(DbContextOptions<CoreDbContext> options) : base(options) { }

    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Dish> Dishes { get; set; }
    public DbSet<Comment> Comments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ---- Cart ----
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.Id).ValueGeneratedNever();

            entity.Property(c => c.UserId).IsRequired();

            entity.HasIndex(c => c.UserId).IsUnique();

            entity.Navigation(c => c.Items).UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        // ---- CartItem ----
        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(ci => ci.Id);
            entity.Property(ci => ci.Id).ValueGeneratedNever();
            entity.Property(ci => ci.Quantity).IsRequired();

            entity.HasIndex(ci => new {ci.CartId, ci.DishId}).IsUnique();
            entity.HasOne(ci => ci.Cart)
                .WithMany(c => c.Items)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ci => ci.Dish)
                .WithMany()
                .HasForeignKey(ci => ci.DishId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ---- Order ----
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.DeliveryAddress).IsRequired().HasMaxLength(500);
            entity.Property(o => o.DeliveryFee).HasPrecision(18, 2);
            entity.Property(o => o.TotalPrice).HasPrecision(18, 2);
            entity.Property(o => o.Status)
                .HasConversion<string>()
                .HasMaxLength(20);
            entity.HasIndex(o => o.CustomerId);
            entity.HasIndex(o => o.ChefId);
        });

        // ---- OrderItem ----
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(oi => oi.Id);
            entity.Property(oi => oi.UnitPrice).HasPrecision(18, 2);
            entity.HasOne(oi => oi.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(oi => oi.Dish)
                .WithMany()
                .HasForeignKey(oi => oi.DishId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ---- Dish ----
        modelBuilder.Entity<Dish>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Name).IsRequired().HasMaxLength(100);
            entity.Property(d => d.Description).HasMaxLength(500);
            entity.Property(d => d.Price).HasPrecision(18, 2);
            entity.Property(d => d.Ingredients).HasMaxLength(500);
            entity.Property(d => d.ImageUrl).HasMaxLength(500);
            entity.Property(d => d.Category)
                  .HasMaxLength(100)
                  .IsRequired()
                  .HasDefaultValue("General");
            entity.HasIndex(d => d.ChefId);
            entity.HasIndex(d => d.IsAvailable);
            entity.Property(d => d.StockQuantity)
                .HasField("_stockQuantity")
                .UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        // ---- Comment ----
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Text).IsRequired().HasMaxLength(1000);
            entity.Property(c => c.Rating);
            entity.HasIndex(c => c.DishId);
            entity.HasIndex(c => c.UserId);
            entity.HasOne(c => c.Dish)
                .WithMany(d => d.Comments)
                .HasForeignKey(c => c.DishId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}