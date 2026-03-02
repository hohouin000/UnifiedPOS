namespace UnifiedPOS.Domain.Entities;

public class Product : BaseAuditableEntity
{
    public int CategoryId { get; set; }
    
    public required string Name { get; set; }
    
    public string? Description { get; set; }
    
    public decimal Price { get; set; }
    
    public bool IsStockTracked { get; set; }
    
    public int StockQuantity { get; set; }
    
    public int LowStockAlert { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public Category Category { get; set; } = null!;
    
    public IList<Variant> Variants { get; private set; } = new List<Variant>();
}
