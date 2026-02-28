using UnifiedPOS.Application.Common.Interfaces;
using UnifiedPOS.Domain.Entities;

namespace UnifiedPOS.Application.Products.Commands.CreateProduct;

public record CreateProductCommand : IRequest<int>
{
    public int CategoryId { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public bool IsStockTracked { get; init; }
    public int StockQuantity { get; init; }
    public int LowStockAlert { get; init; }
    public List<VariantDto>? Variants { get; init; }
}

public record VariantDto
{
    public required string Name { get; init; }
    public required string Options { get; init; }
    public bool IsRequired { get; init; }
}

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var entity = new Product
        {
            CategoryId = request.CategoryId,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            IsStockTracked = request.IsStockTracked,
            StockQuantity = request.StockQuantity,
            LowStockAlert = request.LowStockAlert,
            IsActive = true
        };

        if (request.Variants != null)
        {
            foreach (var variant in request.Variants)
            {
                entity.Variants.Add(new Variant
                {
                    Name = variant.Name,
                    Options = variant.Options,
                    IsRequired = variant.IsRequired
                });
            }
        }

        _context.Products.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
