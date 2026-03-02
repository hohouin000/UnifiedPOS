namespace UnifiedPOS.Domain.Entities;

public class Category : BaseAuditableEntity
{
    public required string Name { get; set; }
    
    public required string Prefix { get; set; }
    
    public string? ColorCode { get; set; }
    
    public IList<Product> Products { get; private set; } = new List<Product>();
}
