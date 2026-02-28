using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UnifiedPOS.Domain.Entities;

namespace UnifiedPOS.Infrastructure.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(i => i.Id);
        
        builder.Property(i => i.ProductName)
            .HasMaxLength(200)
            .IsRequired();
            
        builder.Property(i => i.UnitPrice)
            .HasPrecision(10, 2);
            
        builder.Property(i => i.Subtotal)
            .HasPrecision(10, 2);
            
        builder.Property(i => i.VariantDetails)
            .HasMaxLength(500);
            
        builder.Property(i => i.CategoryName)
            .HasMaxLength(100);
            
        builder.Property(i => i.CategoryPrefix)
            .HasMaxLength(3);
            
        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
