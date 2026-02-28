using UnifiedPOS.Application.Common.Interfaces;
using UnifiedPOS.Domain.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace UnifiedPOS.Web.Endpoints;

public class Settings : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetShopSettings, "shop").RequireAuthorization();
        groupBuilder.MapPut(UpdateShopSettings, "shop").RequireAuthorization();
    }

    public async Task<Ok<ShopSettingsDto>> GetShopSettings(IApplicationDbContext context)
    {
        var settings = await context.ShopSettings.FirstOrDefaultAsync();
        
        return TypedResults.Ok(new ShopSettingsDto
        {
            ShopName = settings?.ShopName ?? "My Shop",
            Address = settings?.Address ?? "",
            BusinessWhatsApp = settings?.BusinessWhatsApp ?? ""
        });
    }

    public async Task<Ok<ShopSettingsDto>> UpdateShopSettings(
        IApplicationDbContext context, 
        ShopSettingsDto dto)
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

        return TypedResults.Ok(dto);
    }
}

public record ShopSettingsDto
{
    public string ShopName { get; init; } = "My Shop";
    public string Address { get; init; } = "";
    public string BusinessWhatsApp { get; init; } = "";
}
