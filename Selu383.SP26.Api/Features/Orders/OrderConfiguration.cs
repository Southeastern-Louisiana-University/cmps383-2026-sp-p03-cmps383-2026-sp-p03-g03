using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Orders;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderCode)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.OrderType)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.PaymentStatus)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Total)
            .HasColumnType("decimal(10,2)");

        builder.Property(x => x.Note)
            .HasMaxLength(500);

        builder.Property(x => x.PickupName)
            .HasMaxLength(80);
    }
}