using UnifiedPOS.Application.Reports.Queries.GetSalesReport;

namespace UnifiedPOS.Web.Endpoints;

public class Reports : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/Reports/sales", async (ISender sender, DateTimeOffset? fromDate, DateTimeOffset? toDate) =>
        {
            var result = await sender.Send(new GetSalesReportQuery { FromDate = fromDate ?? DateTimeOffset.MinValue, ToDate = toDate ?? DateTimeOffset.UtcNow });
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
