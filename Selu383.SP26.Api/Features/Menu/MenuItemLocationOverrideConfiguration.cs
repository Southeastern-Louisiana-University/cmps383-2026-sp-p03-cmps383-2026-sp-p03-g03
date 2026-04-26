using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Menu;

public class MenuItemLocationOverrideConfiguration : IEntityTypeConfiguration<MenuItemLocationOverride>
{
    public void Configure(EntityTypeBuilder<MenuItemLocationOverride> builder)
    {
        builder.ToTable("menu_item_location_overrides");

        builder.HasKey(x => new { x.MenuItemId, x.LocationId });

        builder.HasOne(x => x.MenuItem)
            .WithMany(x => x.LocationOverrides)
            .HasForeignKey(x => x.MenuItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Location)
            .WithMany()
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.UnavailableReason).HasMaxLength(500);
    }
}
