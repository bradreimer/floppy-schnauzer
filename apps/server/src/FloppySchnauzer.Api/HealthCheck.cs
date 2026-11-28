// Copyright (c) 2026 Brad Reimer. Licensed under the MIT License.

namespace FloppySchnauzer.Api;

using System.Net.Http.Json;

/// <summary>
/// The command that Docker's HEALTHCHECK runs: <c>dotnet FloppySchnauzer.Api.dll healthcheck</c>.
/// The runtime image has no curl or wget, so the server checks itself over HTTP.
/// </summary>
public static class HealthCheck
{
    /// <summary>The command-line argument that runs the health check instead of the server.</summary>
    public const string Command = "healthcheck";

    /// <summary>
    /// Requests <c>/api/health</c> and returns the process exit code: 0 when the server answers 200
    /// with status "ok", and 1 for any other answer, an error, or a timeout.
    /// </summary>
    /// <param name="client">A client whose base address is the server to check.</param>
    /// <returns>0 when healthy, else 1.</returns>
    public static async Task<int> RunAsync(HttpClient client)
    {
        ArgumentNullException.ThrowIfNull(client);
        try
        {
            using HttpResponseMessage response = await client
                .GetAsync(new Uri("/api/health", UriKind.Relative))
                .ConfigureAwait(false);
            if (!response.IsSuccessStatusCode)
            {
                return 1;
            }

            HealthStatus? body = await response.Content.ReadFromJsonAsync<HealthStatus>().ConfigureAwait(false);
            return body?.Status == "ok" ? 0 : 1;
        }
        catch (HttpRequestException)
        {
            return 1;
        }
        catch (TaskCanceledException)
        {
            return 1;
        }
    }

    /// <summary>
    /// Checks the server in this container, on the port in <c>ASPNETCORE_HTTP_PORTS</c> (8080 by
    /// default), with a 5-second timeout.
    /// </summary>
    /// <returns>0 when healthy, else 1.</returns>
    public static async Task<int> RunLocalAsync()
    {
        string port = Environment.GetEnvironmentVariable("ASPNETCORE_HTTP_PORTS")?.Split(';')[0] ?? "8080";
        using HttpClient client = new() { BaseAddress = new Uri($"http://localhost:{port}"), Timeout = TimeSpan.FromSeconds(5) };
        return await RunAsync(client).ConfigureAwait(false);
    }

    private sealed record HealthStatus(string Status);
}
