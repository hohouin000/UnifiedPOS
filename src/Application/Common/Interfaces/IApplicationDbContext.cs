using UnifiedPOS.Domain.Entities;

namespace UnifiedPOS.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Category> Categories { get; }
    
    DbSet<Product> Products { get; }
    
    DbSet<Variant> Variants { get; }
    
    DbSet<Customer> Customers { get; }
    
    DbSet<Order> Orders { get; }
    
    DbSet<OrderItem> OrderItems { get; }
    
    DbSet<Payment> Payments { get; }
    
    DbSet<ShopSettings> ShopSettings { get; }
    
    // Legacy - can be removed after migration
    DbSet<TodoList> TodoLists { get; }

    DbSet<TodoItem> TodoItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
