// Copyright (c) 2026 Brad Reimer. Licensed under the MIT License.

namespace FloppySchnauzer.Api;

using Microsoft.AspNetCore.Http;

/// <summary>
/// Chooses the <c>Cache-Control</c> header for each static file. Vite names every built asset with a
/// hash of its content, such as <c>/assets/ground-BG9dQJ6B.png</c>, so a file under
/// <c>/assets/</c> never changes under the same name and can be cached for a year. Everything else,
/// above all <c>index.html</c>, which names the current assets, must be checked on every visit.
/// </summary>
public static class CachePolicy
{
    /// <summary>The header for content-hashed files under <c>/assets/</c>.</summary>
    public const string Immutable = "public, max-age=31536000, immutable";

    /// <summary>The header for every other file: the browser checks with the server before using it.</summary>
    public const string Revalidate = "no-cache";

    /// <summary>Returns the <c>Cache-Control</c> header for a request path.</summary>
    /// <param name="path">The request path, such as <c>/assets/index-DRbWQqVI.js</c>.</param>
    /// <returns><see cref="Immutable"/> for <c>/assets/</c>, else <see cref="Revalidate"/>.</returns>
    public static string For(PathString path) =>
        path.StartsWithSegments("/assets", StringComparison.Ordinal) ? Immutable : Revalidate;
}
