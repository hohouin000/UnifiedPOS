using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace UnifiedPOS.Web.Endpoints;

public class User : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetCurrentUser);
    }

    public Task<Results<Ok<UserDto>, UnauthorizedHttpResult>> GetCurrentUser(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            return Task.FromResult<Results<Ok<UserDto>, UnauthorizedHttpResult>>(
                TypedResults.Ok(new UserDto
                {
                    UserName = context.User.Identity.Name ?? "",
                    Email = context.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? ""
                })
            );
        }
        
        return Task.FromResult<Results<Ok<UserDto>, UnauthorizedHttpResult>>(
            TypedResults.Unauthorized()
        );
    }
}

public record UserDto
{
    public required string UserName { get; init; }
    public string? Email { get; init; }
}
