using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    public partial class BackendRefactor : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_orders_OrderId",
                table: "Payments");

            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[menu_category_locations]', N'U') IS NULL
BEGIN
    CREATE TABLE [menu_category_locations] (
        [MenuCategoryId] int NOT NULL,
        [LocationId] int NOT NULL,
        CONSTRAINT [PK_menu_category_locations] PRIMARY KEY ([MenuCategoryId], [LocationId]),
        CONSTRAINT [FK_menu_category_locations_locations_LocationId]
            FOREIGN KEY ([LocationId]) REFERENCES [locations]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_menu_category_locations_menu_categories_MenuCategoryId]
            FOREIGN KEY ([MenuCategoryId]) REFERENCES [menu_categories]([Id]) ON DELETE CASCADE
    );

    CREATE INDEX [IX_menu_category_locations_LocationId]
        ON [menu_category_locations] ([LocationId]);
END

IF OBJECT_ID(N'[LocationMenuCategory]', N'U') IS NOT NULL
BEGIN
    INSERT INTO [menu_category_locations] ([MenuCategoryId], [LocationId])
    SELECT [MenuCategoriesId], [LocationsId]
    FROM [LocationMenuCategory]
    WHERE NOT EXISTS (
        SELECT 1
        FROM [menu_category_locations] mcl
        WHERE mcl.[MenuCategoryId] = [LocationMenuCategory].[MenuCategoriesId]
          AND mcl.[LocationId] = [LocationMenuCategory].[LocationsId]
    );

    DROP TABLE [LocationMenuCategory];
END
");

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
                nullable: true);

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

            // ✅ FIXED HERE
            migrationBuilder.Sql(@"
IF COL_LENGTH('orders', 'ScheduledPickupTime') IS NULL
BEGIN
    ALTER TABLE [orders] ADD [ScheduledPickupTime] datetime2 NULL;
END
");

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

            migrationBuilder.AddForeignKey(
                name: "FK_payments_orders_OrderId",
                table: "payments",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_payments_orders_OrderId",
                table: "payments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_payments",
                table: "payments");

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

            // ✅ FIXED HERE
            migrationBuilder.Sql(@"
IF COL_LENGTH('orders', 'ScheduledPickupTime') IS NOT NULL
BEGIN
    ALTER TABLE [orders] DROP COLUMN [ScheduledPickupTime];
END
");

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

            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[LocationMenuCategory]', N'U') IS NULL
BEGIN
    CREATE TABLE [LocationMenuCategory] (
        [LocationsId] int NOT NULL,
        [MenuCategoriesId] int NOT NULL,
        CONSTRAINT [PK_LocationMenuCategory] PRIMARY KEY ([LocationsId], [MenuCategoriesId]),
        CONSTRAINT [FK_LocationMenuCategory_Locations_LocationsId]
            FOREIGN KEY ([LocationsId]) REFERENCES [locations]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_LocationMenuCategory_menu_categories_MenuCategoriesId]
            FOREIGN KEY ([MenuCategoriesId]) REFERENCES [menu_categories]([Id]) ON DELETE CASCADE
    );

    CREATE INDEX [IX_LocationMenuCategory_MenuCategoriesId]
        ON [LocationMenuCategory] ([MenuCategoriesId]);
END

IF OBJECT_ID(N'[menu_category_locations]', N'U') IS NOT NULL
BEGIN
    INSERT INTO [LocationMenuCategory] ([LocationsId], [MenuCategoriesId])
    SELECT [LocationId], [MenuCategoryId]
    FROM [menu_category_locations]
    WHERE NOT EXISTS (
        SELECT 1
        FROM [LocationMenuCategory] lmc
        WHERE lmc.[LocationsId] = [menu_category_locations].[LocationId]
          AND lmc.[MenuCategoriesId] = [menu_category_locations].[MenuCategoryId]
    );

    DROP TABLE [menu_category_locations];
END
");

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

            migrationBuilder.AddPrimaryKey(
                name: "PK_Payments",
                table: "Payments",
                column: "Id");

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