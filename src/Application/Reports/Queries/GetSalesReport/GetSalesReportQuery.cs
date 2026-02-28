using UnifiedPOS.Domain.Enums;

namespace UnifiedPOS.Application.Reports.Queries.GetSalesReport;

public record SalesReportDto
{
    public DateTimeOffset FromDate { get; init; }
    public DateTimeOffset ToDate { get; init; }
    
    // Executive Summary
    public decimal TotalRevenue { get; init; }
    public int TotalOrders { get; init; }
    public decimal AverageOrderValue { get; init; }
    public int UniqueCustomers { get; init; }
    
    // Payment Methods Breakdown
    public List<PaymentMethodBreakdownDto> PaymentMethods { get; init; } = new();
    
    // Category Sales
    public List<CategorySalesDto> CategorySales { get; init; } = new();
    
    // Top Products
    public List<TopProductDto> TopProducts { get; init; } = new();
    
    // Order Status Distribution
    public Dictionary<OrderStatus, int> OrderStatusDistribution { get; init; } = new();
    
    // Daily Breakdown
    public List<DailySalesDto> DailyBreakdown { get; init; } = new();
}

public record PaymentMethodBreakdownDto
{
    public PaymentMethod Method { get; init; }
    public int Count { get; init; }
    public decimal Amount { get; init; }
    public decimal Percentage { get; init; }
}

public record CategorySalesDto
{
    public required string CategoryName { get; init; }
    public int ItemsSold { get; init; }
    public decimal Revenue { get; init; }
    public decimal Percentage { get; init; }
}

public record TopProductDto
{
    public int Rank { get; init; }
    public required string ProductName { get; init; }
    public int Quantity { get; init; }
    public decimal Revenue { get; init; }
}

public record DailySalesDto
{
    public DateOnly Date { get; init; }
    public int Orders { get; init; }
    public decimal Revenue { get; init; }
}

public record GetSalesReportQuery : IRequest<SalesReportDto>
{
    public DateTimeOffset FromDate { get; init; }
    public DateTimeOffset ToDate { get; init; }
}

public class GetSalesReportQueryHandler : IRequestHandler<GetSalesReportQuery, SalesReportDto>
{
    private readonly IApplicationDbContext _context;

    public GetSalesReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SalesReportDto> Handle(GetSalesReportQuery request, CancellationToken cancellationToken)
    {
        var orders = await _context.Orders
            .Where(o => o.Created >= request.FromDate && o.Created <= request.ToDate)
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .ToListAsync(cancellationToken);

        var totalRevenue = orders.Sum(o => o.PaidAmount);
        var totalOrders = orders.Count;
        var uniqueCustomers = orders.Where(o => o.CustomerId.HasValue).Select(o => o.CustomerId).Distinct().Count();

        // Payment Methods
        var allPayments = orders.SelectMany(o => o.Payments).ToList();
        var paymentMethods = allPayments
            .GroupBy(p => p.PaymentMethod)
            .Select(g => new PaymentMethodBreakdownDto
            {
                Method = g.Key,
                Count = g.Count(),
                Amount = g.Sum(p => p.Amount),
                Percentage = totalRevenue > 0 ? Math.Round(g.Sum(p => p.Amount) / totalRevenue * 100, 1) : 0
            })
            .OrderByDescending(p => p.Amount)
            .ToList();

        // Category Sales
        var allItems = orders.SelectMany(o => o.Items).ToList();
        var totalItemsRevenue = allItems.Sum(i => i.Subtotal);
        var categorySales = allItems
            .GroupBy(i => i.CategoryName ?? "Unknown")
            .Select(g => new CategorySalesDto
            {
                CategoryName = g.Key,
                ItemsSold = g.Sum(i => i.Quantity),
                Revenue = g.Sum(i => i.Subtotal),
                Percentage = totalItemsRevenue > 0 ? Math.Round(g.Sum(i => i.Subtotal) / totalItemsRevenue * 100, 1) : 0
            })
            .OrderByDescending(c => c.Revenue)
            .ToList();

        // Top Products
        var topProducts = allItems
            .GroupBy(i => i.ProductName)
            .OrderByDescending(g => g.Sum(i => i.Quantity))
            .Take(10)
            .Select((g, index) => new TopProductDto
            {
                Rank = index + 1,
                ProductName = g.Key,
                Quantity = g.Sum(i => i.Quantity),
                Revenue = g.Sum(i => i.Subtotal)
            })
            .ToList();

        // Order Status Distribution
        var statusDistribution = orders
            .GroupBy(o => o.OrderStatus)
            .ToDictionary(g => g.Key, g => g.Count());

        // Daily Breakdown
        var dailyBreakdown = orders
            .GroupBy(o => DateOnly.FromDateTime(o.Created.Date))
            .Select(g => new DailySalesDto
            {
                Date = g.Key,
                Orders = g.Count(),
                Revenue = g.Sum(o => o.PaidAmount)
            })
            .OrderBy(d => d.Date)
            .ToList();

        return new SalesReportDto
        {
            FromDate = request.FromDate,
            ToDate = request.ToDate,
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            AverageOrderValue = totalOrders > 0 ? Math.Round(totalRevenue / totalOrders, 2) : 0,
            UniqueCustomers = uniqueCustomers,
            PaymentMethods = paymentMethods,
            CategorySales = categorySales,
            TopProducts = topProducts,
            OrderStatusDistribution = statusDistribution,
            DailyBreakdown = dailyBreakdown
        };
    }
}
