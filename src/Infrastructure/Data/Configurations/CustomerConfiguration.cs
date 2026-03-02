using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UnifiedPOS.Domain.Entities;

namespace UnifiedPOS.Infrastructure.Data.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.HasKey(c => c.Id);
        
        builder.Property(c => c.Name)
            .HasMaxLength(200)
            .IsRequired();
            
        builder.Property(c => c.Phone)
            .HasMaxLength(20)
            .IsRequired();
            
        builder.HasIndex(c => c.Phone)
            .IsUnique();
            
        builder.Property(c => c.Email)
            .HasMaxLength(200);
            
        builder.Property(c => c.Address)
            .HasMaxLength(500);
            
        builder.Property(c => c.Notes)
            .HasMaxLength(1000);
            
        builder.HasMany(c => c.Orders)
            .WithOne(o => o.Customer)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
