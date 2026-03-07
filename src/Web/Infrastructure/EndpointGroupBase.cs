namespace UnifiedPOS.Web.Infrastructure;

public abstract class EndpointGroupBase
{
    public virtual string? GroupName { get; }
    public abstract void Map(IEndpointRouteBuilder app);
}
