using UnifiedPOS.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace UnifiedPOS.Web.Endpoints;

public class Auth : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/Auth/login", async (
            LoginRequest request,
            SignInManager<ApplicationUser> signInManager,
            UserManager<ApplicationUser> userManager) =>
        {
            var user = await userManager.FindByNameAsync(request.Email);
            if (user == null)
            {
                user = await userManager.FindByEmailAsync(request.Email);
            }

            if (user == null)
            {
                return Results.BadRequest("Invalid username or password");
            }

            var result = await signInManager.PasswordSignInAsync(
                user, 
                request.Password, 
                isPersistent: true, 
                lockoutOnFailure: false);

            if (result.Succeeded)
            {
                return Results.Ok(new LoginResponse
                {
                    UserName = user.UserName ?? "",
                    Email = user.Email ?? "",
                    Success = true
                });
            }

            return Results.BadRequest("Invalid username or password");
        });

        app.MapPost("/api/Auth/logout", async (SignInManager<ApplicationUser> signInManager) =>
        {
            await signInManager.SignOutAsync();
            return Results.Ok();
        }).RequireAuthorization();

        app.MapGet("/api/Auth/me", (HttpContext context) =>
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                return Results.Ok(new LoginResponse
                {
                    UserName = context.User.Identity.Name ?? "",
                    Email = "",
                    Success = true
                });
            }
            return Results.Unauthorized();
        });
    }
}

public record LoginRequest
{
    public string Email { get; init; } = "";
    public string Password { get; init; } = "";
}

public record LoginResponse
{
    public string UserName { get; init; } = "";
    public string Email { get; init; } = "";
    public bool Success { get; init; }
}
