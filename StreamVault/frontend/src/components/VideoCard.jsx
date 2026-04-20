import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

// ← removed: import type { VideoSummary } from '@/types'
// ← removed: interface Props { ... }

export function VideoCard({ video, index = 0 }) {  // ← removed ": Props"
  const delay = Math.min(index * 50, 400)

  return (
    <Link
      to={`/watch/${video.id}`}
      className="group block"
      style={{ animationDelay: `${delay}ms`, opacity: 0, animation: `fadeUp 0.4s ease ${delay}ms forwards` }}
    >
      {/* ── Thumbnail ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl mb-3"
           style={{ aspectRatio: '16/9', background: 'var(--bg-card)' }}>
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Duration badge */}
        {video.duration && !video.isLive && (
          <span className="absolute bottom-2 right-2 text-xs font-medium px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(0,0,0,0.85)', color: '#fff', fontFamily: 'var(--font-display)' }}>
            {video.duration}
          </span>
        )}

        {/* Live badge */}
        {video.isLive && (
          <span className="absolute bottom-2 right-2 text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: 'var(--accent-warm)', color: '#fff', letterSpacing: '0.05em' }}>
            ● LIVE
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300
                        flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300
                          w-12 h-12 rounded-full flex items-center justify-center"
               style={{ background: 'rgba(108,99,255,0.9)' }}>
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.8L16 10 6.3 17.2V2.8z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Meta ──────────────────────────────────────────────────────── */}
      <div>
        <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2 group-hover:text-white
                       transition-colors duration-200"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {video.title}
        </h3>

        <Link
          to={`/channel/${video.channelId}`}
          onClick={e => e.stopPropagation()}
          className="text-xs mb-0.5 line-clamp-1 hover:underline block"
          style={{ color: 'var(--text-muted)' }}>
          {video.channelTitle}
        </Link>

        <div className="flex items-center gap-1.5 text-xs"
             style={{ color: 'var(--text-dim)' }}>
          <span>{video.viewCountFormatted}</span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function VideoCardSkeleton() {
  return (
    <div>
      <div className="skeleton rounded-xl mb-3" style={{ aspectRatio: '16/9' }} />
      <div className="skeleton h-4 w-full mb-1.5" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  )
}