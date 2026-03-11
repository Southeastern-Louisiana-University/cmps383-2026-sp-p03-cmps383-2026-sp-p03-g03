using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Menu;

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
        await AddMenuCategories(dataContext);
        await AddMenuItems(dataContext);
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
        if (await dataContext.Locations.AnyAsync())
        {
            return;
        }

        dataContext.Locations.AddRange(
            new Location
            {
                Name = "Campus Coffee Shop",
                Address = "Student Union",
                TableCount = 10
            },
            new Location
            {
                Name = "Library Cafe",
                Address = "Main Library",
                TableCount = 20
            },
            new Location
            {
                Name = "Downtown Coffee Bar",
                Address = "101 Market St",
                TableCount = 15
            }
        );

        await dataContext.SaveChangesAsync();
    }

    private static async Task AddMenuCategories(DataContext dataContext)
    {
        if (await dataContext.MenuCategories.AnyAsync())
        {
            return;
        }

        dataContext.MenuCategories.AddRange(
            new MenuCategory
            {
                Name = "Coffee",
                IsSeasonal = false,
                IsActive = true,
                LocationIds = new[] { 1, 2, 3 }
            },
            new MenuCategory
            {
                Name = "Tea",
                IsSeasonal = false,
                IsActive = true,
                LocationIds = new[] { 1, 2, 3 }
            },
            new MenuCategory
            {
                Name = "Pastries",
                IsSeasonal = false,
                IsActive = true,
                LocationIds = new[] { 1, 2, 3 }
            }
        );

        await dataContext.SaveChangesAsync();
    }

    private static async Task AddMenuItems(DataContext dataContext)
{
    if (await dataContext.MenuItems.AnyAsync())
    {
        return;
    }

    dataContext.MenuItems.AddRange(
        new MenuItem
        {
            Name = "Latte",
            Description = "Fresh brewed latte",
            BasePrice = 4.50m,
            CategoryId = 1
        },
        new MenuItem
        {
            Name = "Cappuccino",
            Description = "Classic cappuccino",
            BasePrice = 4.25m,
            CategoryId = 1
        },
        new MenuItem
        {
            Name = "Espresso",
            Description = "Strong espresso shot",
            BasePrice = 3.00m,
            CategoryId = 1
        },
        new MenuItem
        {
            Name = "Green Tea",
            Description = "Organic green tea",
            BasePrice = 3.50m,
            CategoryId = 2
        },
        new MenuItem
        {
            Name = "Croissant",
            Description = "Buttery croissant",
            BasePrice = 3.00m,
            CategoryId = 3
        }
    );

    await dataContext.SaveChangesAsync();
}
}