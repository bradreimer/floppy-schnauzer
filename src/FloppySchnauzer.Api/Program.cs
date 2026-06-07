WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddRouting();

WebApplication app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.Run();
