using Microsoft.AspNetCore.Identity;
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
    private const int BobTestPoints = 10000;
    private static readonly TimeOnly SeedOpeningTime = new(6, 0);
    private static readonly TimeOnly SeedClosingTime = new(18, 0);
    private static readonly SemaphoreSlim SeedGate = new(1, 1);

    public static async Task MigrateAndSeed(IServiceProvider serviceProvider)
    {
        await SeedGate.WaitAsync();
        try
        {
            var dataContext = serviceProvider.GetRequiredService<DataContext>();

            await dataContext.Database.MigrateAsync();

            // One-time normalization: legacy rows used "Unpaid"; we now use "Pending".
            await dataContext.Database.ExecuteSqlRawAsync(
                "UPDATE Orders SET PaymentStatus = 'Pending' WHERE PaymentStatus = 'Unpaid'");

            await AddRoles(serviceProvider);
            await dataContext.SaveChangesAsync();

            var adminRoleExists = await dataContext.Roles
                .AnyAsync(r => r.NormalizedName == RoleNames.Admin.ToUpperInvariant());
            if (!adminRoleExists)
            {
                throw new InvalidOperationException(
                    "Seed integrity check failed: Admin role was not persisted after AddRoles. " +
                    "This usually means the test infrastructure is reusing a disposed WebApplicationFactory. " +
                    "Check Selu383.SP26.Tests/Helpers/WebTestContext.cs for a cleanup ordering bug.");
            }

            await AddUsers(serviceProvider);
            await AddLocations(dataContext);
            await EnsureSeedAssignments(dataContext);
            await AddTables(dataContext);
            await AddMenuCategories(dataContext);
            await AddMenuCategoryLocations(dataContext);
            await AddMenuItems(dataContext);
            await AddRewards(dataContext);
        }
        finally
        {
            SeedGate.Release();
        }
    }

    private static async Task AddUsers(IServiceProvider serviceProvider)
    {
        const string defaultPassword = "Password123!";
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<Role>>();

        await EnsureSeedUserAsync(userManager, roleManager, "Eliora", 0, RoleNames.Admin, defaultPassword, "galkadi", "Eliora");
        await EnsureSeedUserAsync(userManager, roleManager, "terri", 0, RoleNames.Manager, defaultPassword, "manager1");
        await EnsureSeedUserAsync(userManager, roleManager, "rylie", 0, RoleNames.Manager, defaultPassword);
        await EnsureSeedUserAsync(userManager, roleManager, "robert", 0, RoleNames.Manager, defaultPassword);
        await EnsureSeedUserAsync(userManager, roleManager, "staff1", 0, RoleNames.Staff, defaultPassword);
        await EnsureSeedUserAsync(userManager, roleManager, "sue", 300, RoleNames.User, defaultPassword);
        await EnsureSeedUserAsync(userManager, roleManager, "bob", BobTestPoints, RoleNames.User, defaultPassword);
    }

    private static async Task EnsureSeedUserAsync(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        string userName,
        int loyaltyPoints,
        string role,
        string defaultPassword,
        params string[] legacyUserNames)
    {
        var candidateUserNames = new[] { userName }
            .Concat(legacyUserNames)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var user = await userManager.Users.FirstOrDefaultAsync(x => candidateUserNames.Contains(x.UserName!));
        if (user == null)
        {
            user = new User
            {
                UserName = userName,
                DisplayName = userName,
                LoyaltyPoints = loyaltyPoints
            };

            var createResult = await userManager.CreateAsync(user, defaultPassword);
            if (!createResult.Succeeded)
            {
                user = await userManager.Users.FirstOrDefaultAsync(x => x.UserName == userName)
                    ?? throw new InvalidOperationException(string.Format("Failed to seed user '{0}'.", userName));
            }
        }
        else
        {
            var needsUpdate = false;

            if (!string.Equals(user.UserName, userName, StringComparison.OrdinalIgnoreCase))
            {
                user.UserName = userName;
                user.NormalizedUserName = userName.ToUpperInvariant();
                needsUpdate = true;
            }

            if (string.IsNullOrWhiteSpace(user.DisplayName))
            {
                user.DisplayName = userName;
                needsUpdate = true;
            }

            if (user.LoyaltyPoints < loyaltyPoints)
            {
                user.LoyaltyPoints = loyaltyPoints;
                needsUpdate = true;
            }

            if (needsUpdate)
            {
                await userManager.UpdateAsync(user);
            }
        }

        for (var roleAttempt = 0; roleAttempt < 3; roleAttempt++)
        {
            try
            {
                if (!await userManager.IsInRoleAsync(user, role))
                {
                    await userManager.AddToRoleAsync(user, role);
                }
                break;
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("does not exist"))
            {
                // Concurrent test ClearData() deleted the role — recreate it and retry
                if (roleAttempt == 2) throw;
                try { await roleManager.CreateAsync(new Role { Name = role }); } catch { }
            }
        }

        if (user.AccessFailedCount > 0 || user.LockoutEnd.HasValue)
        {
            user.AccessFailedCount = 0;
            user.LockoutEnd = null;
            await userManager.UpdateAsync(user);
        }

        // Keep seeded dev credentials consistent across existing databases.
        if (!await userManager.CheckPasswordAsync(user, defaultPassword))
        {
            if (await userManager.HasPasswordAsync(user))
            {
                await userManager.RemovePasswordAsync(user);
            }

            await userManager.AddPasswordAsync(user, defaultPassword);
        }
    }

    private static async Task AddRoles(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<Role>>();

        await EnsureRoleExistsAsync(roleManager, RoleNames.Admin);
        await EnsureRoleExistsAsync(roleManager, RoleNames.Manager);
        await EnsureRoleExistsAsync(roleManager, RoleNames.Staff);
        await EnsureRoleExistsAsync(roleManager, RoleNames.Customer);
        await EnsureRoleExistsAsync(roleManager, RoleNames.User);
    }

    private static async Task EnsureRoleExistsAsync(RoleManager<Role> roleManager, string roleName)
    {
        if (await roleManager.RoleExistsAsync(roleName))
        {
            return;
        }

        var createRoleResult = await roleManager.CreateAsync(new Role { Name = roleName });
        if (!createRoleResult.Succeeded && !await roleManager.RoleExistsAsync(roleName))
        {
            throw new InvalidOperationException($"Failed to seed role '{roleName}'.");
        }
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
                Name = "Caffeinated Lions - Hammond",
                Type = "Corporate",
                Phone = SeedLocationPhone,
                Address = "110 N Cate St",
                City = "Hammond",
                State = "LA",
                Zip = "70403",
                OpeningTime = SeedOpeningTime,
                ClosingTime = SeedClosingTime,
                IsActive = true,
                TableCount = 10
            },
            new Location
            {
                Name = "Caffeinated Lions - New York",
                Type = "Corporate",
                Phone = SeedLocationPhone,
                Address = "72 E 1st St",
                City = "New York",
                State = "NY",
                Zip = "10003",
                OpeningTime = SeedOpeningTime,
                ClosingTime = SeedClosingTime,
                IsActive = true,
                TableCount = 20
            },
            new Location
            {
                Name = "Caffeinated Lions - New Orleans",
                Type = "Corporate",
                Phone = SeedLocationPhone,
                Address = "1140 S Carrollton Ave",
                City = "New Orleans",
                State = "LA",
                Zip = "70118",
                OpeningTime = SeedOpeningTime,
                ClosingTime = SeedClosingTime,
                IsActive = true,
                TableCount = 15
            }
        );

        await dataContext.SaveChangesAsync();
    }

    private static async Task EnsureSeedAssignments(DataContext dataContext)
    {
        var locations = await dataContext.Locations.OrderBy(x => x.Id).Take(3).ToListAsync();
        var terri = await dataContext.Users.FirstOrDefaultAsync(x => x.UserName == "terri");
        var rylie = await dataContext.Users.FirstOrDefaultAsync(x => x.UserName == "rylie");
        var robert = await dataContext.Users.FirstOrDefaultAsync(x => x.UserName == "robert");
        var staff = await dataContext.Users.FirstOrDefaultAsync(x => x.UserName == "staff1");

        if (locations.Count == 0)
        {
            return;
        }

        var updated = false;
        var seededManagers = new[] { terri, rylie, robert };

        for (var i = 0; i < locations.Count && i < seededManagers.Length; i++)
        {
            var manager = seededManagers[i];
            if (manager == null)
            {
                continue;
            }

            if (locations[i].ManagerId != manager.Id)
            {
                locations[i].ManagerId = manager.Id;
                updated = true;
            }

            if (manager.LocationId != locations[i].Id)
            {
                manager.LocationId = locations[i].Id;
                updated = true;
            }
        }

        if (staff != null && staff.LocationId != locations[0].Id)
        {
            staff.LocationId = locations[0].Id;
            updated = true;
        }

        if (updated)
        {
            await dataContext.SaveChangesAsync();
        }
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

        var targetName = position switch
        {
            1 => "Caffeinated Lions - Hammond",
            2 => "Caffeinated Lions - New York",
            _ => "Caffeinated Lions - New Orleans",
        };

        var targetAddress = position switch
        {
            1 => "110 N Cate St",
            2 => "72 E 1st St",
            _ => "1140 S Carrollton Ave",
        };

        var targetCity = position switch
        {
            1 => "Hammond",
            2 => "New York",
            _ => "New Orleans",
        };

        var targetState = position switch
        {
            1 => "LA",
            2 => "NY",
            _ => "LA",
        };

        var targetZip = position switch
        {
            1 => "70403",
            2 => "10003",
            _ => "70118",
        };

        if (location.Name != targetName)
        {
            location.Name = targetName;
            updated = true;
        }

        if (location.Address != targetAddress)
        {
            location.Address = targetAddress;
            updated = true;
        }

        if (location.City != targetCity)
        {
            location.City = targetCity;
            updated = true;
        }

        if (location.State != targetState)
        {
            location.State = targetState;
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
                IconPath = "/menu-pics/icons/drinks.png",
                IsSeasonal = false,
                IsActive = true
            },
            new MenuCategory
            {
                Name = "Crepes - Sweet",
                IconPath = "/menu-pics/icons/crepes-sweet.png",
                IsSeasonal = false,
                IsActive = true
            },
            new MenuCategory
            {
                Name = "Crepes - Savory",
                IconPath = "/menu-pics/icons/crepes-savory.png",
                IsSeasonal = false,
                IsActive = true
            },
            new MenuCategory
            {
                Name = "Bagels",
                IconPath = "/menu-pics/icons/bagels.png",
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
