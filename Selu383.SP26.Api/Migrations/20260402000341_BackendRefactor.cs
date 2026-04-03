using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    /// <inheritdoc />
    public partial class BackendRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_orders_OrderId",
                table: "Payments");

            migrationBuilder.DropTable(
                name: "LocationMenuCategory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Payments",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "LocationIds",
                table: "menu_categories");

            migrationBuilder.RenameTable(
                name: "Payments",
                newName: "payments");

            migrationBuilder.RenameColumn(
                name: "ReceiptText",
                table: "receipts",
                newName: "ReceiptUrl");

            migrationBuilder.RenameColumn(
                name: "PaymentDate",
                table: "payments",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_Payments_OrderId",
                table: "payments",
                newName: "IX_payments_OrderId");

            migrationBuilder.AlterColumn<string>(
                name: "TransactionId",
                table: "payments",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethodType",
                table: "payments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Provider",
                table: "payments",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "RemovedAt",
                table: "payments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RemovedReason",
                table: "payments",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "payments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledPickupTime",
                table: "orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Subtotal",
                table: "orders",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Tax",
                table: "orders",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "MenuItemName",
                table: "order_items",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DisabledAt",
                table: "menu_items",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisabledByUserId",
                table: "menu_items",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UnavailableReason",
                table: "menu_items",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_payments",
                table: "payments",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "menu_category_locations",
                columns: table => new
                {
                    MenuCategoryId = table.Column<int>(type: "int", nullable: false),
                    LocationId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_menu_category_locations", x => new { x.MenuCategoryId, x.LocationId });
                    table.ForeignKey(
                        name: "FK_menu_category_locations_locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_menu_category_locations_menu_categories_MenuCategoryId",
                        column: x => x.MenuCategoryId,
                        principalTable: "menu_categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "payment_methods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CardholderName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Last4 = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    ExpMonth = table.Column<int>(type: "int", nullable: false),
                    ExpYear = table.Column<int>(type: "int", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payment_methods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_payment_methods_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tables_LocationId_TableNumber",
                table: "tables",
                columns: new[] { "LocationId", "TableNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_menu_items_DisabledByUserId",
                table: "menu_items",
                column: "DisabledByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_menu_category_locations_LocationId",
                table: "menu_category_locations",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_payment_methods_UserId",
                table: "payment_methods",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_menu_items_AspNetUsers_DisabledByUserId",
                table: "menu_items",
                column: "DisabledByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_payments_orders_OrderId",
                table: "payments",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_menu_items_AspNetUsers_DisabledByUserId",
                table: "menu_items");

            migrationBuilder.DropForeignKey(
                name: "FK_payments_orders_OrderId",
                table: "payments");

            migrationBuilder.DropTable(
                name: "menu_category_locations");

            migrationBuilder.DropTable(
                name: "payment_methods");

            migrationBuilder.DropIndex(
                name: "IX_tables_LocationId_TableNumber",
                table: "tables");

            migrationBuilder.DropPrimaryKey(
                name: "PK_payments",
                table: "payments");

            migrationBuilder.DropIndex(
                name: "IX_menu_items_DisabledByUserId",
                table: "menu_items");

            migrationBuilder.DropColumn(
                name: "PaymentMethodType",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "Provider",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "RemovedAt",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "RemovedReason",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "ScheduledPickupTime",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Subtotal",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Tax",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "MenuItemName",
                table: "order_items");

            migrationBuilder.DropColumn(
                name: "DisabledAt",
                table: "menu_items");

            migrationBuilder.DropColumn(
                name: "DisabledByUserId",
                table: "menu_items");

            migrationBuilder.DropColumn(
                name: "UnavailableReason",
                table: "menu_items");

            migrationBuilder.RenameTable(
                name: "payments",
                newName: "Payments");

            migrationBuilder.RenameColumn(
                name: "ReceiptUrl",
                table: "receipts",
                newName: "ReceiptText");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Payments",
                newName: "PaymentDate");

            migrationBuilder.RenameIndex(
                name: "IX_payments_OrderId",
                table: "Payments",
                newName: "IX_Payments_OrderId");

            migrationBuilder.AlterColumn<string>(
                name: "TransactionId",
                table: "Payments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Payments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LocationIds",
                table: "menu_categories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Payments",
                table: "Payments",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "LocationMenuCategory",
                columns: table => new
                {
                    LocationsId = table.Column<int>(type: "int", nullable: false),
                    MenuCategoriesId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationMenuCategory", x => new { x.LocationsId, x.MenuCategoriesId });
                    table.ForeignKey(
                        name: "FK_LocationMenuCategory_locations_LocationsId",
                        column: x => x.LocationsId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LocationMenuCategory_menu_categories_MenuCategoriesId",
                        column: x => x.MenuCategoriesId,
                        principalTable: "menu_categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LocationMenuCategory_MenuCategoriesId",
                table: "LocationMenuCategory",
                column: "MenuCategoriesId");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_orders_OrderId",
                table: "Payments",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
