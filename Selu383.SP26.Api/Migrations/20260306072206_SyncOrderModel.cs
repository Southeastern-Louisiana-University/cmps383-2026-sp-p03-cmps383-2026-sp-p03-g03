using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    /// <inheritdoc />
    public partial class SyncOrderModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_order_items_AspNetUsers_AddedByUserId",
                table: "order_items");

            migrationBuilder.DropForeignKey(
                name: "FK_orders_AspNetUsers_CreatedByUserId",
                table: "orders");

            migrationBuilder.DropForeignKey(
                name: "FK_orders_Locations_LocationId",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_OrderCode",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_order_items_AddedByUserId",
                table: "order_items");

            migrationBuilder.DropColumn(
                name: "AddedByUserId",
                table: "order_items");

            migrationBuilder.AlterColumn<int>(
                name: "Quantity",
                table: "order_items",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 1);

            migrationBuilder.AddForeignKey(
                name: "FK_orders_AspNetUsers_CreatedByUserId",
                table: "orders",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_orders_Locations_LocationId",
                table: "orders",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_orders_AspNetUsers_CreatedByUserId",
                table: "orders");

            migrationBuilder.DropForeignKey(
                name: "FK_orders_Locations_LocationId",
                table: "orders");

            migrationBuilder.AlterColumn<int>(
                name: "Quantity",
                table: "order_items",
                type: "int",
                nullable: false,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "AddedByUserId",
                table: "order_items",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_orders_OrderCode",
                table: "orders",
                column: "OrderCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_order_items_AddedByUserId",
                table: "order_items",
                column: "AddedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_order_items_AspNetUsers_AddedByUserId",
                table: "order_items",
                column: "AddedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_orders_AspNetUsers_CreatedByUserId",
                table: "orders",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_orders_Locations_LocationId",
                table: "orders",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
