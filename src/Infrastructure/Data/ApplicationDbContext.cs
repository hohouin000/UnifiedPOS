using System.Reflection;
using UnifiedPOS.Application.Common.Interfaces;
using UnifiedPOS.Domain.Entities;
using UnifiedPOS.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace UnifiedPOS.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    
    public DbSet<Product> Products => Set<Product>();
    
    public DbSet<Variant> Variants => Set<Variant>();
    
    public DbSet<Customer> Customers => Set<Customer>();
    
    public DbSet<Order> Orders => Set<Order>();
    
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    
    public DbSet<Payment> Payments => Set<Payment>();
    
    public DbSet<ShopSettings> ShopSettings => Set<ShopSettings>();

    // Keep legacy entities for now - can be removed later
    public DbSet<TodoList> TodoLists => Set<TodoList>();

    public DbSet<TodoItem> TodoItems => Set<TodoItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // SQLite does not support DateTimeOffset natively, so we need converters
        if (Database.ProviderName == "Microsoft.EntityFrameworkCore.Sqlite")
        {
            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                var dateTimeOffsetProperties = entityType.ClrType.GetProperties()
                    .Where(p => p.PropertyType == typeof(DateTimeOffset) 
                             || p.PropertyType == typeof(DateTimeOffset?));

                foreach (var property in dateTimeOffsetProperties)
                {
                    if (property.PropertyType == typeof(DateTimeOffset))
                    {
                        builder.Entity(entityType.ClrType)
                            .Property(property.Name)
                            .HasConversion(new DateTimeOffsetToBinaryConverter());
                    }
                    else if (property.PropertyType == typeof(DateTimeOffset?))
                    {
                        builder.Entity(entityType.ClrType)
                            .Property(property.Name)
                            .HasConversion(new DateTimeOffsetToBinaryConverter());
                    }
                }

                // Also handle decimal precision for SQLite
                var decimalProperties = entityType.ClrType.GetProperties()
                    .Where(p => p.PropertyType == typeof(decimal) 
                             || p.PropertyType == typeof(decimal?));

                foreach (var property in decimalProperties)
                {
                    builder.Entity(entityType.ClrType)
                        .Property(property.Name)
                        .HasConversion<double>();
                }
            }
        }
    }
}
