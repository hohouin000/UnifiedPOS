using Microsoft.AspNetCore.Identity;
using UnifiedPOS.Domain.Enums;

namespace UnifiedPOS.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public UserRole Role { get; set; } = UserRole.Cashier;
}
