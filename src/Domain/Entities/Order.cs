using UnifiedPOS.Domain.Enums;

namespace UnifiedPOS.Domain.Entities;

public class Order : BaseAuditableEntity
{
    public required string TicketNumber { get; set; }
    
    public int? CustomerId { get; set; }
    
    public string? CustomerName { get; set; }
    
    public string? CustomerPhone { get; set; }
    
    public decimal TotalAmount { get; set; }
    
    public decimal PaidAmount { get; set; }
    
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;
    
    public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;
    
    public string? Notes { get; set; }
    
    public DateTimeOffset? CompletedAt { get; set; }
    
    public Customer? Customer { get; set; }
    
    public IList<OrderItem> Items { get; private set; } = new List<OrderItem>();
    
    public IList<Payment> Payments { get; private set; } = new List<Payment>();
    
    public void UpdatePaymentStatus()
    {
        if (PaidAmount <= 0)
            PaymentStatus = PaymentStatus.Unpaid;
        else if (PaidAmount >= TotalAmount)
            PaymentStatus = PaymentStatus.Paid;
        else
            PaymentStatus = PaymentStatus.Partial;
    }
}
