using UnifiedPOS.Domain.Enums;

namespace UnifiedPOS.Application.Orders.Queries.GetOrders;

public record OrderListDto
{
    public int Id { get; init; }
    public required string TicketNumber { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerPhone { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public PaymentStatus PaymentStatus { get; init; }
    public OrderStatus OrderStatus { get; init; }
    public string? BillNumber { get; init; }
    public string? Remark { get; init; }
    public DateTimeOffset Created { get; init; }
    public DateTimeOffset? CollectedAt { get; init; }
}

public record GetOrdersQuery : IRequest<List<OrderListDto>>
{
    public OrderStatus? Status { get; init; }
    public string? SearchTerm { get; init; }
    public DateTimeOffset? FromDate { get; init; }
    public DateTimeOffset? ToDate { get; init; }
}

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, List<OrderListDto>>
{
    private readonly IApplicationDbContext _context;

    public GetOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<OrderListDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders.AsNoTracking().Where(o => !o.IsDeleted);

        if (request.Status.HasValue)
        {
            query = query.Where(o => o.OrderStatus == request.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(o => 
                o.TicketNumber.Contains(request.SearchTerm) ||
                (o.CustomerName != null && o.CustomerName.Contains(request.SearchTerm)) ||
                (o.BillNumber != null && o.BillNumber.Contains(request.SearchTerm)) ||
                (o.Remark != null && o.Remark.Contains(request.SearchTerm)));
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(o => o.Created >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(o => o.Created <= request.ToDate.Value);
        }

        return await query
            .OrderByDescending(o => o.Created)
            .Select(o => new OrderListDto
            {
                Id = o.Id,
                TicketNumber = o.TicketNumber,
                CustomerName = o.CustomerName,
                CustomerPhone = o.CustomerPhone,
                TotalAmount = o.TotalAmount,
                PaidAmount = o.PaidAmount,
                PaymentStatus = o.PaymentStatus,
                OrderStatus = o.OrderStatus,
                BillNumber = o.BillNumber,
                Remark = o.Remark,
                Created = o.Created,
                CollectedAt = o.CollectedAt
            })
            .Take(100)
            .ToListAsync(cancellationToken);
    }
}
