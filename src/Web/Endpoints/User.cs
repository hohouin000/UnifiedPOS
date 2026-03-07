namespace UnifiedPOS.Web.Endpoints;

public class User : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/User", (HttpContext context) =>
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                return Results.Ok(new UserDto
                {
                    UserName = context.User.Identity.Name ?? "",
                    Email = context.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? ""
                });
            }
            return Results.Unauthorized();
        });
    }
}

public record UserDto
{
    public required string UserName { get; init; }
    public string? Email { get; init; }
}
