using UnifiedPOS.Application.Customers.Commands.CreateCustomer;
using UnifiedPOS.Application.Customers.Commands.UpdateCustomer;
using UnifiedPOS.Application.Customers.Queries.SearchCustomers;
using UnifiedPOS.Application.Customers.Queries.GetAllCustomers;
using Microsoft.AspNetCore.Http.HttpResults;

namespace UnifiedPOS.Web.Endpoints;

public class Customers : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetAllCustomers).RequireAuthorization();
        groupBuilder.MapGet(SearchCustomers, "search").RequireAuthorization();
        groupBuilder.MapPost(CreateCustomer).RequireAuthorization();
        groupBuilder.MapPut(UpdateCustomer, "{id}").RequireAuthorization();
    }

    public async Task<Ok<List<CustomerListDto>>> GetAllCustomers(ISender sender)
    {
        var result = await sender.Send(new GetAllCustomersQuery());
        return TypedResults.Ok(result);
    }

    public async Task<Ok<List<CustomerDto>>> SearchCustomers(ISender sender,
        [AsParameters] SearchCustomersQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Created<int>> CreateCustomer(ISender sender, CreateCustomerCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/{nameof(Customers)}/{id}", id);
    }

    public async Task<Results<NoContent, BadRequest>> UpdateCustomer(ISender sender, int id, UpdateCustomerCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }
}
