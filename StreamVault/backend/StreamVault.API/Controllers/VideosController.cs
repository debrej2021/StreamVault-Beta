using Microsoft.AspNetCore.Mvc;
using StreamVault.API.Services;

namespace StreamVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class VideosController : ControllerBase
{
    private readonly IYouTubeApiService _youtube;
    private readonly ILogger<VideosController> _logger;

    public VideosController(IYouTubeApiService youtube, ILogger<VideosController> logger)
    {
        _youtube = youtube;
        _logger = logger;
    }

    // GET /api/videos/search?q=react+vite&maxResults=20&pageToken=...&regionCode=IN
    [HttpGet("search")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Search(
        [FromQuery] string q,
        [FromQuery] int maxResults = 20,
        [FromQuery] string? pageToken = null,
        [FromQuery] string regionCode = "IN")
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { error = "Search query 'q' is required." });

        if (maxResults is < 1 or > 50)
            return BadRequest(new { error = "maxResults must be between 1 and 50." });

        var result = await _youtube.SearchAsync(q.Trim(), maxResults, pageToken, regionCode);
        return Ok(result);
    }

    // GET /api/videos/{id}
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var video = await _youtube.GetVideoAsync(id);
        if (video is null) return NotFound(new { error = $"Video '{id}' not found." });
        return Ok(video);
    }

    // GET /api/videos/trending?regionCode=IN&maxResults=24
    [HttpGet("trending")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Trending(
        [FromQuery] string regionCode = "IN",
        [FromQuery] int maxResults = 24)
    {
        var result = await _youtube.GetTrendingAsync(regionCode, maxResults);
        return Ok(result);
    }

    // GET /api/videos/batch?ids=id1,id2,id3
    [HttpGet("batch")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Batch([FromQuery] string ids)
    {
        if (string.IsNullOrWhiteSpace(ids))
            return BadRequest(new { error = "Provide comma-separated video IDs." });

        var idList = ids.Split(',', StringSplitOptions.RemoveEmptyEntries);

        if (idList.Length > 50)
            return BadRequest(new { error = "Maximum 50 IDs per batch request." });

        var videos = await _youtube.GetVideosByIdsAsync(idList);
        return Ok(videos);
    }
}
