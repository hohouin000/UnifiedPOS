using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UnifiedPOS.Domain.Entities;

namespace UnifiedPOS.Infrastructure.Data.Configurations;

public class VariantConfiguration : IEntityTypeConfiguration<Variant>
{
    public void Configure(EntityTypeBuilder<Variant> builder)
    {
        builder.HasKey(v => v.Id);
        
        builder.Property(v => v.Name)
            .HasMaxLength(100)
            .IsRequired();
            
        builder.Property(v => v.Options)
            .HasMaxLength(500)
            .IsRequired();
    }
}
