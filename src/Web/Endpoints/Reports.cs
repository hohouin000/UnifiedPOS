using UnifiedPOS.Application.Reports.Queries.GetSalesReport;
using Microsoft.AspNetCore.Http.HttpResults;

namespace UnifiedPOS.Web.Endpoints;

public class Reports : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet("sales", GetSalesReport).RequireAuthorization();
    }

    public async Task<Ok<SalesReportDto>> GetSalesReport(
        ISender sender,
        [AsParameters] GetSalesReportQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }
}
