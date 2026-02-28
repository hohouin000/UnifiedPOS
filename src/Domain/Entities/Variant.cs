namespace UnifiedPOS.Domain.Entities;

public class Variant : BaseEntity
{
    public int ProductId { get; set; }
    
    public required string Name { get; set; }
    
    public required string Options { get; set; }
    
    public bool IsRequired { get; set; }
    
    public Product Product { get; set; } = null!;
}
