using UnifiedPOS.Domain.Enums;

namespace UnifiedPOS.Application.Dashboard.Queries.GetDashboardSummary;

public record DashboardSummaryDto
{
    public decimal TodaysRevenue { get; init; }
    public int PendingOrders { get; init; }
    public int ReadyForPickup { get; init; }
    public int TotalOrdersToday { get; init; }
    public List<LowStockItemDto> LowStockItems { get; init; } = new();
    public List<RecentOrderDto> RecentOrders { get; init; } = new();
}

public record LowStockItemDto
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public int StockQuantity { get; init; }
    public int LowStockAlert { get; init; }
}

public record RecentOrderDto
{
    public int Id { get; init; }
    public required string TicketNumber { get; init; }
    public string? CustomerName { get; init; }
    public decimal TotalAmount { get; init; }
    public OrderStatus Status { get; init; }
    public DateTimeOffset Created { get; init; }
}

public record GetDashboardSummaryQuery : IRequest<DashboardSummaryDto>;

public class GetDashboardSummaryQueryHandler : IRequestHandler<GetDashboardSummaryQuery, DashboardSummaryDto>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardSummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        var today = DateTimeOffset.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        // Today's revenue from payments
        var todaysRevenue = await _context.Payments
            .Where(p => p.CreatedAt >= today && p.CreatedAt < tomorrow)
            .SumAsync(p => p.Amount, cancellationToken);

        // Order counts
        var pendingOrders = await _context.Orders
            .CountAsync(o => o.OrderStatus == OrderStatus.Pending, cancellationToken);

        var readyForPickup = await _context.Orders
            .CountAsync(o => o.OrderStatus == OrderStatus.Ready, cancellationToken);

        var totalOrdersToday = await _context.Orders
            .CountAsync(o => o.Created >= today && o.Created < tomorrow, cancellationToken);

        // Low stock items
        var lowStockItems = await _context.Products
            .Where(p => p.IsStockTracked && p.StockQuantity <= p.LowStockAlert && p.IsActive)
            .Select(p => new LowStockItemDto
            {
                Id = p.Id,
                Name = p.Name,
                StockQuantity = p.StockQuantity,
                LowStockAlert = p.LowStockAlert
            })
            .Take(10)
            .ToListAsync(cancellationToken);

        // Recent orders
        var recentOrders = await _context.Orders
            .OrderByDescending(o => o.Created)
            .Take(5)
            .Select(o => new RecentOrderDto
            {
                Id = o.Id,
                TicketNumber = o.TicketNumber,
                CustomerName = o.CustomerName,
                TotalAmount = o.TotalAmount,
                Status = o.OrderStatus,
                Created = o.Created
            })
            .ToListAsync(cancellationToken);

        return new DashboardSummaryDto
        {
            TodaysRevenue = todaysRevenue,
            PendingOrders = pendingOrders,
            ReadyForPickup = readyForPickup,
            TotalOrdersToday = totalOrdersToday,
            LowStockItems = lowStockItems,
            RecentOrders = recentOrders
        };
    }
}
