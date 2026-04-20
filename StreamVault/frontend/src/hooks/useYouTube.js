import { useQuery } from '@tanstack/react-query'
import { youtubeApi } from '@/api/youtube'

export const queryKeys = {
  trending: (regionCode) => ['trending', regionCode],
  search: (query, regionCode) => ['search', query, regionCode],
  video: (id) => ['video', id],
  channel: (id) => ['channel', id],
  channelVideos: (id) => ['channel-videos', id],
}

export function useTrending(regionCode = 'IN') {
  return useQuery({
    queryKey: queryKeys.trending(regionCode),
    queryFn: () => youtubeApi.getTrending(regionCode, 24),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
  })
}

export function useSearch(query, regionCode = 'IN') {
  return useQuery({
    queryKey: queryKeys.search(query, regionCode),
    queryFn: () => youtubeApi.search(query, 20, undefined, regionCode),
    enabled: query.trim().length > 1,
    staleTime: 1000 * 60 * 15,
  })
}

export function useVideo(id) {
  return useQuery({
    queryKey: queryKeys.video(id),
    queryFn: () => youtubeApi.getVideo(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  })
}

export function useChannel(id) {
  return useQuery({
    queryKey: queryKeys.channel(id),
    queryFn: () => youtubeApi.getChannel(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 2,
  })
}

export function useChannelVideos(id) {
  return useQuery({
    queryKey: queryKeys.channelVideos(id),
    queryFn: () => youtubeApi.getChannelVideos(id, 20),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  })
}