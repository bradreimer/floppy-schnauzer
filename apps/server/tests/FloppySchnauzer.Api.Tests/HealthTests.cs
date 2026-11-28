// Copyright (c) 2026 Brad Reimer. Licensed under the MIT License.

namespace FloppySchnauzer.Api.Tests;

using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

public sealed class HealthTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> factory;

    public HealthTests(WebApplicationFactory<Program> factory)
    {
        this.factory = factory;
    }

    [Fact]
    public async Task Health_returns_ok_with_status_ok()
    {
        using HttpClient client = this.factory.CreateClient();

        using HttpResponseMessage response = await client.GetAsync(new Uri("/api/health", UriKind.Relative));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        HealthBody? body = await response.Content.ReadFromJsonAsync<HealthBody>();
        Assert.Equal("ok", body?.Status);

        // Outside the image, FLOPPY_SCHNAUZER_VERSION isn't set, so the version is "dev".
        Assert.Equal(Environment.GetEnvironmentVariable("FLOPPY_SCHNAUZER_VERSION") ?? "dev", body?.Version);
    }

    private sealed record HealthBody(string Status, string Version);
}
