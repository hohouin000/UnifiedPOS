using UnifiedPOS.Application.WeatherForecasts.Queries.GetWeatherForecasts;

namespace UnifiedPOS.Web.Endpoints;

public class WeatherForecasts : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/weatherforecasts", async (ISender sender) =>
        {
            var forecasts = await sender.Send(new GetWeatherForecastsQuery());
            return Results.Ok(forecasts);
        }).RequireAuthorization();
    }
}
