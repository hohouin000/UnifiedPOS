using UnifiedPOS.Application.Customers.Commands.CreateCustomer;
using UnifiedPOS.Application.Customers.Commands.UpdateCustomer;
using UnifiedPOS.Application.Customers.Queries.SearchCustomers;
using UnifiedPOS.Application.Customers.Queries.GetAllCustomers;

namespace UnifiedPOS.Web.Endpoints;

public class Customers : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/Customers", async (ISender sender) =>
        {
            var result = await sender.Send(new GetAllCustomersQuery());
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapGet("/api/Customers/search", async (ISender sender, string? searchTerm) =>
        {
            var result = await sender.Send(new SearchCustomersQuery(searchTerm ?? ""));
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapPost("/api/Customers", async (ISender sender, CreateCustomerCommand command) =>
        {
            var id = await sender.Send(command);
            return Results.Created($"/api/Customers/{id}", id);
        }).RequireAuthorization();

        app.MapPut("/api/Customers/{id}", async (ISender sender, int id, UpdateCustomerCommand command) =>
        {
            if (id != command.Id) return Results.BadRequest();
            await sender.Send(command);
            return Results.NoContent();
        }).RequireAuthorization();
    }
}
