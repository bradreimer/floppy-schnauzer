// Copyright (c) 2026 Brad Reimer. Licensed under the MIT License.

namespace FloppySchnauzer.Api.Tests;

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;

/// <summary>Serves a made-up build from a temporary web root, the way the image serves the real one.</summary>
public sealed class StaticFilesTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    private const string Script = "console.log('floppy schnauzer');\n";
    private readonly string webRoot = Directory.CreateTempSubdirectory("floppy-wwwroot-").FullName;
    private readonly WebApplicationFactory<Program> factory;

    public StaticFilesTests(WebApplicationFactory<Program> factory)
    {
        File.WriteAllText(Path.Combine(this.webRoot, "index.html"), "<!doctype html><title>Floppy Schnauzer</title>");
        Directory.CreateDirectory(Path.Combine(this.webRoot, "assets"));
        File.WriteAllText(Path.Combine(this.webRoot, "assets", "index-AbC123.js"), string.Concat(Enumerable.Repeat(Script, 50)));
        this.factory = factory.WithWebHostBuilder(host => host.UseWebRoot(this.webRoot));
    }

    [Theory]
    [InlineData("/assets/index-AbC123.js", "public, max-age=31536000, immutable")]
    [InlineData("/index.html", "no-cache")]
    [InlineData("/", "no-cache")]
    public async Task Sets_cache_control_by_path(string path, string expected)
    {
        using HttpClient client = this.factory.CreateClient();

        using HttpResponseMessage response = await client.GetAsync(new Uri(path, UriKind.Relative));

        response.EnsureSuccessStatusCode();
        Assert.Equal(expected, response.Headers.CacheControl?.ToString());
    }

    [Theory]
    [InlineData("br")]
    [InlineData("gzip")]
    public async Task Compresses_javascript_when_the_browser_accepts_it(string encoding)
    {
        using HttpClient client = this.factory.CreateClient();
        using HttpRequestMessage request = new(HttpMethod.Get, "/assets/index-AbC123.js");
        request.Headers.AcceptEncoding.ParseAdd(encoding);

        using HttpResponseMessage response = await client.SendAsync(request);

        response.EnsureSuccessStatusCode();
        Assert.Equal([encoding], response.Content.Headers.ContentEncoding);
        long compressed = (await response.Content.ReadAsByteArrayAsync()).LongLength;
        Assert.True(compressed < Script.Length * 50 / 4, $"{compressed} bytes isn't much smaller than {Script.Length * 50}");
    }

    [Fact]
    public void Chooses_immutable_only_under_assets()
    {
        Assert.Equal(CachePolicy.Immutable, CachePolicy.For(new PathString("/assets/x.png")));
        Assert.Equal(CachePolicy.Revalidate, CachePolicy.For(new PathString("/assets-old/x.png")));
        Assert.Equal(CachePolicy.Revalidate, CachePolicy.For(new PathString("/index.html")));
    }

    public void Dispose()
    {
        this.factory.Dispose();
        Directory.Delete(this.webRoot, recursive: true);
    }
}
