using Microsoft.AspNetCore.Mvc;
using StreamVault.API.Services;

namespace StreamVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ChannelsController : ControllerBase
{
    private readonly IYouTubeApiService _youtube;

    public ChannelsController(IYouTubeApiService youtube) => _youtube = youtube;

    // GET /api/channels/{id}
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var channel = await _youtube.GetChannelAsync(id);
        if (channel is null) return NotFound(new { error = $"Channel '{id}' not found." });
        return Ok(channel);
    }

    // GET /api/channels/{id}/videos?maxResults=20
    [HttpGet("{id}/videos")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVideos(string id, [FromQuery] int maxResults = 20)
    {
        var videos = await _youtube.GetChannelVideosAsync(id, maxResults);
        return Ok(videos);
    }
}
