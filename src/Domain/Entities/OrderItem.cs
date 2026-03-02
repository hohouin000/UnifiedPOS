namespace UnifiedPOS.Domain.Entities;

public class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    
    public int? ProductId { get; set; }
    
    public required string ProductName { get; set; }
    
    public int Quantity { get; set; }
    
    public decimal UnitPrice { get; set; }
    
    public decimal Subtotal { get; set; }
    
    public string? VariantDetails { get; set; }
    
    public string? CategoryName { get; set; }
    
    public string? CategoryPrefix { get; set; }
    
    public Order Order { get; set; } = null!;
    
    public Product? Product { get; set; }
}
