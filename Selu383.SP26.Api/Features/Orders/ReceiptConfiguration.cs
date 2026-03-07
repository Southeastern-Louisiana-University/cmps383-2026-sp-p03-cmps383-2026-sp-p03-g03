using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Orders;

public class ReceiptConfiguration : IEntityTypeConfiguration<Receipt>
{
    public void Configure(EntityTypeBuilder<Receipt> builder)
    {
        builder.ToTable("receipts");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ReceiptText);

        builder.HasIndex(x => x.OrderId)
            .IsUnique();

        builder.HasOne(x => x.Order)
            .WithOne(x => x.Receipt)
            .HasForeignKey<Receipt>(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}