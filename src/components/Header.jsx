import { useEffect, useState } from 'react'
import { formatViewers } from '../api/channels.js'

export default function Header({ query, onQuery, onlineCount, totalViewers }) {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${solid ? 'header--solid' : ''}`}>
      <div className="header__inner">
        <a className="logo" href="#" onClick={(e) => e.preventDefault()}>
          F1
        </a>

        <nav className="nav">
          <a className="nav__link nav__link--active" href="#" onClick={(e) => e.preventDefault()}>
            Início
          </a>
          <a className="nav__link" href="#" onClick={(e) => e.preventDefault()}>
            Ao vivo
          </a>
          <a className="nav__link" href="#" onClick={(e) => e.preventDefault()}>
            Minha lista
          </a>
        </nav>

        <div className="header__right">
          <div className="search">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
              />
            </svg>
            <input
              type="search"
              placeholder="Canais, F1, Sky..."
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              aria-label="Buscar canais"
            />
          </div>

          <span className="live-pill" title={`${onlineCount} canais online`}>
            <span className="live-pill__dot" />
            {onlineCount} ao vivo
          </span>

          {totalViewers > 0 && (
            <span
              className="viewers-pill"
              title={`${new Intl.NumberFormat('pt-BR').format(totalViewers)} pessoas assistindo agora`}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 5C6.5 5 2.7 9.2 1.5 11.4a1.3 1.3 0 0 0 0 1.2C2.7 14.8 6.5 19 12 19s9.3-4.2 10.5-6.4a1.3 1.3 0 0 0 0-1.2C21.3 9.2 17.5 5 12 5Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6.2a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Z"
                />
              </svg>
              {formatViewers(totalViewers)} assistindo
            </span>
          )}

          <div className="avatar" title="Perfil">
            F1
          </div>
        </div>
      </div>
    </header>
  )
}
