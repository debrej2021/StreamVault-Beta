using Scalar.AspNetCore;
using StreamVault.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Services ────────────────────────────────────────────────────────────────

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();

builder.Services.AddHttpClient<IYouTubeApiService, YouTubeApiService>(client =>
{
    client.BaseAddress = new Uri("https://www.googleapis.com/youtube/v3/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("ViteDev", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader());

    options.AddPolicy("Production", policy =>
        policy.WithOrigins(builder.Configuration["AllowedOrigins"]
                           ?.Split(',') ?? [])
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// ─── Pipeline ────────────────────────────────────────────────────────────────

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "StreamVault API";
        options.Theme = ScalarTheme.DeepSpace;
    });
    app.UseCors("ViteDev");
}
else
{
    app.UseCors("Production");
    app.UseHsts();
    app.UseHttpsRedirection();
}


app.UseAuthorization();
app.MapControllers();

app.Run();