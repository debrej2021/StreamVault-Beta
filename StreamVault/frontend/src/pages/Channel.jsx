import { useParams } from 'react-router-dom'
import { useChannel, useChannelVideos } from '@/hooks/useYouTube'
import { VideoCard, VideoCardSkeleton } from '@/components/VideoCard'

export function Channel() {
  const { id } = useParams()                                        // ← removed <{ id: string }>
  const { data: channel, isLoading: loadingChannel } = useChannel(id ?? '')
  const { data: videos, isLoading: loadingVideos } = useChannelVideos(id ?? '')

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Channel Header ───────────────────────────── */}
      {loadingChannel ? (
        <div className="flex items-center gap-4 mb-10">
          <div className="skeleton w-20 h-20 rounded-full" />
          <div>
            <div className="skeleton h-7 w-48 mb-2" />
            <div className="skeleton h-4 w-32" />
          </div>
        </div>
      ) : channel ? (
        <div className="flex items-center gap-5 mb-10 animate-fade-up">
          <img
            src={channel.thumbnailUrl}
            alt={channel.title}
            className="w-20 h-20 rounded-full object-cover ring-2"
            style={{ ringColor: 'var(--accent)' }}
          />
          <div>
            <h1 className="text-2xl font-bold mb-1"
                style={{ fontFamily: 'var(--font-display)' }}>
              {channel.title}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {channel.subscriberCountFormatted}
            </p>
            {channel.description && (
              <p className="text-xs mt-1 line-clamp-2 max-w-xl"
                 style={{ color: 'var(--text-dim)' }}>
                {channel.description}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* ── Videos Grid ──────────────────────────────── */}
      <h2 className="text-lg font-semibold mb-6"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
        Latest Videos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loadingVideos
          ? Array.from({ length: 12 }).map((_, i) => <VideoCardSkeleton key={i} />)
          : videos?.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
            ))
        }
      </div>
    </main>
  )
}