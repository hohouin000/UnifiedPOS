using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UnifiedPOS.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBillNumberRemarkCollected : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BillNumber",
                table: "Orders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "CollectedAt",
                table: "Orders",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Remark",
                table: "Orders",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BillNumber",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CollectedAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Remark",
                table: "Orders");
        }
    }
}
