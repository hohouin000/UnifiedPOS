using UnifiedPOS.Application.Products.Commands.CreateProduct;
using UnifiedPOS.Application.Products.Commands.UpdateProduct;
using UnifiedPOS.Application.Products.Commands.DeleteProduct;
using UnifiedPOS.Application.Products.Queries.GetProducts;

namespace UnifiedPOS.Web.Endpoints;

public class Products : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/Products", async (ISender sender, int? categoryId) =>
        {
            var result = await sender.Send(new GetProductsQuery { CategoryId = categoryId });
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapPost("/api/Products", async (ISender sender, CreateProductCommand command) =>
        {
            var id = await sender.Send(command);
            return Results.Created($"/api/Products/{id}", id);
        }).RequireAuthorization();

        app.MapPut("/api/Products/{id}", async (ISender sender, int id, UpdateProductCommand command) =>
        {
            if (id != command.Id) return Results.BadRequest();
            await sender.Send(command);
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapDelete("/api/Products/{id}", async (ISender sender, int id) =>
        {
            await sender.Send(new DeleteProductCommand(id));
            return Results.NoContent();
        }).RequireAuthorization();
    }
}
