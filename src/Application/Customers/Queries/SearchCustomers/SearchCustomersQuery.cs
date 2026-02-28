namespace UnifiedPOS.Application.Customers.Queries.SearchCustomers;

public record CustomerDto
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public required string Phone { get; init; }
    public string? Email { get; init; }
    public int OrderCount { get; init; }
}

public record SearchCustomersQuery(string SearchTerm) : IRequest<List<CustomerDto>>;

public class SearchCustomersQueryHandler : IRequestHandler<SearchCustomersQuery, List<CustomerDto>>
{
    private readonly IApplicationDbContext _context;

    public SearchCustomersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerDto>> Handle(SearchCustomersQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            return new List<CustomerDto>();
        }

        var searchTerm = request.SearchTerm.Trim().ToLower();

        return await _context.Customers
            .AsNoTracking()
            .Where(c => c.Name.ToLower().Contains(searchTerm) || 
                       c.Phone.Contains(searchTerm))
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                OrderCount = c.Orders.Count
            })
            .Take(20)
            .ToListAsync(cancellationToken);
    }
}
