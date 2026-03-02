using UnifiedPOS.Application.Common.Interfaces;

namespace UnifiedPOS.Application.Orders.Commands.UpdateOrderDetails;

public record UpdateOrderDetailsCommand : IRequest
{
    public int Id { get; init; }
    public string? BillNumber { get; init; }
    public string? Remark { get; init; }
}

public class UpdateOrderDetailsCommandHandler : IRequestHandler<UpdateOrderDetailsCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateOrderDetailsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateOrderDetailsCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Orders
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.BillNumber = request.BillNumber;
        entity.Remark = request.Remark;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
