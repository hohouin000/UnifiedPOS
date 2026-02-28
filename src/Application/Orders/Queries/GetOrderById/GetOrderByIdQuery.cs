using UnifiedPOS.Domain.Enums;

namespace UnifiedPOS.Application.Orders.Queries.GetOrderById;

public record OrderDetailDto
{
    public int Id { get; init; }
    public required string TicketNumber { get; init; }
    public int? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerPhone { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public decimal BalanceRemaining => Math.Max(0, TotalAmount - PaidAmount);
    public PaymentStatus PaymentStatus { get; init; }
    public OrderStatus OrderStatus { get; init; }
    public string? Notes { get; init; }
    public DateTimeOffset Created { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }
    public List<OrderItemDetailDto> Items { get; init; } = new();
    public List<PaymentDetailDto> Payments { get; init; } = new();
}

public record OrderItemDetailDto
{
    public int Id { get; init; }
    public required string ProductName { get; init; }
    public string? CategoryName { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal Subtotal { get; init; }
    public string? VariantDetails { get; init; }
}

public record PaymentDetailDto
{
    public int Id { get; init; }
    public decimal Amount { get; init; }
    public PaymentMethod Method { get; init; }
    public string? ReferenceNumber { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

public record GetOrderByIdQuery(int Id) : IRequest<OrderDetailDto>;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetOrderByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDetailDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, order);

        return new OrderDetailDto
        {
            Id = order.Id,
            TicketNumber = order.TicketNumber,
            CustomerId = order.CustomerId,
            CustomerName = order.CustomerName,
            CustomerPhone = order.CustomerPhone,
            TotalAmount = order.TotalAmount,
            PaidAmount = order.PaidAmount,
            PaymentStatus = order.PaymentStatus,
            OrderStatus = order.OrderStatus,
            Notes = order.Notes,
            Created = order.Created,
            CompletedAt = order.CompletedAt,
            Items = order.Items.Select(i => new OrderItemDetailDto
            {
                Id = i.Id,
                ProductName = i.ProductName,
                CategoryName = i.CategoryName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Subtotal = i.Subtotal,
                VariantDetails = i.VariantDetails
            }).ToList(),
            Payments = order.Payments.Select(p => new PaymentDetailDto
            {
                Id = p.Id,
                Amount = p.Amount,
                Method = p.PaymentMethod,
                ReferenceNumber = p.ReferenceNumber,
                CreatedAt = p.CreatedAt
            }).OrderBy(p => p.CreatedAt).ToList()
        };
    }
}
