using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Payments;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("payments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Provider)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.PaymentMethodType)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.TransactionId)
            .HasMaxLength(200);

        builder.Property(x => x.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Amount)
            .HasColumnType("decimal(10,2)");

        builder.Property(x => x.RemovedReason)
            .HasMaxLength(250);

        builder.HasOne(x => x.Order)
            .WithMany(x => x.Payments)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
