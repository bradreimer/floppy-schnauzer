// Copyright (c) 2026 Brad Reimer. Licensed under the MIT License.

using FloppySchnauzer.Api;

// "dotnet FloppySchnauzer.Api.dll healthcheck" checks the running server and exits, for Docker.
if (args is [HealthCheck.Command])
{
    return await HealthCheck.RunLocalAsync().ConfigureAwait(false);
}

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

WebApplication app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

await app.RunAsync().ConfigureAwait(false);
return 0;
