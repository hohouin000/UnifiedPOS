using UnifiedPOS.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http.HttpResults;

namespace UnifiedPOS.Web.Endpoints;

public class Auth : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapPost(Login, "login");
        groupBuilder.MapPost(Logout, "logout").RequireAuthorization();
        groupBuilder.MapGet(Me, "me");
    }

    public async Task<Results<Ok<LoginResponse>, BadRequest<string>>> Login(
        LoginRequest request,
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.FindByNameAsync(request.Email);
        if (user == null)
        {
            user = await userManager.FindByEmailAsync(request.Email);
        }

        if (user == null)
        {
            return TypedResults.BadRequest("Invalid username or password");
        }

        var result = await signInManager.PasswordSignInAsync(
            user, 
            request.Password, 
            isPersistent: true, 
            lockoutOnFailure: false);

        if (result.Succeeded)
        {
            return TypedResults.Ok(new LoginResponse
            {
                UserName = user.UserName ?? "",
                Email = user.Email ?? "",
                Success = true
            });
        }

        return TypedResults.BadRequest("Invalid username or password");
    }

    public async Task<Ok> Logout(SignInManager<ApplicationUser> signInManager)
    {
        await signInManager.SignOutAsync();
        return TypedResults.Ok();
    }

    public Task<Results<Ok<LoginResponse>, UnauthorizedHttpResult>> Me(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            return Task.FromResult<Results<Ok<LoginResponse>, UnauthorizedHttpResult>>(
                TypedResults.Ok(new LoginResponse
                {
                    UserName = context.User.Identity.Name ?? "",
                    Email = "",
                    Success = true
                })
            );
        }
        
        return Task.FromResult<Results<Ok<LoginResponse>, UnauthorizedHttpResult>>(
            TypedResults.Unauthorized()
        );
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
