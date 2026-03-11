using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Payments;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        //explicitly tells swl to store 10 total digits, with 2 decimal places for cents(debugger console suggested this should be added)
        builder.Property(x => x.Amount)
               .HasColumnType("decimal(10, 2)");
    }
}