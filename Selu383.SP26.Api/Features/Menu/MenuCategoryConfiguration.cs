using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Menu;

public class MenuCategoryConfiguration : IEntityTypeConfiguration<MenuCategory>
{
    public void Configure(EntityTypeBuilder<MenuCategory> builder)
    {
        builder.ToTable("menu_categories");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.IsSeasonal)
            .HasDefaultValue(false);

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.HasOne(x => x.Location)
            .WithMany()
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}