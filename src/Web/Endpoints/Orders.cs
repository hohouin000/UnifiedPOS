using UnifiedPOS.Application.Orders.Commands.AddPayment;
using UnifiedPOS.Application.Orders.Commands.CreateOrder;
using UnifiedPOS.Application.Orders.Commands.DeleteOrder;
using UnifiedPOS.Application.Orders.Commands.UpdateOrderDetails;
using UnifiedPOS.Application.Orders.Commands.UpdateOrderStatus;
using UnifiedPOS.Application.Orders.Queries.GetOrderById;
using UnifiedPOS.Application.Orders.Queries.GetOrders;
using Microsoft.AspNetCore.Http.HttpResults;

namespace UnifiedPOS.Web.Endpoints;

public class Orders : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetOrders).RequireAuthorization();
        groupBuilder.MapGet(GetOrderById, "{id}").RequireAuthorization();
        groupBuilder.MapPost(CreateOrder).RequireAuthorization();
        groupBuilder.MapPut(UpdateOrderStatus, "{id}/status").RequireAuthorization();
        groupBuilder.MapPut(UpdateOrderDetails, "{id}/details").RequireAuthorization();
        groupBuilder.MapPost(AddPayment, "{id}/payments").RequireAuthorization();
        groupBuilder.MapDelete(DeleteOrder, "{id}").RequireAuthorization();
    }

    public async Task<Ok<List<OrderListDto>>> GetOrders(
        ISender sender,
        [AsParameters] GetOrdersQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Results<Ok<OrderDetailDto>, NotFound>> GetOrderById(ISender sender, int id)
    {
        var result = await sender.Send(new GetOrderByIdQuery(id));
        return TypedResults.Ok(result);
    }

    public async Task<Created<CreateOrderResult>> CreateOrder(ISender sender, CreateOrderCommand command)
    {
        var result = await sender.Send(command);
        return TypedResults.Created($"/{nameof(Orders)}/{result.OrderId}", result);
    }

    public async Task<Results<NoContent, BadRequest>> UpdateOrderStatus(
        ISender sender, 
        int id, 
        UpdateOrderStatusCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, BadRequest>> UpdateOrderDetails(
        ISender sender, 
        int id, 
        UpdateOrderDetailsCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Ok<AddPaymentResult>> AddPayment(
        ISender sender, 
        int id, 
        AddPaymentCommand command)
    {
        var result = await sender.Send(command with { OrderId = id });
        return TypedResults.Ok(result);
    }

    public async Task<NoContent> DeleteOrder(ISender sender, int id)
    {
        await sender.Send(new DeleteOrderCommand { Id = id });
        return TypedResults.NoContent();
    }
}
