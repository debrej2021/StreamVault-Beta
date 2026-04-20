import { useState } from 'react'
import { useTrending } from '@/hooks/useYouTube'
import { VideoCard, VideoCardSkeleton } from '@/components/VideoCard'

const REGIONS = [
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'US', label: '🇺🇸 US' },
  { code: 'GB', label: '🇬🇧 UK' },
  { code: 'JP', label: '🇯🇵 Japan' },
  { code: 'KR', label: '🇰🇷 Korea' },
  { code: 'AU', label: '🇦🇺 Australia' },
]

export function Home() {
  const [region, setRegion] = useState('IN')
  const { data, isLoading, isError } = useTrending(region)

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Hero Text ─────────────────────────────────────────────── */}
      <div className="mb-8 animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Trending Now
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          What the world is watching right now
        </p>
      </div>

      {/* ── Region Pills ──────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-8 animate-fade-up-delay-1">
        {REGIONS.map(r => (
          <button
            key={r.code}
            onClick={() => setRegion(r.code)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              background: region === r.code ? 'var(--accent)' : 'var(--bg-card)',
              color: region === r.code ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${region === r.code ? 'var(--accent)' : 'var(--border)'}`,
              boxShadow: region === r.code ? '0 0 12px var(--accent-glow)' : 'none',
              fontFamily: 'var(--font-display)',
            }}>
            {r.label}
          </button>
        ))}
      </div>

      {/* ── Error State ───────────────────────────────────────────── */}
      {isError && (
        <div className="rounded-2xl p-8 text-center"
             style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-lg mb-2" style={{ color: 'var(--accent-warm)' }}>⚠️ Something went wrong</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Check your API key in <code style={{ color: 'var(--accent)' }}>appsettings.json</code> and try again.
          </p>
        </div>
      )}

      {/* ── Video Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 24 }).map((_, i) => <VideoCardSkeleton key={i} />)
          : data?.videos.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
            ))
        }
      </div>
    </main>
  )
}
