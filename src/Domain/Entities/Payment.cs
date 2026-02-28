using UnifiedPOS.Domain.Enums;

namespace UnifiedPOS.Domain.Entities;

public class Payment : BaseEntity
{
    public int OrderId { get; set; }
    
    public decimal Amount { get; set; }
    
    public PaymentMethod PaymentMethod { get; set; }
    
    public string? ReferenceNumber { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    
    public Order Order { get; set; } = null!;
}
