using UnifiedPOS.Application.Common.Interfaces;
using UnifiedPOS.Domain.Enums;

namespace UnifiedPOS.Application.Orders.Commands.UpdateOrderStatus;

public record UpdateOrderStatusCommand : IRequest
{
    public int Id { get; init; }
    public OrderStatus Status { get; init; }
}

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateOrderStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Orders
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.OrderStatus = request.Status;
        
        if (request.Status == OrderStatus.Completed)
        {
            entity.CompletedAt = DateTimeOffset.UtcNow;
        }
        
        if (request.Status == OrderStatus.Collected)
        {
            entity.CollectedAt = DateTimeOffset.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
