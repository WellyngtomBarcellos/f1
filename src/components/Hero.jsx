import { formatViewers } from '../api/channels.js'
import Cover from './Cover.jsx'

export default function Hero({ channel, onPlay }) {
  if (!channel) return null

  const viewers = formatViewers(channel.viewers)

  const subtitle = [
    channel.status === 'online' ? 'AO VIVO' : 'OFFLINE',
    channel.isEmbed ? 'STREAM EMBED' : 'STREAM DIRETO',
    ...channel.tags,
    ...(viewers ? [`${viewers} assistindo`] : []),
  ].join('  •  ')

  return (
    <section className="hero" style={{ '--hero-bg': channel.gradient }}>
      <div className="hero__shade" />

      <div className="hero__poster" aria-hidden="true">
        <Cover channel={channel} className="hero__cover" />
      </div>

      <div className="hero__content">
        <span className="hero__badge">
          <span className="hero__badge-dot" /> Destaque
        </span>
        <h1 className="hero__title">{channel.cleanTitle ?? channel.title}</h1>
        <p className="hero__meta">{subtitle}</p>
        <p className="hero__desc">
          Assista agora neste canal de transmissão. Player integrado, sem instalar nada —
          clique em reproduir para abrir a transmissão direto no navegador.
        </p>
        <div className="hero__actions">
          <button className="btn btn-primary" onClick={() => onPlay(channel)}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path fill="currentColor" d="M8 5v14l11-7L8 5Z" />
            </svg>
            Assistir
          </button>
          <button className="btn btn-ghost" onClick={() => onPlay(channel)}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M11 7h2v2h-2V7Zm0 4h2v6h-2v-6Zm1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"
              />
            </svg>
            Mais informações
          </button>
        </div>
      </div>
    </section>
  )
}
