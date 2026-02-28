using UnifiedPOS.Application.Categories.Commands.CreateCategory;
using UnifiedPOS.Application.Categories.Commands.DeleteCategory;
using UnifiedPOS.Application.Categories.Commands.UpdateCategory;
using UnifiedPOS.Application.Categories.Queries.GetCategories;
using UnifiedPOS.Application.Categories.Queries.GetCategoryById;
using Microsoft.AspNetCore.Http.HttpResults;

namespace UnifiedPOS.Web.Endpoints;

public class Categories : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetCategories).RequireAuthorization();
        groupBuilder.MapGet(GetCategoryById, "{id}").RequireAuthorization();
        groupBuilder.MapPost(CreateCategory).RequireAuthorization();
        groupBuilder.MapPut(UpdateCategory, "{id}").RequireAuthorization();
        groupBuilder.MapDelete(DeleteCategory, "{id}").RequireAuthorization();
    }

    public async Task<Ok<List<CategoryDto>>> GetCategories(ISender sender)
    {
        var result = await sender.Send(new GetCategoriesQuery());
        return TypedResults.Ok(result);
    }

    public async Task<Results<Ok<CategoryDetailDto>, NotFound>> GetCategoryById(ISender sender, int id)
    {
        var result = await sender.Send(new GetCategoryByIdQuery(id));
        return TypedResults.Ok(result);
    }

    public async Task<Created<int>> CreateCategory(ISender sender, CreateCategoryCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/{nameof(Categories)}/{id}", id);
    }

    public async Task<Results<NoContent, BadRequest>> UpdateCategory(ISender sender, int id, UpdateCategoryCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<NoContent> DeleteCategory(ISender sender, int id)
    {
        await sender.Send(new DeleteCategoryCommand(id));
        return TypedResults.NoContent();
    }
}
