using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Payments;

public class PaymentMethodConfiguration : IEntityTypeConfiguration<PaymentMethod>
{
    public void Configure(EntityTypeBuilder<PaymentMethod> builder)
    {
        builder.ToTable("payment_methods");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.StripePaymentMethodId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.CardholderName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Brand)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.Last4)
            .HasMaxLength(4)
            .IsRequired();

        builder.HasIndex(x => x.UserId);

        builder.HasOne(x => x.User)
            .WithMany(x => x.PaymentMethods)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
