import { useRef, useState } from 'react'
import Card from './Card.jsx'

export default function Row({ row, onPlay }) {
  const trackRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateArrows = () => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }

  const scrollBy = (dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: 'smooth' })
  }

  if (!row.items.length) return null

  return (
    <section className="row">
      {row.title && <h2 className="section-title">{row.title}</h2>}

      <div className="row__wrap">
        <button
          className={`row__arrow row__arrow--left ${atStart ? 'is-hidden' : ''}`}
          onClick={() => scrollBy(-1)}
          aria-label="Anterior"
        >
          ‹
        </button>

        <div className="row__track" ref={trackRef} onScroll={updateArrows}>
          {row.items.map((channel) => (
            <Card key={channel.id} channel={channel} onPlay={onPlay} />
          ))}
        </div>

        <button
          className={`row__arrow row__arrow--right ${atEnd ? 'is-hidden' : ''}`}
          onClick={() => scrollBy(1)}
          aria-label="Próximo"
        >
          ›
        </button>
      </div>
    </section>
  )
}
