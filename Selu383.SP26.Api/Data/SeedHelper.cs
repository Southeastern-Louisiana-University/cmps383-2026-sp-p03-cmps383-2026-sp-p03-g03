using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Menu;
using Selu383.SP26.Api.Features.Tables;
using Selu383.SP26.Api.Features.Loyalty;

namespace Selu383.SP26.Api.Data;

public static class SeedHelper
{
    private const string SeedLocationPhone = "555-555-5555";
    private const string SeedLocationState = "LA";
    private const int BobTestPoints = 10000;
    private static readonly TimeOnly SeedOpeningTime = new(6, 0);
    private static readonly TimeOnly SeedClosingTime = new(18, 0);

    public static async Task MigrateAndSeed(IServiceProvider serviceProvider)
    {
        var dataContext = serviceProvider.GetRequiredService<DataContext>();

        try
        {
            await dataContext.Database.MigrateAsync();
        }
        catch (SqlException ex) when (
            ex.Number == 2705 &&
            ex.Message.Contains("StripePaymentMethodId", StringComparison.OrdinalIgnoreCase))
        {
            // Azure may already have this column from a manual change; continue startup safely.
        }
        await EnsureLoyaltyLedgerRewardColumns(dataContext);

        await AddRoles(serviceProvider);
        await AddUsers(serviceProvider);
        await AddLocations(dataContext);
        await AddTables(dataContext);
        await AddMenuCategories(dataContext);
        await AddMenuCategoryLocations(dataContext);
        await AddMenuItems(dataContext);
        await AddRewards(dataContext);
    }

    private static async Task EnsureLoyaltyLedgerRewardColumns(DataContext dataContext)
    {
        await dataContext.Database.ExecuteSqlRawAsync(@"
IF COL_LENGTH('LoyaltyLedgers', 'RewardId') IS NULL
BEGIN
    ALTER TABLE [LoyaltyLedgers] ADD [RewardId] int NULL;
END

IF COL_LENGTH('LoyaltyLedgers', 'RewardName') IS NULL
BEGIN
    ALTER TABLE [LoyaltyLedgers] ADD [RewardName] nvarchar(200) NULL;
END
");
    }

    private static async Task AddUsers(IServiceProvider serviceProvider)
    {
        const string defaultPassword = "Password123!";
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();

        if (!userManager.Users.Any())
        {
            var adminUser = new User
            {
                UserName = "galkadi",
                LoyaltyPoints = 0
            };
            await userManager.CreateAsync(adminUser, defaultPassword);
            await userManager.AddToRoleAsync(adminUser, RoleNames.Admin);

            var managerUser = new User
            {
                UserName = "manager1",
                LoyaltyPoints = 0
            };
            await userManager.CreateAsync(managerUser, defaultPassword);
            await userManager.AddToRoleAsync(managerUser, RoleNames.Manager);

            var staffUser = new User
            {
                UserName = "staff1",
                LoyaltyPoints = 0
            };
            await userManager.CreateAsync(staffUser, defaultPassword);
            await userManager.AddToRoleAsync(staffUser, RoleNames.Staff);

            var sue = new User
            {
                UserName = "sue",
                LoyaltyPoints = 300
            };
            await userManager.CreateAsync(sue, defaultPassword);
            await userManager.AddToRoleAsync(sue, RoleNames.User);
        }

        var bob = await userManager.Users.FirstOrDefaultAsync(x => x.UserName == "bob");
        if (bob == null)
        {
            bob = new User
            {
                UserName = "bob",
                LoyaltyPoints = BobTestPoints
            };
            await userManager.CreateAsync(bob, defaultPassword);
        }
        else if (bob.LoyaltyPoints < BobTestPoints)
        {
            bob.LoyaltyPoints = BobTestPoints;
            await userManager.UpdateAsync(bob);
        }

        if (!await userManager.IsInRoleAsync(bob, RoleNames.User))
        {
            await userManager.AddToRoleAsync(bob, RoleNames.User);
        }
    }

    private static async Task AddRoles(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<Role>>();

        await EnsureRoleExistsAsync(roleManager, RoleNames.Admin);
        await EnsureRoleExistsAsync(roleManager, RoleNames.Manager);
        await EnsureRoleExistsAsync(roleManager, RoleNames.Staff);
        await EnsureRoleExistsAsync(roleManager, RoleNames.User);
    }

    private static async Task EnsureRoleExistsAsync(RoleManager<Role> roleManager, string roleName)
    {
        if (await roleManager.RoleExistsAsync(roleName))
        {
            return;
        }

        await roleManager.CreateAsync(new Role { Name = roleName });
    }

    private static async Task AddLocations(DataContext dataContext)
    {
        if (await dataContext.Locations.AnyAsync())
        {
            var firstThreeLocations = await dataContext.Locations
                .OrderBy(x => x.Id)
                .Take(3)
                .ToListAsync();

            var updated = false;
            for (var i = 0; i < firstThreeLocations.Count; i++)
            {
                updated |= ApplySeedLocationDefaults(firstThreeLocations[i], i + 1);
            }

            if (updated)
            {
                await dataContext.SaveChangesAsync();
            }

            return;
        }

        dataContext.Locations.AddRange(
            new Location
            {
                Name = "Campus Coffee Shop",
                Type = "Corporate",
                Phone = SeedLocationPhone,
                Address = "Student Union",
                City = "Hammond",
                State = SeedLocationState,
                Zip = "70402",
                OpeningTime = SeedOpeningTime,
                ClosingTime = SeedClosingTime,
                IsActive = true,
                TableCount = 10
            },
            new Location
            {
                Name = "Library Cafe",
                Type = "Corporate",
                Phone = SeedLocationPhone,
                Address = "Main Library",
                City = "Baton Rouge",
                State = SeedLocationState,
                Zip = "70806",
                OpeningTime = SeedOpeningTime,
                ClosingTime = SeedClosingTime,
                IsActive = true,
                TableCount = 20
            },
            new Location
            {
                Name = "Downtown Coffee Bar",
                Type = "Corporate",
                Phone = SeedLocationPhone,
                Address = "101 Market St",
                City = "Denham Springs",
                State = SeedLocationState,
                Zip = "70706",
                OpeningTime = SeedOpeningTime,
                ClosingTime = SeedClosingTime,
                IsActive = true,
                TableCount = 15
            }
        );

        await dataContext.SaveChangesAsync();
    }

    private static bool ApplySeedLocationDefaults(Location location, int position)
    {
        var updated = false;

        if (!location.IsActive)
        {
            location.IsActive = true;
            updated = true;
        }

        if (location.Type != "Corporate")
        {
            location.Type = "Corporate";
            updated = true;
        }

        if (location.Phone != SeedLocationPhone)
        {
            location.Phone = SeedLocationPhone;
            updated = true;
        }

        var targetCity = position switch
        {
            1 => "Hammond",
            2 => "Baton Rouge",
            _ => "Denham Springs",
        };

        var targetZip = position switch
        {
            1 => "70402",
            2 => "70806",
            _ => "70706",
        };

        if (location.City != targetCity)
        {
            location.City = targetCity;
            updated = true;
        }

        if (location.State != SeedLocationState)
        {
            location.State = SeedLocationState;
            updated = true;
        }

        if (location.Zip != targetZip)
        {
            location.Zip = targetZip;
            updated = true;
        }

        if (location.OpeningTime != SeedOpeningTime)
        {
            location.OpeningTime = SeedOpeningTime;
            updated = true;
        }

        if (location.ClosingTime != SeedClosingTime)
        {
            location.ClosingTime = SeedClosingTime;
            updated = true;
        }

        return updated;
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
            dataContext.MenuItems.RemoveRange(dataContext.MenuItems);
            dataContext.MenuCategoryLocations.RemoveRange(dataContext.MenuCategoryLocations);
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
                IsActive = true
            },
            new MenuCategory
            {
                Name = "Crepes - Sweet",
                IsSeasonal = false,
                IsActive = true
            },
            new MenuCategory
            {
                Name = "Crepes - Savory",
                IsSeasonal = false,
                IsActive = true
            },
            new MenuCategory
            {
                Name = "Bagels",
                IsSeasonal = false,
                IsActive = true
            }
        );

