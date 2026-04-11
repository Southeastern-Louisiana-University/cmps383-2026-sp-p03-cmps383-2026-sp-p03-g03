using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStripePaymentMethodId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('payment_methods', 'StripePaymentMethodId') IS NULL
BEGIN
    ALTER TABLE [payment_methods] ADD [StripePaymentMethodId] nvarchar(100) NOT NULL DEFAULT N'';
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('payment_methods', 'StripePaymentMethodId') IS NOT NULL
BEGIN
    ALTER TABLE [payment_methods] DROP COLUMN [StripePaymentMethodId];
END
");
        }
    }
}
