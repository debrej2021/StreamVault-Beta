namespace StreamVault.API.Models;

// ─── DTOs returned to the React frontend ─────────────────────────────────────
// These are intentionally flat and frontend-friendly.
// The backend does all the mapping — frontend never sees raw YouTube shapes.

public record VideoSummaryDto(
    string Id,
    string Title,
    string? Description,
    string ChannelId,
    string ChannelTitle,
    DateTime PublishedAt,
    string ThumbnailUrl,           // always the best available resolution
    string? Duration,              // human-readable: "4:13"
    long ViewCount,
    long LikeCount,
    string ViewCountFormatted,     // "1.2M views"
    bool IsLive
);

public record VideoDetailDto(
    string Id,
    string Title,
    string? Description,
    string ChannelId,
    string ChannelTitle,
    DateTime PublishedAt,
    string ThumbnailUrl,
    string? Duration,
    long ViewCount,
    long LikeCount,
    long CommentCount,
    string ViewCountFormatted,
    string LikeCountFormatted,
    List<string> Tags,
    string? CategoryId,
    string Definition,             // "HD" / "SD"
    bool IsLive,
    // Embed URL — use this in the IFrame player
    string EmbedUrl
);

public record ChannelSummaryDto(
    string Id,
    string Title,
    string? Description,
    string ThumbnailUrl,
    long SubscriberCount,
    string SubscriberCountFormatted,
    long VideoCount
);

public record SearchResultsDto(
    List<VideoSummaryDto> Videos,
    int TotalResults,
    string? NextPageToken,
    string? PrevPageToken,
    string Query
);

public record TrendingDto(
    List<VideoSummaryDto> Videos,
    string RegionCode,
    DateTime FetchedAt
);
