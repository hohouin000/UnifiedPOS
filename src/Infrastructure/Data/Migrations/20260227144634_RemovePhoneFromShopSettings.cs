using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UnifiedPOS.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemovePhoneFromShopSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Phone",
                table: "ShopSettings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "ShopSettings",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
