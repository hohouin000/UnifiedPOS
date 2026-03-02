using UnifiedPOS.Application.Common.Interfaces;

namespace UnifiedPOS.Application.Orders.Commands.DeleteOrder;

public record DeleteOrderCommand : IRequest
{
    public int Id { get; init; }
}

public class DeleteOrderCommandHandler : IRequestHandler<DeleteOrderCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteOrderCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Orders
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
