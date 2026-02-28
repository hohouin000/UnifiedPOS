using UnifiedPOS.Application.Products.Commands.CreateProduct;
using UnifiedPOS.Application.Products.Commands.UpdateProduct;
using UnifiedPOS.Application.Products.Commands.DeleteProduct;
using UnifiedPOS.Application.Products.Queries.GetProducts;
using Microsoft.AspNetCore.Http.HttpResults;

namespace UnifiedPOS.Web.Endpoints;

public class Products : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetProducts).RequireAuthorization();
        groupBuilder.MapPost(CreateProduct).RequireAuthorization();
        groupBuilder.MapPut(UpdateProduct, "{id}").RequireAuthorization();
        groupBuilder.MapDelete(DeleteProduct, "{id}").RequireAuthorization();
    }

    public async Task<Ok<List<ProductDto>>> GetProducts(ISender sender, 
        [AsParameters] GetProductsQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Created<int>> CreateProduct(ISender sender, CreateProductCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/{nameof(Products)}/{id}", id);
    }

    public async Task<Results<NoContent, BadRequest>> UpdateProduct(ISender sender, int id, UpdateProductCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<NoContent> DeleteProduct(ISender sender, int id)
    {
        await sender.Send(new DeleteProductCommand(id));
        return TypedResults.NoContent();
    }
}
