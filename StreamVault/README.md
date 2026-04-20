# 🎬 StreamVault — Phase 1 MVP

A YouTube-powered video discovery platform built with React + Vite (frontend)
and .NET 10 Web API (backend). This is Phase 1 of a longer journey.

```
┌─────────────────┐        ┌──────────────────────┐        ┌─────────────────┐
│  React + Vite   │ ──────▶│  .NET 10 Web API     │ ──────▶│  YouTube API v3 │
│  localhost:5173 │  /api  │  localhost:7001       │  HTTPS │  googleapis.com │
└─────────────────┘        └──────────────────────┘        └─────────────────┘
        ▲                           │
        │                           │ In-Memory Cache
        │                    (Redis in Phase 2)
        └───────────────────────────┘
```

---

## ✅ Prerequisites

| Tool           | Version  | Check with         |
|----------------|----------|--------------------|
| .NET SDK       | 10.0+    | `dotnet --version` |
| Node.js        | 20+      | `node --version`   |
| Git            | any      | `git --version`    |

---

## 🔑 Step 1 — Get a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → name it "StreamVault"
3. Go to **APIs & Services → Library**
4. Search **"YouTube Data API v3"** → Enable it
5. Go to **APIs & Services → Credentials → Create Credentials → API Key**
6. Copy the key — it looks like `AIzaSy...`

> **Quota:** You get 10,000 units/day free. Search = 100 units, video detail = 1 unit.
> The backend caches aggressively so you won't burn through it quickly.

---

## 🚀 Step 2 — Run the Backend

```bash
cd backend/StreamVault.API

# Set your API key using .NET User Secrets (never commit it!)
dotnet user-secrets init
dotnet user-secrets set "YouTube:ApiKey" "AIzaSy_YOUR_KEY_HERE"

# Restore + run
dotnet restore
dotnet run
```

The API will start at:
- `https://localhost:7001` (HTTPS)
- `http://localhost:5001` (HTTP)

Test it: [https://localhost:7001/swagger](https://localhost:7001/swagger)

Try these endpoints in Swagger:
```
GET /api/videos/trending?regionCode=IN
GET /api/videos/search?q=react+tutorial
GET /api/videos/{videoId}
```

---

## 🎨 Step 3 — Run the Frontend

```bash
cd frontend

npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see the trending feed!

> Vite proxies all `/api` requests to the .NET backend, so no CORS issues in dev.

---

## 📁 Project Structure

```
StreamVault/
├── backend/
│   └── StreamVault.API/
│       ├── Controllers/
│       │   ├── VideosController.cs    # search, detail, trending, batch
│       │   └── ChannelsController.cs  # channel info + videos
│       ├── Services/
│       │   └── YouTubeApiService.cs   # YouTube API wrapper + caching
│       ├── Models/
│       │   ├── Dtos.cs                # frontend-facing DTOs
│       │   └── YouTubeResponses.cs    # raw Google API shapes
│       └── Program.cs                 # minimal API setup, CORS, services
│
└── frontend/
    └── src/
        ├── api/
        │   └── youtube.ts             # typed API client
        ├── hooks/
        │   └── useYouTube.ts          # React Query hooks
        ├── components/
        │   ├── Navbar.tsx             # search + logo
        │   └── VideoCard.tsx          # thumbnail card + skeleton
        ├── pages/
        │   ├── Home.tsx               # trending feed + region filter
        │   ├── Watch.tsx              # video player page
        │   └── Search.tsx             # search results
        ├── types/
        │   └── index.ts               # TypeScript types mirroring DTOs
        └── styles/
            └── globals.css            # CSS variables, theme, animations
```

---

## 🗺️ Roadmap

| Phase | What                                         | Status |
|-------|----------------------------------------------|--------|
| 1     | Trending feed, search, embedded player       | ✅ You are here |
| 2     | Auth (JWT), user accounts, saved videos      | 🔜 |
| 3     | Playlists, watch history, recommendations    | 🔜 |
| 4     | Social (follows, comments), notifications    | 🔜 |
| 5     | Own video uploads (Azure Blob + Media Svc)   | 🔜 |

---

## ⚡ Quota Tips

The backend is designed to protect your quota:

- **Search** (100 units) — results cached for 15 min. Debounce in frontend (400ms).
- **Video detail** (1 unit) — cached 30 min per video.
- **Trending** (1 unit × 24 videos) — cached 60 min.
- **Batch fetch** — always prefer `/api/videos/batch?ids=...` over N individual calls.

At comfortable usage, 10,000 units ≈ ~80 searches + unlimited video views per day.

---

## 🐛 Common Issues

**"YouTube API key not configured"**
→ Run `dotnet user-secrets set "YouTube:ApiKey" "AIza..."` in the API folder.

**HTTPS certificate error in dev**
→ Run `dotnet dev-certs https --trust` once.

**Vite can't reach backend**
→ Make sure the .NET app is running first, then `npm run dev`.

**Authorize button missing in Swagger**
→ Not needed for Phase 1 — API key is server-side only. See Phase 2 for JWT.
