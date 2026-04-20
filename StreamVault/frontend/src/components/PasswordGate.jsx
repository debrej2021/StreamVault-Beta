import { useState } from 'react'

const CORRECT_PASSWORD = 'deba123'   // ← change this
const STORAGE_KEY = 'sv_access'

export function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true'
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input === CORRECT_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setInput('')
    }
  }

  if (unlocked) return children

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'var(--accent)', boxShadow: '0 0 20px var(--accent-glow)' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4l12 6-12 6V4z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display)' }}>
            Stream<span style={{ color: 'var(--accent)' }}>Vault</span>
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
             style={{
               background: 'var(--bg-card)',
               border: '1px solid var(--border)',
               boxShadow: '0 0 40px rgba(108,99,255,0.1)'
             }}>
          <h2 className="text-lg font-bold mb-1 text-center"
              style={{ fontFamily: 'var(--font-display)' }}>
            Private Access
          </h2>
          <p className="text-sm text-center mb-6"
             style={{ color: 'var(--text-muted)' }}>
            Enter the password to continue
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false) }}
              placeholder="Password"
              autoFocus
              className="w-full h-11 px-4 rounded-xl text-sm outline-none mb-3 transition-all duration-200"
              style={{
                background: 'var(--bg-hover)',
                border: `1px solid ${error ? 'var(--accent-warm)' : 'var(--border)'}`,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                animation: shake ? 'shake 0.4s ease' : 'none'
              }}
            />

            {error && (
              <p className="text-xs mb-3 text-center"
                 style={{ color: 'var(--accent-warm)' }}>
                Incorrect password. Try again.
              </p>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 0 20px var(--accent-glow)'
              }}>
              Enter StreamVault
            </button>
          </form>
        </div>

        <p className="text-xs text-center mt-6"
           style={{ color: 'var(--text-dim)' }}>
          Private beta — invite only
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
      `}</style>
    </div>
  )
}