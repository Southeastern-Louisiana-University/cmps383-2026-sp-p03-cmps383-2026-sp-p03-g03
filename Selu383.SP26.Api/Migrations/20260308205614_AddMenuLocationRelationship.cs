using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMenuLocationRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_menu_categories_Locations_LocationId",
                table: "menu_categories");

            migrationBuilder.DropIndex(
                name: "IX_menu_categories_LocationId",
                table: "menu_categories");

            migrationBuilder.DropColumn(
                name: "LocationId",
                table: "menu_categories");

            migrationBuilder.AddColumn<string>(
                name: "LocationIds",
                table: "menu_categories",
                type: "nvarchar(max)",
                nullable: true);

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
                        name: "FK_LocationMenuCategory_Locations_LocationsId",
                        column: x => x.LocationsId,
                        principalTable: "Locations",
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LocationMenuCategory");

            migrationBuilder.DropColumn(
                name: "LocationIds",
                table: "menu_categories");

            migrationBuilder.AddColumn<int>(
                name: "LocationId",
                table: "menu_categories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_menu_categories_LocationId",
                table: "menu_categories",
                column: "LocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_menu_categories_Locations_LocationId",
                table: "menu_categories",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
