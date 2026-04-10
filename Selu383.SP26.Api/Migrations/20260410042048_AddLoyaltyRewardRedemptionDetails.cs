using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLoyaltyRewardRedemptionDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RewardId",
                table: "LoyaltyLedgers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RewardName",
                table: "LoyaltyLedgers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RewardId",
                table: "LoyaltyLedgers");

            migrationBuilder.DropColumn(
                name: "RewardName",
                table: "LoyaltyLedgers");
        }
    }
}