        await dataContext.SaveChangesAsync();
    }

    private static async Task AddMenuCategoryLocations(DataContext dataContext)
    {
        if (await dataContext.MenuCategoryLocations.AnyAsync())
        {
            return;
        }

        var categories = await dataContext.MenuCategories.ToListAsync();
        var locations = await dataContext.Locations.ToListAsync();

        foreach (var category in categories)
        {
            foreach (var location in locations)
            {
                dataContext.MenuCategoryLocations.Add(new MenuCategoryLocation
                {
                    MenuCategoryId = category.Id,
                    LocationId = location.Id
                });
            }
        }

        await dataContext.SaveChangesAsync();
    }

    private static async Task AddMenuItems(DataContext dataContext)
    {
        var hasExpectedItems = await dataContext.MenuItems.AnyAsync(x => x.Name == "Iced Latte")
            && await dataContext.MenuItems.AnyAsync(x => x.Name == "Supernova")
            && await dataContext.MenuItems.AnyAsync(x => x.Name == "The Classic");

        if (hasExpectedItems)
        {
            return;
        }

        dataContext.MenuItems.RemoveRange(dataContext.MenuItems);
        await dataContext.SaveChangesAsync();

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

    private static async Task AddRewards(DataContext dataContext)
    {
        var hasExpectedRewards = await dataContext.Rewards.AnyAsync(x => x.Name == "Free Drink (Supernova)")
            && await dataContext.Rewards.AnyAsync(x => x.Name == "Free Drink (Strawberry Lemonade)")
            && await dataContext.Rewards.AnyAsync(x => x.Name == "10% Off Order")
            && await dataContext.Rewards.CountAsync() == 3;

        if (hasExpectedRewards)
        {
            return;
        }

        dataContext.Rewards.RemoveRange(dataContext.Rewards);
        await dataContext.SaveChangesAsync();

        dataContext.Rewards.AddRange(
            new Reward
            {
                Name = "Free Drink (Supernova)",
                Description = "Redeem for one Supernova drink from the menu.",
                PointsCost = 180,
                IsActive = true
            },
            new Reward
            {
                Name = "Free Drink (Strawberry Lemonade)",
                Description = "Redeem for one Strawberry Lemonade drink from the menu.",
                PointsCost = 180,
                IsActive = true
            },
            new Reward
            {
                Name = "10% Off Order",
                Description = "Redeem for 10% off your next order.",
                PointsCost = 200,
                IsActive = true
            }
        );

        await dataContext.SaveChangesAsync();
    }
}