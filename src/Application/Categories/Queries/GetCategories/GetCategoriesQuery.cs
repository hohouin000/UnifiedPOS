namespace UnifiedPOS.Application.Categories.Queries.GetCategories;

public record CategoryDto
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public required string Prefix { get; init; }
    public string? ColorCode { get; init; }
    public int ProductCount { get; init; }
}

public record GetCategoriesQuery : IRequest<List<CategoryDto>>;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCategoriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Categories
            .AsNoTracking()
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Prefix = c.Prefix,
                ColorCode = c.ColorCode,
                ProductCount = c.Products.Count
            })
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }
}
