import { useParams, Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useVideo, useChannel, useTrending } from '@/hooks/useYouTube'
import { VideoCard, VideoCardSkeleton } from '@/components/VideoCard'

export function Watch() {
  const { id } = useParams()                                        // ← removed <{ id: string }>
  const { data: video, isLoading } = useVideo(id ?? '')
  const { data: channel } = useChannel(video?.channelId ?? '')
  const { data: trending } = useTrending('IN', 12)

  if (isLoading) return <WatchSkeleton />
  if (!video) return <VideoNotFound />

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col xl:flex-row gap-6">

        {/* ── Left: Player + Info ───────────────────────────────────── */}
        <div className="flex-1 min-w-0 animate-fade-up">

          {/* Player */}
          <div className="rounded-2xl overflow-hidden mb-4"
               style={{ aspectRatio: '16/9', background: '#000' }}>
            <iframe
              src={video.embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold mb-3 leading-snug"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {video.title}
          </h1>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4"
               style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {video.viewCountFormatted}
              </span>
              <span style={{ color: 'var(--text-dim)' }}>·</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
              </span>
              {video.definition === 'HD' && (
                <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ background: 'var(--bg-hover)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                  HD
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <StatBadge icon="👍" value={video.likeCountFormatted} />
              <StatBadge icon="💬" value={video.commentCount?.toLocaleString() ?? '—'} />
            </div>
          </div>

          {/* Channel */}
          <div className="flex items-center gap-3 mb-4">
            {channel?.thumbnailUrl && (
              <img src={channel.thumbnailUrl} alt={channel.title}
                   className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                {video.channelTitle}
              </p>
              {channel && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {channel.subscriberCountFormatted}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div className="rounded-xl p-4 text-sm leading-relaxed"
                 style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <p className="line-clamp-3">{video.description}</p>
            </div>
          )}

          {/* Tags */}
          {video.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {video.tags.slice(0, 8).map(tag => (
                <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}
                      className="text-xs px-2.5 py-1 rounded-full transition-colors duration-200"
                      style={{
                        background: 'var(--bg-card)',
                        color: 'var(--accent)',
                        border: '1px solid var(--border)'
                      }}>
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Related Videos ─────────────────────────────────── */}
        <aside className="xl:w-80 flex-shrink-0 animate-fade-up-delay-1">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}>
            Up Next
          </h2>
          <div className="flex flex-col gap-4">
            {trending?.videos
              .filter(v => v.id !== id)
              .slice(0, 10)
              .map((v, i) => (
                <VideoCard key={v.id} video={v} index={i} />
              ))
            }
          </div>
        </aside>
      </div>
    </main>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function StatBadge({ icon, value }) {                               // ← removed : { icon: string; value: string }
  return (
    <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl"
          style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
      {icon} {value}
    </span>
  )
}

function WatchSkeleton() {
  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="skeleton rounded-2xl mb-4" style={{ aspectRatio: '16/9' }} />
      <div className="skeleton h-7 w-3/4 mb-3" />
      <div className="skeleton h-4 w-1/2 mb-4" />
    </main>
  )
}

function VideoNotFound() {
  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">📭</p>
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Video not found</h2>
      <Link to="/" className="text-sm" style={{ color: 'var(--accent)' }}>← Back to home</Link>
    </main>
  )
}