namespace UnifiedPOS.Application.Customers.Queries.GetAllCustomers;

public record CustomerListDto
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public required string Phone { get; init; }
    public string? Email { get; init; }
    public int OrderCount { get; init; }
}

public record GetAllCustomersQuery : IRequest<List<CustomerListDto>>;

public class GetAllCustomersQueryHandler : IRequestHandler<GetAllCustomersQuery, List<CustomerListDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllCustomersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerListDto>> Handle(GetAllCustomersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Customers
            .OrderBy(c => c.Name)
            .Select(c => new CustomerListDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                OrderCount = c.Orders.Count
            })
            .ToListAsync(cancellationToken);
    }
}
