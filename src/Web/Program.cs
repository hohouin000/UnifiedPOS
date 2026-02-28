using UnifiedPOS.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Configure file logging — use data/logs (data folder is writable, unlike Program Files root)
var logPath = Path.Combine(AppContext.BaseDirectory, "data", "logs");
Directory.CreateDirectory(logPath);
builder.Logging.AddFile(opts =>
{
    opts.FileName = "unifiedpos-";
    opts.LogDirectory = logPath;
    opts.RetainedFileCountLimit = 30;
});

// Add services to the container.
builder.AddKeyVaultIfConfigured();
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
await app.InitialiseDatabaseAsync();

if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHealthChecks("/health");
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseSwaggerUi(settings =>
{
    settings.Path = "/api";
    settings.DocumentPath = "/api/specification.json";
});

app.MapRazorPages();

app.MapFallbackToFile("index.html");

app.UseExceptionHandler(options => { });


app.MapEndpoints();

app.Run();

public partial class Program { }
