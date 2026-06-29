using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodOrdering.Core.Infrastructure.FoodOrdering.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryToDish : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Dishes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "General");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Dishes");
        }
    }
}
