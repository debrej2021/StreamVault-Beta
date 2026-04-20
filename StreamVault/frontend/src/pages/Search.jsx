import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearch } from '@/hooks/useYouTube'
import { VideoCard, VideoCardSkeleton } from '@/components/VideoCard'

export function Search() {
  const [searchParams] = useSearchParams()
  const rawQuery = searchParams.get('q') ?? ''

  // Debounce: only trigger React Query after 400ms idle
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery)

  useEffect(() => {
    setDebouncedQuery(rawQuery)                    // reset immediately when URL changes
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 400)
    return () => clearTimeout(timer)
  }, [rawQuery])

  const { data, isLoading, isError, isFetching } = useSearch(debouncedQuery)

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-8 animate-fade-up">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {rawQuery
            ? <>Results for <span style={{ color: 'var(--accent)' }}>"{rawQuery}"</span></>
            : 'Search'}
        </h1>
        {data && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            About {data.totalResults.toLocaleString()} results
            {isFetching && !isLoading && (
              <span className="ml-2" style={{ color: 'var(--text-dim)' }}>· refreshing…</span>
            )}
          </p>
        )}
      </div>

      {/* ── Error ──────────────────────────────────────────────────── */}
      {isError && (
        <div className="rounded-2xl p-8 text-center"
             style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-lg mb-1" style={{ color: 'var(--accent-warm)' }}>⚠️ Search failed</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Try again or check your backend connection.
          </p>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {!isLoading && !isError && data?.videos.length === 0 && (
        <div className="rounded-2xl p-12 text-center"
             style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            No videos found
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Try different keywords or check spelling.
          </p>
        </div>
      )}

      {/* ── Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => <VideoCardSkeleton key={i} />)
          : data?.videos.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
            ))
        }
      </div>
    </main>
  )
}
