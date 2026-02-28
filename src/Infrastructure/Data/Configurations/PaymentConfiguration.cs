using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UnifiedPOS.Domain.Entities;

namespace UnifiedPOS.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Amount)
            .HasPrecision(10, 2);
            
        builder.Property(p => p.ReferenceNumber)
            .HasMaxLength(100);
    }
}
