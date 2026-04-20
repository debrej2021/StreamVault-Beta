using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;
using StreamVault.API.Models;

namespace StreamVault.API.Services;

public interface IYouTubeApiService
{
    Task<SearchResultsDto> SearchAsync(string query, int maxResults = 20, string? pageToken = null, string? regionCode = "US");
    Task<VideoDetailDto?> GetVideoAsync(string videoId);
    Task<List<VideoSummaryDto>> GetVideosByIdsAsync(IEnumerable<string> videoIds);
    Task<TrendingDto> GetTrendingAsync(string regionCode = "IN", int maxResults = 24);
    Task<ChannelSummaryDto?> GetChannelAsync(string channelId);
    Task<List<VideoSummaryDto>> GetChannelVideosAsync(string channelId, int maxResults = 20);
}

public class YouTubeApiService : IYouTubeApiService
{
    private readonly HttpClient _http;
    private readonly IMemoryCache _cache;
    private readonly ILogger<YouTubeApiService> _logger;
    private readonly string _apiKey;
    private readonly int _defaultMaxResults;
    private readonly int _cacheDuration;
    private readonly int _searchCacheDuration;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public YouTubeApiService(
        HttpClient http,
        IMemoryCache cache,
        ILogger<YouTubeApiService> logger,
        IConfiguration config)
    {
        _http = http;
        _cache = cache;
        _logger = logger;
        _apiKey = config["YouTube:ApiKey"] ?? throw new InvalidOperationException("YouTube API key not configured.");
        _defaultMaxResults = config.GetValue<int>("YouTube:DefaultMaxResults", 20);
        _cacheDuration = config.GetValue<int>("YouTube:CacheDurationMinutes", 30);
        _searchCacheDuration = config.GetValue<int>("YouTube:SearchCacheDurationMinutes", 15);
    }

    // ─── Search ───────────────────────────────────────────────────────────────

    public async Task<SearchResultsDto> SearchAsync(
        string query, int maxResults = 20, string? pageToken = null, string? regionCode = "US")
    {
        var cacheKey = $"search:{query}:{maxResults}:{pageToken}:{regionCode}";

        if (_cache.TryGetValue(cacheKey, out SearchResultsDto? cached) && cached is not null)
            return cached;

        var url = BuildUrl("search", new()
        {
            ["q"] = query,
            ["part"] = "snippet",
            ["type"] = "video",
            ["maxResults"] = maxResults.ToString(),
            ["regionCode"] = regionCode ?? "US",
            ["pageToken"] = pageToken ?? ""
        });

        var searchResponse = await GetAsync<YouTubeSearchResponse>(url);
        if (searchResponse is null) return new([], 0, null, null, query);

        // Enrich with statistics (batch call — 1 quota unit per video, not 100)
        var videoIds = searchResponse.Items
            .Where(i => i.Id.VideoId is not null)
            .Select(i => i.Id.VideoId!)
            .ToList();

        var videoDetails = await GetVideosByIdsAsync(videoIds);
        var detailMap = videoDetails.ToDictionary(v => v.Id);

        var videos = searchResponse.Items
            .Where(i => i.Id.VideoId is not null)
            .Select(i => detailMap.TryGetValue(i.Id.VideoId!, out var detail)
                ? detail
                : MapSearchItemToSummary(i))
            .ToList();

        var result = new SearchResultsDto(
            videos,
            searchResponse.PageInfo.TotalResults,
            searchResponse.NextPageToken,
            searchResponse.PrevPageToken,
            query);

        _cache.Set(cacheKey, result, TimeSpan.FromMinutes(_searchCacheDuration));
        return result;
    }

    // ─── Video Detail ─────────────────────────────────────────────────────────

    public async Task<VideoDetailDto?> GetVideoAsync(string videoId)
    {
        var cacheKey = $"video:{videoId}";

        if (_cache.TryGetValue(cacheKey, out VideoDetailDto? cached) && cached is not null)
            return cached;

        var url = BuildUrl("videos", new()
        {
            ["id"] = videoId,
            ["part"] = "snippet,statistics,contentDetails"
        });

        var response = await GetAsync<YouTubeVideoListResponse>(url);
        var item = response?.Items.FirstOrDefault();
        if (item is null) return null;

        var dto = MapToDetail(item);
        _cache.Set(cacheKey, dto, TimeSpan.FromMinutes(_cacheDuration));
        return dto;
    }

