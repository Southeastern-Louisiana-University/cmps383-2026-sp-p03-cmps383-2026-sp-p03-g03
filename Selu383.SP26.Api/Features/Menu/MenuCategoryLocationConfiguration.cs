using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Menu;

public class MenuCategoryLocationConfiguration : IEntityTypeConfiguration<MenuCategoryLocation>
{
    public void Configure(EntityTypeBuilder<MenuCategoryLocation> builder)
    {
        builder.ToTable("menu_category_locations");

        builder.HasKey(x => new { x.MenuCategoryId, x.LocationId });

        builder.HasOne(x => x.MenuCategory)
            .WithMany(x => x.MenuCategoryLocations)
            .HasForeignKey(x => x.MenuCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Location)
            .WithMany(x => x.MenuCategoryLocations)
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}