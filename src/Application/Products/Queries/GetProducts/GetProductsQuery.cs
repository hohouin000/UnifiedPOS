namespace UnifiedPOS.Application.Products.Queries.GetProducts;

public record ProductDto
{
    public int Id { get; init; }
    public int CategoryId { get; init; }
    public required string CategoryName { get; init; }
    public required string CategoryPrefix { get; init; }
    public string? CategoryColor { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public bool IsStockTracked { get; init; }
    public int StockQuantity { get; init; }
    public int LowStockAlert { get; init; }
    public bool IsActive { get; init; }
    public bool IsLowStock => IsStockTracked && StockQuantity <= LowStockAlert;
    public List<ProductVariantDto> Variants { get; init; } = new();
}

public record ProductVariantDto
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public required string Options { get; init; }
    public bool IsRequired { get; init; }
}

public record GetProductsQuery : IRequest<List<ProductDto>>
{
    public int? CategoryId { get; init; }
    public string? SearchTerm { get; init; }
    public bool? ActiveOnly { get; init; }
}

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, List<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Variants)
            .AsQueryable();

        if (request.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(p => p.Name.Contains(request.SearchTerm));
        }

        if (request.ActiveOnly == true)
        {
            query = query.Where(p => p.IsActive);
        }

        return await query
            .OrderBy(p => p.Category.Name)
            .ThenBy(p => p.Name)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                CategoryPrefix = p.Category.Prefix,
                CategoryColor = p.Category.ColorCode,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                IsStockTracked = p.IsStockTracked,
                StockQuantity = p.StockQuantity,
                LowStockAlert = p.LowStockAlert,
                IsActive = p.IsActive,
                Variants = p.Variants.Select(v => new ProductVariantDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Options = v.Options,
                    IsRequired = v.IsRequired
                }).ToList()
            })
            .ToListAsync(cancellationToken);
    }
}