    // ─── Batch Video Fetch ────────────────────────────────────────────────────
    // KEY QUOTA TRICK: fetch multiple video details in ONE API call (1 unit each,
    // not 100 like search). Always prefer this over N individual calls.

    public async Task<List<VideoSummaryDto>> GetVideosByIdsAsync(IEnumerable<string> videoIds)
    {
        var ids = videoIds.Distinct().ToList();
        if (ids.Count == 0) return [];

        // Check cache for each — only fetch uncached ones
        var result = new List<VideoSummaryDto>();
        var uncached = new List<string>();

        foreach (var id in ids)
        {
            if (_cache.TryGetValue($"summary:{id}", out VideoSummaryDto? cached) && cached is not null)
                result.Add(cached);
            else
                uncached.Add(id);
        }

        if (uncached.Count > 0)
        {
            // YouTube allows up to 50 IDs per request
            foreach (var batch in uncached.Chunk(50))
            {
                var url = BuildUrl("videos", new()
                {
                    ["id"] = string.Join(",", batch),
                    ["part"] = "snippet,statistics,contentDetails"
                });

                var response = await GetAsync<YouTubeVideoListResponse>(url);
                if (response?.Items is null) continue;

                foreach (var item in response.Items)
                {
                    var summary = MapToSummary(item);
                    _cache.Set($"summary:{item.Id}", summary, TimeSpan.FromMinutes(_cacheDuration));
                    result.Add(summary);
                }
            }
        }

        return result;
    }

    // ─── Trending ─────────────────────────────────────────────────────────────

    public async Task<TrendingDto> GetTrendingAsync(string regionCode = "IN", int maxResults = 24)
    {
        var cacheKey = $"trending:{regionCode}:{maxResults}";

        if (_cache.TryGetValue(cacheKey, out TrendingDto? cached) && cached is not null)
            return cached;

        var url = BuildUrl("videos", new()
        {
            ["part"] = "snippet,statistics,contentDetails",
            ["chart"] = "mostPopular",
            ["regionCode"] = regionCode,
            ["maxResults"] = maxResults.ToString()
        });

        var response = await GetAsync<YouTubeVideoListResponse>(url);
        var videos = response?.Items.Select(MapToSummary).ToList() ?? [];

        var result = new TrendingDto(videos, regionCode, DateTime.UtcNow);
        _cache.Set(cacheKey, result, TimeSpan.FromMinutes(60)); // trending changes slowly
        return result;
    }

    // ─── Channel ──────────────────────────────────────────────────────────────

    public async Task<ChannelSummaryDto?> GetChannelAsync(string channelId)
    {
        var cacheKey = $"channel:{channelId}";

        if (_cache.TryGetValue(cacheKey, out ChannelSummaryDto? cached) && cached is not null)
            return cached;

        var url = BuildUrl("channels", new()
        {
            ["id"] = channelId,
            ["part"] = "snippet,statistics"
        });

        var response = await GetAsync<YouTubeChannelListResponse>(url);
        var item = response?.Items.FirstOrDefault();
        if (item is null) return null;

        var dto = new ChannelSummaryDto(
            item.Id,
            item.Snippet.Title,
            item.Snippet.Description,
            BestThumbnail(item.Snippet.Thumbnails),
            ParseLong(item.Statistics?.SubscriberCount),
            FormatCount(ParseLong(item.Statistics?.SubscriberCount)) + " subscribers",
            ParseLong(item.Statistics?.ViewCount)  // using ViewCount as fallback for video count
        );

        _cache.Set(cacheKey, dto, TimeSpan.FromHours(2));
        return dto;
    }

    public async Task<List<VideoSummaryDto>> GetChannelVideosAsync(string channelId, int maxResults = 20)
    {
        var cacheKey = $"channel-videos:{channelId}:{maxResults}";
        if (_cache.TryGetValue(cacheKey, out List<VideoSummaryDto>? cached) && cached is not null)
            return cached;

        // Search for videos from this channel
        var url = BuildUrl("search", new()
        {
            ["channelId"] = channelId,
            ["part"] = "snippet",
            ["order"] = "date",
            ["type"] = "video",
            ["maxResults"] = maxResults.ToString()
        });

        var response = await GetAsync<YouTubeSearchResponse>(url);
        if (response is null) return [];

        var ids = response.Items
            .Where(i => i.Id.VideoId is not null)
            .Select(i => i.Id.VideoId!)
            .ToList();

        var result = await GetVideosByIdsAsync(ids);
        _cache.Set(cacheKey, result, TimeSpan.FromMinutes(30));
        return result;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private string BuildUrl(string endpoint, Dictionary<string, string> queryParams)
    {
        var filtered = queryParams
            .Where(kv => !string.IsNullOrEmpty(kv.Value))
            .ToList();

        filtered.Add(new("key", _apiKey));

        var query = string.Join("&", filtered.Select(kv =>
            $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));

        return $"{endpoint}?{query}";
    }

    private async Task<T?> GetAsync<T>(string url)
    {
        try
        {
            var response = await _http.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("YouTube API returned {Status}: {Error}", response.StatusCode, error);
                return default;
            }

            var stream = await response.Content.ReadAsStreamAsync();
            return await JsonSerializer.DeserializeAsync<T>(stream, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "YouTube API call failed for URL: {Url}", url.Replace(_apiKey, "[REDACTED]"));
            return default;
        }
    }

