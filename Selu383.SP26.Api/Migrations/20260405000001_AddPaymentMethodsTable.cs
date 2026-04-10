using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentMethodsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'payment_methods')
BEGIN
    CREATE TABLE [payment_methods] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [CardholderName] nvarchar(100) NOT NULL,
        [Brand] nvarchar(30) NOT NULL,
        [Last4] nvarchar(4) NOT NULL,
        [ExpMonth] int NOT NULL,
        [ExpYear] int NOT NULL,
        [IsDefault] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_payment_methods] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_payment_methods_AspNetUsers_UserId] FOREIGN KEY ([UserId])
            REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_payment_methods_UserId] ON [payment_methods] ([UserId]);
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "payment_methods");
        }
    }
}
