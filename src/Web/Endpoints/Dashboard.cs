using UnifiedPOS.Application.Dashboard.Queries.GetDashboardSummary;

namespace UnifiedPOS.Web.Endpoints;

public class Dashboard : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/Dashboard", async (ISender sender) =>
        {
            var result = await sender.Send(new GetDashboardSummaryQuery());
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
