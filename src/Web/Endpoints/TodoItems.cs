using UnifiedPOS.Application.Common.Models;
using UnifiedPOS.Application.TodoItems.Commands.CreateTodoItem;
using UnifiedPOS.Application.TodoItems.Commands.DeleteTodoItem;
using UnifiedPOS.Application.TodoItems.Commands.UpdateTodoItem;
using UnifiedPOS.Application.TodoItems.Commands.UpdateTodoItemDetail;
using UnifiedPOS.Application.TodoItems.Queries.GetTodoItemsWithPagination;

namespace UnifiedPOS.Web.Endpoints;

public class TodoItems : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/todoitems", async (ISender sender, int listId, int pageNumber, int pageSize) =>
        {
            var result = await sender.Send(new GetTodoItemsWithPaginationQuery { ListId = listId, PageNumber = pageNumber, PageSize = pageSize });
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapPost("/api/todoitems", async (ISender sender, CreateTodoItemCommand command) =>
        {
            var id = await sender.Send(command);
            return Results.Created($"/api/todoitems/{id}", id);
        }).RequireAuthorization();

        app.MapPut("/api/todoitems/{id}", async (ISender sender, int id, UpdateTodoItemCommand command) =>
        {
            if (id != command.Id) return Results.BadRequest();
            await sender.Send(command);
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapPut("/api/todoitems/UpdateDetail/{id}", async (ISender sender, int id, UpdateTodoItemDetailCommand command) =>
        {
            if (id != command.Id) return Results.BadRequest();
            await sender.Send(command);
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapDelete("/api/todoitems/{id}", async (ISender sender, int id) =>
        {
            await sender.Send(new DeleteTodoItemCommand(id));
            return Results.NoContent();
        }).RequireAuthorization();
    }
}
