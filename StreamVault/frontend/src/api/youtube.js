const BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error?.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const youtubeApi = {
  search: (query, maxResults = 20, pageToken, regionCode = 'IN') => {
    const params = new URLSearchParams({ q: query, maxResults: String(maxResults), regionCode })
    if (pageToken) params.set('pageToken', pageToken)
    return get(`/videos/search?${params}`)
  },

  getVideo: (id) => get(`/videos/${id}`),

  getTrending: (regionCode = 'IN', maxResults = 24) =>
    get(`/videos/trending?regionCode=${regionCode}&maxResults=${maxResults}`),

  batchVideos: (ids) => get(`/videos/batch?ids=${ids.join(',')}`),

  getChannel: (id) => get(`/channels/${id}`),

  getChannelVideos: (id, maxResults = 20) =>
    get(`/channels/${id}/videos?maxResults=${maxResults}`),
}