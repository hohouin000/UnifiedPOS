using UnifiedPOS.Application.Common.Interfaces;
using UnifiedPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace UnifiedPOS.Web.Endpoints;

public class Settings : EndpointGroupBase
{
    public override void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/settings/shop", async (IApplicationDbContext context) =>
        {
            var settings = await context.ShopSettings.FirstOrDefaultAsync();
            
            return Results.Ok(new ShopSettingsDto
            {
                ShopName = settings?.ShopName ?? "My Shop",
                Address = settings?.Address ?? "",
                BusinessWhatsApp = settings?.BusinessWhatsApp ?? ""
            });
        }).RequireAuthorization();

        app.MapPut("/api/settings/shop", async (IApplicationDbContext context, ShopSettingsDto dto) =>
        {
            var settings = await context.ShopSettings.FirstOrDefaultAsync();
            
            if (settings == null)
            {
                settings = new ShopSettings();
                context.ShopSettings.Add(settings);
            }

            settings.ShopName = dto.ShopName;
            settings.Address = dto.Address;
            settings.BusinessWhatsApp = dto.BusinessWhatsApp;

            await context.SaveChangesAsync(default);

            return Results.Ok(dto);
        }).RequireAuthorization();
    }
}

public record ShopSettingsDto
{
    public string ShopName { get; init; } = "My Shop";
    public string Address { get; init; } = "";
    public string BusinessWhatsApp { get; init; } = "";
}
