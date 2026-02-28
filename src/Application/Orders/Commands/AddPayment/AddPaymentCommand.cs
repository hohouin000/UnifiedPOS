using UnifiedPOS.Application.Common.Interfaces;
using UnifiedPOS.Domain.Entities;
using UnifiedPOS.Domain.Enums;

namespace UnifiedPOS.Application.Orders.Commands.AddPayment;

public record AddPaymentCommand : IRequest<AddPaymentResult>
{
    public int OrderId { get; init; }
    public decimal Amount { get; init; }
    public PaymentMethod Method { get; init; }
    public string? ReferenceNumber { get; init; }
}

public record AddPaymentResult
{
    public decimal TotalAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public decimal BalanceRemaining { get; init; }
    public PaymentStatus PaymentStatus { get; init; }
}

public class AddPaymentCommandHandler : IRequestHandler<AddPaymentCommand, AddPaymentResult>
{
    private readonly IApplicationDbContext _context;

    public AddPaymentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AddPaymentResult> Handle(AddPaymentCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .FindAsync(new object[] { request.OrderId }, cancellationToken);

        Guard.Against.NotFound(request.OrderId, order);

        var payment = new Payment
        {
            OrderId = request.OrderId,
            Amount = request.Amount,
            PaymentMethod = request.Method,
            ReferenceNumber = request.ReferenceNumber,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.Payments.Add(payment);

        order.PaidAmount += request.Amount;
        order.UpdatePaymentStatus();

        await _context.SaveChangesAsync(cancellationToken);

        return new AddPaymentResult
        {
            TotalAmount = order.TotalAmount,
            PaidAmount = order.PaidAmount,
            BalanceRemaining = Math.Max(0, order.TotalAmount - order.PaidAmount),
            PaymentStatus = order.PaymentStatus
        };
    }
}
