using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodOrdering.Core.Infrastructure.FoodOrdering.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixingCart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId",
                table: "CartItems");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId_DishId",
                table: "CartItems",
                columns: new[] { "CartId", "DishId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId_DishId",
                table: "CartItems");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId",
                table: "CartItems",
                column: "CartId");
        }
    }
}
