using UnifiedPOS.Application.TodoLists.Commands.CreateTodoList;
using UnifiedPOS.Application.TodoLists.Commands.DeleteTodoList;
using UnifiedPOS.Application.TodoLists.Commands.UpdateTodoList;
using UnifiedPOS.Application.TodoLists.Queries.GetTodos;

namespace UnifiedPOS.Web.Endpoints;

public class TodoLists : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/todolists", async (ISender sender) =>
        {
            var vm = await sender.Send(new GetTodosQuery());
            return Results.Ok(vm);
        }).RequireAuthorization();

        app.MapPost("/api/todolists", async (ISender sender, CreateTodoListCommand command) =>
        {
            var id = await sender.Send(command);
            return Results.Created($"/api/todolists/{id}", id);
        }).RequireAuthorization();

        app.MapPut("/api/todolists/{id}", async (ISender sender, int id, UpdateTodoListCommand command) =>
        {
            if (id != command.Id) return Results.BadRequest();
            await sender.Send(command);
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapDelete("/api/todolists/{id}", async (ISender sender, int id) =>
        {
            await sender.Send(new DeleteTodoListCommand(id));
            return Results.NoContent();
        }).RequireAuthorization();
    }
}
