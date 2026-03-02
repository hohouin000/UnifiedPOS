using UnifiedPOS.Application.Common.Interfaces;
using UnifiedPOS.Domain.Entities;
using UnifiedPOS.Domain.Enums;

namespace UnifiedPOS.Application.Orders.Commands.CreateOrder;

public record CreateOrderCommand : IRequest<CreateOrderResult>
{
    public int? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerPhone { get; init; }
    public List<OrderItemDto> Items { get; init; } = new();
    public PaymentDto? Payment { get; init; }
    public string? Notes { get; init; }
    public string? BillNumber { get; init; }
    public string? Remark { get; init; }
}

public record OrderItemDto
{
    public int ProductId { get; init; }
    public required string ProductName { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public string? VariantDetails { get; init; }
    public string? CategoryName { get; init; }
    public string? CategoryPrefix { get; init; }
}

public record PaymentDto
{
    public decimal Amount { get; init; }
    public PaymentMethod Method { get; init; }
    public string? ReferenceNumber { get; init; }
}

public record CreateOrderResult
{
    public int OrderId { get; init; }
    public required string TicketNumber { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public decimal ChangeAmount { get; init; }
}

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, CreateOrderResult>
{
    private readonly IApplicationDbContext _context;

    public CreateOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateOrderResult> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // Get the primary category prefix for ticket number
        var primaryPrefix = request.Items.FirstOrDefault()?.CategoryPrefix ?? "X";
        
        // Generate ticket number: PREFIX-YYMMDD-SEQ
        var today = DateTimeOffset.UtcNow;
        var datePrefix = today.ToString("yyMMdd");
        var ticketPrefix = $"{primaryPrefix}-{datePrefix}";
        
        // Get next sequence number for today and this category prefix
        var lastOrder = await _context.Orders
            .Where(o => o.TicketNumber.StartsWith(ticketPrefix))
            .OrderByDescending(o => o.TicketNumber)
            .FirstOrDefaultAsync(cancellationToken);

        int sequence = 1;
        if (lastOrder != null)
        {
            var lastSeq = lastOrder.TicketNumber.Split('-').LastOrDefault();
            if (int.TryParse(lastSeq, out var lastNum))
            {
                sequence = lastNum + 1;
            }
        }

        var ticketNumber = $"{ticketPrefix}-{sequence:D3}";

        // Calculate total
        var totalAmount = request.Items.Sum(i => i.UnitPrice * i.Quantity);

        // Create order
        var order = new Order
        {
            TicketNumber = ticketNumber,
            CustomerId = request.CustomerId,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            TotalAmount = totalAmount,
            PaidAmount = 0,
            PaymentStatus = PaymentStatus.Unpaid,
            OrderStatus = OrderStatus.Pending,
            Notes = request.Notes,
            BillNumber = request.BillNumber,
            Remark = request.Remark
        };

        // Add items
        foreach (var item in request.Items)
        {
            order.Items.Add(new OrderItem
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                Subtotal = item.UnitPrice * item.Quantity,
                VariantDetails = item.VariantDetails,
                CategoryName = item.CategoryName,
                CategoryPrefix = item.CategoryPrefix
            });
        }

        // Add payment if provided
        decimal changeAmount = 0;
        if (request.Payment != null && request.Payment.Amount > 0)
        {
            order.Payments.Add(new Payment
            {
                Amount = Math.Min(request.Payment.Amount, totalAmount),
                PaymentMethod = request.Payment.Method,
                ReferenceNumber = request.Payment.ReferenceNumber,
                CreatedAt = DateTimeOffset.UtcNow
            });
            
            order.PaidAmount = Math.Min(request.Payment.Amount, totalAmount);
            order.UpdatePaymentStatus();
            
            if (request.Payment.Amount > totalAmount)
            {
                changeAmount = request.Payment.Amount - totalAmount;
            }
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateOrderResult
        {
            OrderId = order.Id,
            TicketNumber = ticketNumber,
            TotalAmount = totalAmount,
            PaidAmount = order.PaidAmount,
            ChangeAmount = changeAmount
        };
    }
}
