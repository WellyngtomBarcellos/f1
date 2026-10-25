import { useEffect, useMemo, useState } from 'react'
import {
  fetchChannels,
  fetchCounts,
  buildRows,
  pickFeatured,
  COUNTS_POLL_MS,
} from './api/channels.js'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Row from './components/Row.jsx'
import PlayerModal from './components/PlayerModal.jsx'
import Skeleton from './components/Skeleton.jsx'

export default function App() {
  const [channels, setChannels] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [playing, setPlaying] = useState(null)
  const [featured, setFeatured] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    let timer

    const pollCounts = async () => {
      const data = await fetchCounts(controller.signal)
      if (!active) return
      setCounts(data)
      timer = setTimeout(pollCounts, COUNTS_POLL_MS)
    }

    setLoading(true)
    fetchChannels(controller.signal)
      .then((data) => {
        if (!active) return
        setChannels(data)
        setFeatured(pickFeatured(data))
        setError(null)
      })
      .catch((err) => {
        if (active && err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => active && setLoading(false))

    pollCounts()

    return () => {
      active = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [])

  const list = useMemo(
    () => channels.map((c) => ({ ...c, viewers: counts[c.id] ?? 0 })),
    [channels, counts],
  )

  const rows = useMemo(() => buildRows(list), [list])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [list, query])

  const onlineCount = list.filter((c) => c.status === 'online').length
  const totalViewers = list.reduce((sum, c) => sum + c.viewers, 0)
  const featuredLive = featured ? { ...featured, viewers: counts[featured.id] ?? 0 } : null

  return (
    <div className="app">
      <Header
        query={query}
        onQuery={setQuery}
        onlineCount={onlineCount}
        totalViewers={totalViewers}
      />

      {loading && (
        <main className="page">
          <Skeleton />
        </main>
      )}

      {!loading && error && (
        <main className="page state">
          <h2>Não foi possível carregar os canais</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </main>
      )}

      {!loading && !error && (
        <main className="page">
          {filtered ? (
            <section className="search-result">
              <h2 className="section-title">
                Resultados para “{query}” ({filtered.length})
              </h2>
              <Row row={{ id: 'search', title: '', items: filtered }} onPlay={setPlaying} />
              {filtered.length === 0 && (
                <p className="empty">Nenhum canal encontrado. Tente “F1”, “Sky” ou “ESPN”.</p>
              )}
            </section>
          ) : (
            <>
              <Hero channel={featuredLive} onPlay={setPlaying} />
              <div className="rows">
                {rows.map((row) => (
                  <Row key={row.id} row={row} onPlay={setPlaying} />
                ))}
              </div>
            </>
          )}
        </main>
      )}

      {playing && (
        <PlayerModal
          channel={{ ...playing, viewers: counts[playing.id] ?? 0 }}
          onClose={() => setPlaying(null)}
        />
      )}
    </div>
  )
}
