using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    /// <inheritdoc />
    public partial class ResolvePendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_reservations_TableId",
                table: "reservations");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_TableId_ReservedFor",
                table: "reservations",
                columns: new[] { "TableId", "ReservedFor" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_reservations_TableId_ReservedFor",
                table: "reservations");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_TableId",
                table: "reservations",
                column: "TableId");
        }
    }
}
