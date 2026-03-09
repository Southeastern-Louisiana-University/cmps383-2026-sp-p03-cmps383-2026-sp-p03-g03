using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Tables;

public class TableConfiguration : IEntityTypeConfiguration<Table>
{
    public void Configure(EntityTypeBuilder<Table> builder)
    {
        builder.ToTable("tables");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TableNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Seats)
            .IsRequired();

        builder.Property(x => x.IsBarSeat)
            .HasDefaultValue(false);

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);
    }
}