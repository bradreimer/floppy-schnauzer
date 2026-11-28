// Copyright (c) 2026 Brad Reimer. Licensed under the MIT License.

using FloppySchnauzer.Api;
using Microsoft.Net.Http.Headers;

// "dotnet FloppySchnauzer.Api.dll healthcheck" checks the running server and exits, for Docker.
if (args is [HealthCheck.Command])
{
    return await HealthCheck.RunLocalAsync().ConfigureAwait(false);
}

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Brotli, then gzip, for text such as HTML, JavaScript, CSS, and JSON. Images and sounds are
// already compressed, so they're sent as they are.
builder.Services.AddResponseCompression(options => options.EnableForHttps = true);

WebApplication app = builder.Build();

app.UseResponseCompression();
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
        context.Context.Response.Headers[HeaderNames.CacheControl] = CachePolicy.For(context.Context.Request.Path),
});

// The version comes from the image: 0.6.0 for a release, edge-<commit> from main, dev otherwise.
string version = Environment.GetEnvironmentVariable("FLOPPY_SCHNAUZER_VERSION") ?? "dev";
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", version }));

await app.RunAsync().ConfigureAwait(false);
return 0;
