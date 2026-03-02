using UnifiedPOS.Application.Dashboard.Queries.GetDashboardSummary;
using Microsoft.AspNetCore.Http.HttpResults;

namespace UnifiedPOS.Web.Endpoints;

public class Dashboard : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetDashboardSummary).RequireAuthorization();
    }

    public async Task<Ok<DashboardSummaryDto>> GetDashboardSummary(ISender sender)
    {
        var result = await sender.Send(new GetDashboardSummaryQuery());
        return TypedResults.Ok(result);
    }
}
