// Copyright (c) 2026 Brad Reimer. Licensed under the MIT License.

namespace FloppySchnauzer.Api.Tests;

using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

public sealed class HealthCheckTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> factory;

    public HealthCheckTests(WebApplicationFactory<Program> factory)
    {
        this.factory = factory;
    }

    [Fact]
    public async Task Returns_0_when_the_server_is_healthy()
    {
        using HttpClient client = this.factory.CreateClient();

        Assert.Equal(0, await HealthCheck.RunAsync(client));
    }

    [Fact]
    public async Task Returns_1_when_nothing_is_listening()
    {
        // Port 1 is reserved and nothing listens on it, so the connection is refused.
        using HttpClient client = new() { BaseAddress = new Uri("http://127.0.0.1:1"), Timeout = TimeSpan.FromSeconds(5) };

        Assert.Equal(1, await HealthCheck.RunAsync(client));
    }

    [Theory]
    [InlineData(HttpStatusCode.ServiceUnavailable, "{\"status\":\"ok\"}")]
    [InlineData(HttpStatusCode.OK, "{\"status\":\"starting\"}")]
    public async Task Returns_1_for_any_other_answer(HttpStatusCode status, string body)
    {
        using HttpClient client = new(new FixedResponse(status, body)) { BaseAddress = new Uri("http://localhost") };

        Assert.Equal(1, await HealthCheck.RunAsync(client));
    }

    private sealed class FixedResponse(HttpStatusCode status, string body) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            Task.FromResult(new HttpResponseMessage(status)
            {
                Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json"),
            });
    }
}
