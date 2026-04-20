import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'

export function Navbar() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="sticky top-0 z-50 w-full"
            style={{
              background: 'rgba(9,9,18,0.85)',
              backdropFilter: 'blur(16px)',
              borderBottom: '1px solid var(--border)'
            }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-4">

        {/* ── Logo ─────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--accent)', boxShadow: '0 0 12px var(--accent-glow)' }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4l12 6-12 6V4z"/>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:block"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Stream<span style={{ color: 'var(--accent)' }}>Vault</span>
          </span>
        </Link>

        {/* ── Search ───────────────────────────────────────────────── */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search videos, channels..."
              className="w-full h-10 pl-4 pr-12 text-sm rounded-xl outline-none transition-all duration-300"
              style={{
                background: focused ? 'var(--bg-hover)' : 'var(--bg-card)',
                border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
                boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button
              type="submit"
              className="absolute right-3 p-1 rounded-lg transition-colors duration-200"
              style={{ color: focused ? 'var(--accent)' : 'var(--text-muted)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
                   viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </form>

        {/* ── Right Nav ────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 ml-auto">
          <Link to="/"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                           transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12l9-9 9 9M5 10v9h5v-5h4v5h5v-9"/>
            </svg>
            Home
          </Link>
        </nav>
      </div>
    </header>
  )
}