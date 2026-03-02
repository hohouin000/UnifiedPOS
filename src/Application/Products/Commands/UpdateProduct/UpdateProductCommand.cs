namespace UnifiedPOS.Application.Products.Commands.UpdateProduct;

public record UpdateProductCommand : IRequest
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public bool IsStockTracked { get; init; }
    public int StockQuantity { get; init; }
    public int LowStockAlert { get; init; }
    public bool IsActive { get; init; }
}

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, product);

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.IsStockTracked = request.IsStockTracked;
        product.StockQuantity = request.StockQuantity;
        product.LowStockAlert = request.LowStockAlert;
        product.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
