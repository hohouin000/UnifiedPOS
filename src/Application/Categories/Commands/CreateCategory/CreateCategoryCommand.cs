using UnifiedPOS.Application.Common.Interfaces;
using UnifiedPOS.Domain.Entities;

namespace UnifiedPOS.Application.Categories.Commands.CreateCategory;

public record CreateCategoryCommand : IRequest<int>
{
    public required string Name { get; init; }
    public required string Prefix { get; init; }
    public string? ColorCode { get; init; }
}

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = new Category
        {
            Name = request.Name,
            Prefix = request.Prefix.ToUpper(),
            ColorCode = request.ColorCode
        };

        _context.Categories.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
