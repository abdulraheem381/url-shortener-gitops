import { useState, useEffect } from 'react'

function App() {
  const [url, setUrl] = useState('')
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links')
      const data = await res.json()
      setLinks(data)
    } catch (err) {
      console.error('Failed to fetch links', err)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      if (!res.ok) throw new Error('Failed to shorten URL')
      setUrl('')
      await fetchLinks()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getShortUrl = (shortId) => {
    return `${window.location.origin}/${shortId}`
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
            ShortHub
          </h1>
          <p className="text-slate-400 text-lg">
            Modern, secure, and lightning-fast URL shortening platform.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="relative group">
              <input
                type="url"
                required
                placeholder="Paste your long URL here..."
                className="w-full bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-slate-500"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <div className="absolute inset-y-0 right-4 flex items-center">
                 {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500"></div>}
              </div>
            </div>
            {error && <p className="text-red-400 text-sm ml-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Shorten URL
            </button>
          </form>
        </div>

        {/* Links List */}
        <div className="space-y-4">
          <h2 className="text-slate-300 font-semibold px-2 mb-4">Recent Shortened Links</h2>
          {links.length === 0 ? (
            <p className="text-slate-500 italic text-center py-8 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">No links shortened yet. Start now!</p>
          ) : (
            links.map((link) => (
              <div
                key={link.id}
                className="group bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between transition-all"
              >
                <div className="flex flex-col truncate mr-4">
                  <span className="text-cyan-400 font-medium truncate mb-1">
                    {getShortUrl(link.id)}
                  </span>
                  <span className="text-slate-500 text-xs truncate max-w-[300px]">
                    {link.url}
                  </span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(getShortUrl(link.id))}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-4 py-2 rounded-xl transition-colors"
                >
                  Copy
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <footer className="mt-16 text-slate-600 text-sm">
        DevOps Project © 2026 • Built with EKS & ArgoCD
      </footer>
    </div>
  )
}

export default App
