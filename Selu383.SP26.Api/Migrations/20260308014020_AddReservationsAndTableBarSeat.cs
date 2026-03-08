using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationsAndTableBarSeat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Locations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "ClosingTime",
                table: "Locations",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Locations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LayoutJson",
                table: "Locations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "OpeningTime",
                table: "Locations",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Locations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Locations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Locations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Zip",
                table: "Locations",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "ClosingTime",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "LayoutJson",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "OpeningTime",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Zip",
                table: "Locations");
        }
    }
}
