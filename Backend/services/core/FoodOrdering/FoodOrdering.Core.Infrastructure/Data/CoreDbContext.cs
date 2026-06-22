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
    public DbSet<ChefProfile> ChefProfiles { get; set; }
    public DbSet<Dish> Dishes { get; set; }
    public DbSet<User> Users { get; set; } // جدید

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ---- User (فقط برای روابط) ----
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.ToTable("Users"); // فرض می‌کنیم جدول Users در دیتابیس وجود دارد (توسط سرویس Auth ایجاد شده)
            // هیچ فیلد دیگری تعریف نمی‌کنیم
        });

        // ---- Cart ----
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.UserId).IsRequired();
            entity.HasIndex(c => c.UserId).IsUnique();
            // رابطه با User (بدون navigation)
        });

        // ---- CartItem ----
        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(ci => ci.Id);
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

            // رابطه با ChefProfile
            entity.HasOne(o => o.Chef)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.ChefId)
                .OnDelete(DeleteBehavior.Restrict);

            // رابطه با User (برای Customer) – بدون navigation
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

        // ---- ChefProfile ----
        modelBuilder.Entity<ChefProfile>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.UserId).IsRequired();
            entity.HasIndex(c => c.UserId).IsUnique();
            entity.Property(c => c.Status)
                .HasConversion<string>()
                .HasMaxLength(20);
            entity.Property(c => c.KitchenName).HasMaxLength(100);
            entity.Property(c => c.Specialty).HasMaxLength(100);
            entity.Property(c => c.Bio).HasMaxLength(500);

            // رابطه با User (بدون navigation)
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
            entity.HasIndex(d => d.ChefId);
            entity.HasIndex(d => d.IsAvailable);

            entity.HasOne(d => d.Chef)
                .WithMany(c => c.Dishes)
                .HasForeignKey(d => d.ChefId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}