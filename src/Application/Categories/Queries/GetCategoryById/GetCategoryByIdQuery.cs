namespace UnifiedPOS.Application.Categories.Queries.GetCategoryById;

public record CategoryDetailDto
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public required string Prefix { get; init; }
    public string? ColorCode { get; init; }
    public List<ProductSummaryDto> Products { get; init; } = new();
}

public record ProductSummaryDto
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public decimal Price { get; init; }
    public bool IsActive { get; init; }
}

public record GetCategoryByIdQuery(int Id) : IRequest<CategoryDetailDto>;

public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetCategoryByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CategoryDetailDto> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, category);

        return new CategoryDetailDto
        {
            Id = category.Id,
            Name = category.Name,
            Prefix = category.Prefix,
            ColorCode = category.ColorCode,
            Products = category.Products.Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                IsActive = p.IsActive
            }).OrderBy(p => p.Name).ToList()
        };
    }
}
