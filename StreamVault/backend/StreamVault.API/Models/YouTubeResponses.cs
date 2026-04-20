namespace StreamVault.API.Models;

// ─── Raw YouTube API Responses ────────────────────────────────────────────────

public record YouTubeSearchResponse(
    string Kind,
    string Etag,
    YouTubePageInfo PageInfo,
    string? NextPageToken,
    string? PrevPageToken,
    List<YouTubeSearchItem> Items
);

public record YouTubeSearchItem(
    string Kind,
    string Etag,
    YouTubeSearchItemId Id,
    YouTubeSnippet Snippet
);

public record YouTubeSearchItemId(
    string Kind,
    string? VideoId,
    string? ChannelId,
    string? PlaylistId
);

public record YouTubeVideoListResponse(
    string Kind,
    string Etag,
    YouTubePageInfo PageInfo,
    List<YouTubeVideoItem> Items
);

public record YouTubeVideoItem(
    string Id,
    YouTubeSnippet Snippet,
    YouTubeStatistics? Statistics,
    YouTubeContentDetails? ContentDetails
);

public record YouTubeSnippet(
    string Title,
    string? Description,
    string? ChannelId,
    string? ChannelTitle,
    DateTime PublishedAt,
    YouTubeThumbnails Thumbnails,
    string? CategoryId,
    List<string>? Tags,
    string? LiveBroadcastContent
);

public record YouTubeThumbnails(
    YouTubeThumbnail? Default,
    YouTubeThumbnail? Medium,
    YouTubeThumbnail? High,
    YouTubeThumbnail? Standard,
    YouTubeThumbnail? Maxres
);

public record YouTubeThumbnail(string Url, int? Width, int? Height);

public record YouTubeStatistics(
    string? ViewCount,
    string? LikeCount,
    string? CommentCount,
    string? SubscriberCount
);

public record YouTubeContentDetails(
    string? Duration,     // ISO 8601 e.g. PT4M13S
    string? Definition,   // hd / sd
    string? Caption
);

public record YouTubePageInfo(int TotalResults, int ResultsPerPage);

public record YouTubeChannelListResponse(
    string Kind,
    string Etag,
    YouTubePageInfo PageInfo,
    List<YouTubeChannelItem> Items
);

public record YouTubeChannelItem(
    string Id,
    YouTubeSnippet Snippet,
    YouTubeStatistics? Statistics,
    YouTubeChannelBrandingSettings? BrandingSettings
);

public record YouTubeChannelBrandingSettings(
    YouTubeChannelBranding? Channel
);

public record YouTubeChannelBranding(
    string? Title,
    string? Description,
    string? Keywords,
    string? DefaultLanguage
);
