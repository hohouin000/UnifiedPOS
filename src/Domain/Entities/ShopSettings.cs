namespace UnifiedPOS.Domain.Entities;

public class ShopSettings
{
    public int Id { get; set; }
    public string ShopName { get; set; } = "My Shop";
    public string Address { get; set; } = string.Empty;
    public string BusinessWhatsApp { get; set; } = string.Empty;
}