    private static VideoSummaryDto MapToSummary(YouTubeVideoItem item) => new(
        item.Id,
        item.Snippet.Title,
        item.Snippet.Description,
        item.Snippet.ChannelId ?? "",
        item.Snippet.ChannelTitle ?? "",
        item.Snippet.PublishedAt,
        BestThumbnail(item.Snippet.Thumbnails),
        ParseDuration(item.ContentDetails?.Duration),
        ParseLong(item.Statistics?.ViewCount),
        ParseLong(item.Statistics?.LikeCount),
        FormatCount(ParseLong(item.Statistics?.ViewCount)) + " views",
        item.Snippet.LiveBroadcastContent == "live"
    );

    private static VideoDetailDto MapToDetail(YouTubeVideoItem item) => new(
        item.Id,
        item.Snippet.Title,
        item.Snippet.Description,
        item.Snippet.ChannelId ?? "",
        item.Snippet.ChannelTitle ?? "",
        item.Snippet.PublishedAt,
        BestThumbnail(item.Snippet.Thumbnails),
        ParseDuration(item.ContentDetails?.Duration),
        ParseLong(item.Statistics?.ViewCount),
        ParseLong(item.Statistics?.LikeCount),
        ParseLong(item.Statistics?.CommentCount),
        FormatCount(ParseLong(item.Statistics?.ViewCount)) + " views",
        FormatCount(ParseLong(item.Statistics?.LikeCount)),
        item.Snippet.Tags ?? [],
        item.Snippet.CategoryId,
        item.ContentDetails?.Definition?.ToUpper() ?? "SD",
        item.Snippet.LiveBroadcastContent == "live",
        $"https://www.youtube.com/embed/{item.Id}?autoplay=1&rel=0&modestbranding=1"
    );

    private static VideoSummaryDto MapSearchItemToSummary(YouTubeSearchItem item) => new(
        item.Id.VideoId ?? "",
        item.Snippet.Title,
        item.Snippet.Description,
        item.Snippet.ChannelId ?? "",
        item.Snippet.ChannelTitle ?? "",
        item.Snippet.PublishedAt,
        BestThumbnail(item.Snippet.Thumbnails),
        null, 0, 0, "— views", false
    );

    private static string BestThumbnail(YouTubeThumbnails t) =>
        t.Maxres?.Url ?? t.Standard?.Url ?? t.High?.Url ?? t.Medium?.Url ?? t.Default?.Url ?? "";

    private static long ParseLong(string? value) =>
        long.TryParse(value, out var result) ? result : 0;

    // Convert ISO 8601 duration (PT4M13S) to human-readable "4:13"
    private static string? ParseDuration(string? iso)
    {
        if (string.IsNullOrEmpty(iso)) return null;
        var match = Regex.Match(iso, @"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?");
        if (!match.Success) return null;

        var h = int.TryParse(match.Groups[1].Value, out var hh) ? hh : 0;
        var m = int.TryParse(match.Groups[2].Value, out var mm) ? mm : 0;
        var s = int.TryParse(match.Groups[3].Value, out var ss) ? ss : 0;

        return h > 0
            ? $"{h}:{m:D2}:{s:D2}"
            : $"{m}:{s:D2}";
    }

    // 1234567 → "1.2M"
    private static string FormatCount(long count) => count switch
    {
        >= 1_000_000_000 => $"{count / 1_000_000_000.0:0.#}B",
        >= 1_000_000     => $"{count / 1_000_000.0:0.#}M",
        >= 1_000         => $"{count / 1_000.0:0.#}K",
        _                => count.ToString()
    };
}
