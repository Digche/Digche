using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodOrdering.Core.Infrastructure.FoodOrdering.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAuthDatabases : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dishes_ChefProfiles_ChefId",
                table: "Dishes");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_ChefProfiles_ChefId",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "ChefProfiles");

            migrationBuilder.DropTable(
                name: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChefProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Balance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    Bio = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    KitchenName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Specialty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChefProfiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChefProfiles_UserId",
                table: "ChefProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Dishes_ChefProfiles_ChefId",
                table: "Dishes",
                column: "ChefId",
                principalTable: "ChefProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_ChefProfiles_ChefId",
                table: "Orders",
                column: "ChefId",
                principalTable: "ChefProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
