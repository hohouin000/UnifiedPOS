using UnifiedPOS.Application.Orders.Commands.AddPayment;
using UnifiedPOS.Application.Orders.Commands.CreateOrder;
using UnifiedPOS.Application.Orders.Commands.DeleteOrder;
using UnifiedPOS.Application.Orders.Commands.UpdateOrderDetails;
using UnifiedPOS.Application.Orders.Commands.UpdateOrderStatus;
using UnifiedPOS.Application.Orders.Queries.GetOrderById;
using UnifiedPOS.Application.Orders.Queries.GetOrders;

namespace UnifiedPOS.Web.Endpoints;

public class Orders : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/orders", async (ISender sender, int? status, string? searchTerm, DateTime? fromDate, DateTime? toDate) =>
        {
            var query = new GetOrdersQuery
            {
                Status = status.HasValue ? (UnifiedPOS.Domain.Enums.OrderStatus)status.Value : null,
                SearchTerm = searchTerm,
                FromDate = fromDate,
                ToDate = toDate
            };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapGet("/api/orders/{id}", async (ISender sender, int id) =>
        {
            var result = await sender.Send(new GetOrderByIdQuery(id));
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapPost("/api/orders", async (ISender sender, CreateOrderCommand command) =>
        {
            var result = await sender.Send(command);
            return Results.Created($"/api/orders/{result.OrderId}", result);
        }).RequireAuthorization();

        app.MapPut("/api/orders/{id}/status", async (ISender sender, int id, UpdateOrderStatusCommand command) =>
        {
            if (id != command.Id) return Results.BadRequest();
            await sender.Send(command);
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapPut("/api/orders/{id}/details", async (ISender sender, int id, UpdateOrderDetailsCommand command) =>
        {
            if (id != command.Id) return Results.BadRequest();
            await sender.Send(command);
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapPost("/api/orders/{id}/payments", async (ISender sender, int id, AddPaymentCommand command) =>
        {
            var result = await sender.Send(command with { OrderId = id });
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapDelete("/api/orders/{id}", async (ISender sender, int id) =>
        {
            await sender.Send(new DeleteOrderCommand { Id = id });
            return Results.NoContent();
        }).RequireAuthorization();
    }
}
