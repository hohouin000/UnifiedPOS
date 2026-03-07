using UnifiedPOS.Application.Categories.Commands.CreateCategory;
using UnifiedPOS.Application.Categories.Commands.DeleteCategory;
using UnifiedPOS.Application.Categories.Commands.UpdateCategory;
using UnifiedPOS.Application.Categories.Queries.GetCategories;
using UnifiedPOS.Application.Categories.Queries.GetCategoryById;

namespace UnifiedPOS.Web.Endpoints;

public class Categories : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/categories", async (ISender sender) =>
        {
            var result = await sender.Send(new GetCategoriesQuery());
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapGet("/api/categories/{id}", async (ISender sender, int id) =>
        {
            var result = await sender.Send(new GetCategoryByIdQuery(id));
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapPost("/api/categories", async (ISender sender, CreateCategoryCommand command) =>
        {
            var id = await sender.Send(command);
            return Results.Created($"/api/categories/{id}", id);
        }).RequireAuthorization();

        app.MapPut("/api/categories/{id}", async (ISender sender, int id, UpdateCategoryCommand command) =>
        {
            if (id != command.Id) return Results.BadRequest();
            await sender.Send(command);
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapDelete("/api/categories/{id}", async (ISender sender, int id) =>
        {
            await sender.Send(new DeleteCategoryCommand(id));
            return Results.NoContent();
        }).RequireAuthorization();
    }
}
