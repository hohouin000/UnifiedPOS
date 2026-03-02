namespace UnifiedPOS.Domain.Entities;

public class Customer : BaseAuditableEntity
{
    public required string Name { get; set; }
    
    public required string Phone { get; set; }
    
    public string? Email { get; set; }
    
    public string? Address { get; set; }
    
    public string? Notes { get; set; }
    
    public IList<Order> Orders { get; private set; } = new List<Order>();
}
