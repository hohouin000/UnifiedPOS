using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UnifiedPOS.Domain.Entities;

namespace UnifiedPOS.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        
        builder.Property(o => o.TicketNumber)
            .HasMaxLength(20)
            .IsRequired();
            
        builder.HasIndex(o => o.TicketNumber)
            .IsUnique();
            
        builder.Property(o => o.CustomerName)
            .HasMaxLength(200);
            
        builder.Property(o => o.CustomerPhone)
            .HasMaxLength(20);
            
        builder.Property(o => o.TotalAmount)
            .HasPrecision(10, 2);
            
        builder.Property(o => o.PaidAmount)
            .HasPrecision(10, 2);
            
        builder.Property(o => o.Notes)
            .HasMaxLength(1000);
            
        builder.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasMany(o => o.Payments)
            .WithOne(p => p.Order)
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
