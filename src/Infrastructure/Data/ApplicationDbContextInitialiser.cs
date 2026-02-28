using UnifiedPOS.Domain.Constants;
using UnifiedPOS.Domain.Entities;
using UnifiedPOS.Domain.Enums;
using UnifiedPOS.Infrastructure.Identity;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace UnifiedPOS.Infrastructure.Data;

public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();

        await initialiser.InitialiseAsync();
        await initialiser.SeedAsync();
    }
}

public class ApplicationDbContextInitialiser
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public ApplicationDbContextInitialiser(
        ILogger<ApplicationDbContextInitialiser> logger, 
        ApplicationDbContext context, 
        UserManager<ApplicationUser> userManager, 
        RoleManager<IdentityRole> roleManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            // Check if the database already exists (created by EnsureCreatedAsync before we had migrations)
            var dbExists = await _context.Database.CanConnectAsync();
            
            if (dbExists)
            {
                // Check if migrations history table exists
                var conn = _context.Database.GetDbConnection();
                await conn.OpenAsync();
                using var cmd = conn.CreateCommand();
                cmd.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='__EFMigrationsHistory'";
                var result = await cmd.ExecuteScalarAsync();
                
                if (result == null)
                {
                    // Database was created by EnsureCreated (no migrations table).
                    // Create the migrations table and mark existing migrations as applied,
                    // so MigrateAsync only runs NEW migrations (like AddShopSettings).
                    _logger.LogInformation("Existing database found without migrations history. Transitioning to migrations...");
                    
                    using var createCmd = conn.CreateCommand();
                    createCmd.CommandText = @"
                        CREATE TABLE IF NOT EXISTS ""__EFMigrationsHistory"" (
                            ""MigrationId"" TEXT NOT NULL PRIMARY KEY,
                            ""ProductVersion"" TEXT NOT NULL
                        );
                        INSERT OR IGNORE INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                        VALUES ('20260227084112_InitialCreate', '8.0.0');
                    ";
                    await createCmd.ExecuteNonQueryAsync();
                    
                    _logger.LogInformation("Migration history initialized. Running pending migrations...");
                }
            }
            
            // Now run migrations — for fresh installs this creates everything;
            // for existing DBs, this only runs migrations that haven't been applied yet
            await _context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    public async Task TrySeedAsync()
    {
        // Default roles
        var adminRole = new IdentityRole(Roles.Administrator);
        var cashierRole = new IdentityRole("Cashier");

        if (_roleManager.Roles.All(r => r.Name != adminRole.Name))
        {
            await _roleManager.CreateAsync(adminRole);
        }
        
        if (_roleManager.Roles.All(r => r.Name != cashierRole.Name))
        {
            await _roleManager.CreateAsync(cashierRole);
        }

        // Default admin user (as per requirements: admin/admin123)
        var admin = new ApplicationUser 
        { 
            UserName = "admin", 
            Email = "admin@unifiedpos.local",
            Role = UserRole.Admin
        };

        if (_userManager.Users.All(u => u.UserName != admin.UserName))
        {
            await _userManager.CreateAsync(admin, "Admin123!");
            if (!string.IsNullOrWhiteSpace(adminRole.Name))
            {
                await _userManager.AddToRolesAsync(admin, new[] { adminRole.Name });
            }
        }

        // Seed categories and products
        if (!_context.Categories.Any())
        {
            await SeedCategoriesAndProductsAsync();
        }

        // Seed default shop settings
        if (!_context.ShopSettings.Any())
        {
            _context.ShopSettings.Add(new ShopSettings
            {
                ShopName = "My Shop",
                Address = "",
                BusinessWhatsApp = ""
            });
            await _context.SaveChangesAsync(default);
        }
    }

    private async Task SeedCategoriesAndProductsAsync()
    {
        // Laundry Category (Prefix: L, Color: Blue)
        var laundryCategory = new Category
        {
            Name = "Laundry",
            Prefix = "L",
            ColorCode = "#3B82F6"
        };

        // Dry Cleaning Category (Prefix: D, Color: Green)
        var dryCleaningCategory = new Category
        {
            Name = "Dry Cleaning",
            Prefix = "D",
            ColorCode = "#22C55E"
        };

        _context.Categories.Add(laundryCategory);
        _context.Categories.Add(dryCleaningCategory);
        await _context.SaveChangesAsync(default);

        // Laundry Products
        var laundryProducts = new List<Product>
        {
            new() { CategoryId = laundryCategory.Id, Name = "Wash", Price = 8.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Dry", Price = 8.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Wash & Dry", Price = 15.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Detergent", Price = 2.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Softener", Price = 2.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Pre-Wash", Price = 3.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Drop-Off Service", Price = 5.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Iron: Clothes (per pc)", Price = 3.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Iron: Bedsheets", Price = 5.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Iron: Pillow Cases/Cushion Covers", Price = 2.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Gents: Trousers", Price = 6.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Gents: Shirts", Price = 5.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Gents: Jeans", Price = 6.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Gents: Shorts", Price = 4.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Ladies: Blouse", Price = 5.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Ladies: Skirts", Price = 5.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Ladies: Dress", Price = 8.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Ladies: Trousers", Price = 6.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Comforter/Bedspread", Price = 25.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Bedsheets", Price = 8.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Pillow Cases/Bolster", Price = 3.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Curtains (per panel)", Price = 10.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Curtains (per kg)", Price = 15.00m },
            new() { CategoryId = laundryCategory.Id, Name = "Blanket", Price = 15.00m },
        };

        // Dry Cleaning Products
        var dryCleaningProducts = new List<Product>
        {
            new() { CategoryId = dryCleaningCategory.Id, Name = "Blouse", Price = 10.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Skirt", Price = 10.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Dress", Price = 18.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Blazer", Price = 20.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Evening Gown", Price = 45.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Baju Kurung", Price = 15.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Baju Melayu", Price = 15.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Sheep Skin/Sarong", Price = 35.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Neck Tie/Soft Toy", Price = 8.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Saree/Wedding Gown", Price = 80.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Bedsheet (DC)", Price = 12.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Pillow Case (DC)", Price = 5.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Curtain (per Sq Ft)", Price = 2.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Blanket (DC)", Price = 20.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Bedspread", Price = 25.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Cushion Covers", Price = 8.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Vest/Jacket", Price = 18.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Overcoat/Hand Bag", Price = 30.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Sweater", Price = 12.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Sport Shirt", Price = 10.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Bush Jacket", Price = 18.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Coat", Price = 25.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Trousers (DC)", Price = 12.00m },
            new() { CategoryId = dryCleaningCategory.Id, Name = "Shirt", Price = 8.00m },
        };

        _context.Products.AddRange(laundryProducts);
        _context.Products.AddRange(dryCleaningProducts);
        await _context.SaveChangesAsync(default);

        _logger.LogInformation("Seeded {LaundryCount} Laundry products and {DryCleaningCount} Dry Cleaning products", 
            laundryProducts.Count, dryCleaningProducts.Count);
    }
}
