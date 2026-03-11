using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Loyalty;
using Selu383.SP26.Api.Features.Menu;
using Selu383.SP26.Api.Features.Tables;

namespace Selu383.SP26.Api.Data;

public static class SeedHelper
{
    public static async Task MigrateAndSeed(IServiceProvider serviceProvider)
    {
        var dataContext = serviceProvider.GetRequiredService<DataContext>();

        await dataContext.Database.MigrateAsync();

        await AddRoles(serviceProvider);
        await AddUsers(serviceProvider);
        await AddLocations(dataContext);
        await AddTables(dataContext);
        await AddMenu(dataContext);
        await AddLoyaltySeeding(dataContext, serviceProvider);
    }

    private static async Task AddUsers(IServiceProvider serviceProvider)
    {
        const string defaultPassword = "Password123!";
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();

        if (userManager.Users.Any())
        {
            return;
        }

        var adminUser = new User
        {
            UserName = "galkadi",
            LoyaltyPoints = 0
        };
        await userManager.CreateAsync(adminUser, defaultPassword);
        await userManager.AddToRoleAsync(adminUser, RoleNames.Admin);

        var bob = new User
        {
            UserName = "bob",
            LoyaltyPoints = 150
        };
        await userManager.CreateAsync(bob, defaultPassword);
        await userManager.AddToRoleAsync(bob, RoleNames.User);

        var sue = new User
        {
            UserName = "sue",
            LoyaltyPoints = 300
        };
        await userManager.CreateAsync(sue, defaultPassword);
        await userManager.AddToRoleAsync(sue, RoleNames.User);
    }

    private static async Task AddRoles(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<Role>>();
        if (roleManager.Roles.Any())
        {
            return;
        }
        await roleManager.CreateAsync(new Role
        {
            Name = RoleNames.Admin
        });

        await roleManager.CreateAsync(new Role
        {
            Name = RoleNames.User
        });
    }

    private static async Task AddLocations(DataContext dataContext)
    {
        if (await dataContext.Set<Location>().AnyAsync())
        {
            return;
        }
        
        //basic json layout for the frontend to use for drawing tables??? thought it might be helpful
        var dummyLayout = "{\"width\": 800, \"height\": 600, \"elements\": []}";

        dataContext.Set<Location>().AddRange(
            new Location { Name = "Location 1", Address = "123 MLK Dr", TableCount = 12, LayoutJson = dummyLayout },
            new Location { Name = "Location 2", Address = "456 Washington Rd", TableCount = 18, LayoutJson = dummyLayout },
            new Location { Name = "Location 3", Address = "789 SELU St", TableCount = 24, LayoutJson = dummyLayout }
        );

        await dataContext.SaveChangesAsync();
    }

    private static async Task AddTables(DataContext dataContext)
    {
        if (await dataContext.Set<Table>().AnyAsync())
        {
            return;
        }

        var locations = await dataContext.Set<Location>().ToListAsync();

        foreach (var location in locations)
        {
            //loop through the table count to generate actual table entities
            for (int i = 1; i <= location.TableCount; i++)
            {
                //designate some seats as individual bar seats that cannot be reserved
                bool isBarSeat = i % 6 == 0;
                
                //cycle seating capacities between 2 and 6 guest
                int seats = isBarSeat ? 1 : (i % 5) + 2; 

                dataContext.Set<Table>().Add(new Table
                {
                    LocationId = location.Id,
                    TableNumber = $"t-{i}",
                    Seats = seats,
                    IsBarSeat = isBarSeat,
                    IsActive = true
                });
            }
        }

        await dataContext.SaveChangesAsync();
    }

    private static async Task AddMenu(DataContext dataContext)
    {
        if (await dataContext.Set<MenuCategory>().AnyAsync())
        {
            return;
        }

        var coffee = new MenuCategory { Name = "Coffee", IsActive = true };
        var tea = new MenuCategory { Name = "Tea", IsActive = true };
        var sweetDrinks = new MenuCategory { Name = "Sweet Drinks", IsActive = true };
        var bagels = new MenuCategory { Name = "Bagels", IsActive = true };
        var crepes = new MenuCategory { Name = "Crepes", IsActive = true };

        dataContext.Set<MenuCategory>().AddRange(coffee, tea, sweetDrinks, bagels, crepes);
        await dataContext.SaveChangesAsync();

        //specific items dummy data
        dataContext.Set<MenuItem>().AddRange(
            new MenuItem { CategoryId = coffee.Id, Name = "House Roast", BasePrice = 3.50m, Description = "classic dark roast", IsAvailable = true },
            new MenuItem { CategoryId = tea.Id, Name = "Earl Grey", BasePrice = 3.00m, Description = "hot steeped black tea", IsAvailable = true },
            new MenuItem { CategoryId = sweetDrinks.Id, Name = "Caramel Macchiato", BasePrice = 5.00m, Description = "espresso with vanilla and caramel", IsAvailable = true },
            new MenuItem { CategoryId = bagels.Id, Name = "Build Your Own Bagel", BasePrice = 4.50m, Description = "use the request note to specify toasted preference and meats (like bacon, sausage)", IsAvailable = true },
            new MenuItem { CategoryId = crepes.Id, Name = "Custom Savory Crepe", BasePrice = 7.00m, Description = "use the request note to specify your meat and cooking preferences", IsAvailable = true }
        );

        await dataContext.SaveChangesAsync();
    }

    private static async Task AddLoyaltySeeding(DataContext dataContext, IServiceProvider serviceProvider)
    {
        if (await dataContext.Set<LoyaltyLedger>().AnyAsync())
        {
            return;
        }

        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
        var bob = await userManager.FindByNameAsync("bob");
        var sue = await userManager.FindByNameAsync("sue");

        if (bob != null)
        {
            dataContext.Set<LoyaltyLedger>().Add(new LoyaltyLedger
            {
                UserId = bob.Id,
                PointsEarned = 150,
                PointsRedeemed = 0,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (sue != null)
        {
            dataContext.Set<LoyaltyLedger>().Add(new LoyaltyLedger
            {
                UserId = sue.Id,
                PointsEarned = 300,
                PointsRedeemed = 0,
                CreatedAt = DateTime.UtcNow
            });
        }

        await dataContext.SaveChangesAsync();
    }
}