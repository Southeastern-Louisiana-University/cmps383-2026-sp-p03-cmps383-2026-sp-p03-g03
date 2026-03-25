using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
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

     private static async Task AddTables(DataContext dataContext)
     {
         if (await dataContext.Tables.AnyAsync())
         {
             return;
         }

         var tables = new List<Table>();


         tables.AddRange(
             new Table { LocationId = 1, TableNumber = "1", Seats = 2, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 1, TableNumber = "2", Seats = 2, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 1, TableNumber = "3", Seats = 4, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 1, TableNumber = "4", Seats = 6, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 1, TableNumber = "5", Seats = 6, IsBarSeat = false, IsActive = true }
         );


         tables.AddRange(
             new Table { LocationId = 2, TableNumber = "1", Seats = 2, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 2, TableNumber = "2", Seats = 2, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 2, TableNumber = "3", Seats = 4, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 2, TableNumber = "4", Seats = 6, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 2, TableNumber = "5", Seats = 6, IsBarSeat = false, IsActive = true }
         );


         tables.AddRange(
             new Table { LocationId = 3, TableNumber = "1", Seats = 2, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 3, TableNumber = "2", Seats = 2, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 3, TableNumber = "3", Seats = 4, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 3, TableNumber = "4", Seats = 6, IsBarSeat = false, IsActive = true },
             new Table { LocationId = 3, TableNumber = "5", Seats = 6, IsBarSeat = false, IsActive = true }
         );

         dataContext.Tables.AddRange(tables);
         await dataContext.SaveChangesAsync();
     }

    private static async Task AddMenuCategories(DataContext dataContext)
    {
        var hasExpectedCategories = await dataContext.MenuCategories.AnyAsync(x => x.Name == "Drinks")
            && await dataContext.MenuCategories.AnyAsync(x => x.Name == "Crepes - Sweet")
            && await dataContext.MenuCategories.AnyAsync(x => x.Name == "Crepes - Savory")
            && await dataContext.MenuCategories.AnyAsync(x => x.Name == "Bagels");

        if (!hasExpectedCategories)
        {
            dataContext.MenuCategories.RemoveRange(dataContext.MenuCategories);
            await dataContext.SaveChangesAsync();
        }
        else
        {
            return;
        }

        dataContext.MenuCategories.AddRange(
            new MenuCategory
            {
                Name = "Drinks",
                IsSeasonal = false,
                IsActive = true,
                LocationIds = new[] { 1, 2, 3 }
            },
            new MenuCategory
            {
                Name = "Crepes - Sweet",
                IsSeasonal = false,
                IsActive = true,
                LocationIds = new[] { 1, 2, 3 }
            },
            new MenuCategory
            {
                Name = "Crepes - Savory",
                IsSeasonal = false,
                IsActive = true,
                LocationIds = new[] { 1, 2, 3 }
            },
            new MenuCategory
            {
                Name = "Bagels",
                IsSeasonal = false,
                IsActive = true,
                LocationIds = new[] { 1, 2, 3 }
            }
        );

        await dataContext.SaveChangesAsync();
    }

    private static async Task AddMenuItems(DataContext dataContext)
    {
        var hasExpectedItems = await dataContext.MenuItems.AnyAsync(x => x.Name == "Iced Latte")
            && await dataContext.MenuItems.AnyAsync(x => x.Name == "Supernova")
            && await dataContext.MenuItems.AnyAsync(x => x.Name == "The Classic");

        if (!hasExpectedItems)
        {
            dataContext.MenuItems.RemoveRange(dataContext.MenuItems);
            await dataContext.SaveChangesAsync();
        }
        else
        {
            return;
        }

        var categoriesByName = await dataContext.MenuCategories
            .ToDictionaryAsync(x => x.Name, x => x.Id);

        var drinksCategoryId = categoriesByName["Drinks"];
        var sweetCrepesCategoryId = categoriesByName["Crepes - Sweet"];
        var savoryCrepesCategoryId = categoriesByName["Crepes - Savory"];
        var bagelsCategoryId = categoriesByName["Bagels"];

        dataContext.MenuItems.AddRange(

            new MenuItem
            {
                Name = "Iced Latte",
                Description = "Espresso and milk served over ice for a refreshing coffee drink.",
                BasePrice = 5.50m,
                CategoryId = drinksCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Supernova",
                Description = "A unique coffee blend with a complex, balanced profile and subtle sweetness. Delicious as espresso or paired with milk.",
                BasePrice = 7.95m,
                CategoryId = drinksCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Roaring Frappe",
                Description = "Cold brew, milk, and ice blended together with a signature syrup or flavor, topped with whipped cream.",
                BasePrice = 6.20m,
                CategoryId = drinksCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Black & White Cold Brew",
                Description = "Cold brew made with both dark and light roast beans, finished with a drizzle of condensed milk.",
                BasePrice = 5.15m,
                CategoryId = drinksCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Strawberry Limeade",
                Description = "Fresh lime juice blended with strawberry purée for a refreshing, tangy drink.",
                BasePrice = 5.00m,
                CategoryId = drinksCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Shaken Lemonade",
                Description = "Fresh lemon juice and simple syrup vigorously shaken for a bright, refreshing lemonade.",
                BasePrice = 5.00m,
                CategoryId = drinksCategoryId,
                IsAvailable = true
            },
            

            new MenuItem
            {
                Name = "Mannino Honey Crepe",
                Description = "A sweet crepe drizzled with Mannino honey and topped with mixed berries.",
                BasePrice = 10.00m,
                CategoryId = sweetCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Downtowner",
                Description = "Strawberries and bananas wrapped in a crepe, finished with Nutella and Hershey's chocolate sauce.",
                BasePrice = 10.75m,
                CategoryId = sweetCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Funky Monkey",
                Description = "Nutella and bananas wrapped in a crepe, served with whipped cream.",
                BasePrice = 10.00m,
                CategoryId = sweetCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Le S'mores",
                Description = "Marshmallow cream and chocolate sauce inside a crepe, topped with graham cracker crumbs.",
                BasePrice = 9.50m,
                CategoryId = sweetCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Strawberry Fields",
                Description = "Fresh strawberries with Hershey's chocolate drizzle and a dusting of powdered sugar.",
                BasePrice = 10.00m,
                CategoryId = sweetCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Bonjour",
                Description = "A sweet crepe filled with syrup and cinnamon, finished with powdered sugar.",
                BasePrice = 8.50m,
                CategoryId = sweetCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Banana Foster",
                Description = "Bananas with cinnamon in a crepe, topped with a generous drizzle of caramel sauce.",
                BasePrice = 8.95m,
                CategoryId = sweetCrepesCategoryId,
                IsAvailable = true
            },
            

            new MenuItem
            {
                Name = "Matt's Scrambled Eggs",
                Description = "Scrambled eggs and melted mozzarella cheese wrapped in a crepe.",
                BasePrice = 5.00m,
                CategoryId = savoryCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Meanie Mushroom",
                Description = "Sautéed mushrooms, mozzarella, tomato, and bacon inside a delicate crepe.",
                BasePrice = 10.50m,
                CategoryId = savoryCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Turkey Club",
                Description = "Sliced turkey, bacon, spinach, and tomato wrapped in a savory crepe.",
                BasePrice = 10.50m,
                CategoryId = savoryCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Green Machine",
                Description = "Spinach, artichokes, and mozzarella cheese inside a fresh crepe.",
                BasePrice = 10.00m,
                CategoryId = savoryCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Perfect Pair",
                Description = "A unique combination of bacon and Nutella wrapped in a crepe.",
                BasePrice = 10.00m,
                CategoryId = savoryCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Crepe Fromage",
                Description = "A savory crepe filled with a blend of cheeses.",
                BasePrice = 8.00m,
                CategoryId = savoryCrepesCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Farmers Market Crepe",
                Description = "Turkey, spinach, and mozzarella wrapped in a savory crepe.",
                BasePrice = 10.50m,
                CategoryId = savoryCrepesCategoryId,
                IsAvailable = true
            },
            

            new MenuItem
            {
                Name = "Travis Special",
                Description = "Cream cheese, salmon, spinach, and a fried egg served on a freshly toasted bagel.",
                BasePrice = 14.00m,
                CategoryId = bagelsCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Crème Brulage",
                Description = "A toasted bagel with a caramelized sugar crust inspired by crème brûlée, served with cream cheese.",
                BasePrice = 8.00m,
                CategoryId = bagelsCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "The Fancy One",
                Description = "Smoked salmon, cream cheese, and fresh dill on a toasted bagel.",
                BasePrice = 13.00m,
                CategoryId = bagelsCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "Breakfast Bagel",
                Description = "A toasted bagel with your choice of ham, bacon, or sausage, a fried egg, and cheddar cheese.",
                BasePrice = 9.50m,
                CategoryId = bagelsCategoryId,
                IsAvailable = true
            },
            new MenuItem
            {
                Name = "The Classic",
                Description = "A toasted bagel with cream cheese.",
                BasePrice = 5.25m,
                CategoryId = bagelsCategoryId,
                IsAvailable = true
            }
        );

        await dataContext.SaveChangesAsync();
    }
}