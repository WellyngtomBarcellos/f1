import { formatViewers } from '../api/channels.js'
import Cover from './Cover.jsx'

export default function Card({ channel, onPlay }) {
  const offline = channel.status === 'offline'
  const viewers = formatViewers(channel.viewers)

  return (
    <article
      className={`card ${offline ? 'card--offline' : ''}`}
      title={channel.title}
      aria-label={`Assistir ${channel.title}`}
      onClick={() => onPlay(channel)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPlay(channel)
        }
      }}
    >
      <div className="card__art" style={{ background: channel.gradient }}>
        <Cover channel={channel} className="card__cover" />

        <span className={`badge ${offline ? 'badge--off' : 'badge--live'}`}>
          {offline ? 'OFFLINE' : 'AO VIVO'}
        </span>

        {viewers && (
          <span className="card__viewers" title={`${viewers} assistindo agora`}>
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 5C6.5 5 2.7 9.2 1.5 11.4a1.3 1.3 0 0 0 0 1.2C2.7 14.8 6.5 19 12 19s9.3-4.2 10.5-6.4a1.3 1.3 0 0 0 0-1.2C21.3 9.2 17.5 5 12 5Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6.2a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Z"
              />
            </svg>
            {viewers}
          </span>
        )}

        <div className="card__overlay">
          <span className="card__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26">
              <path fill="currentColor" d="M8 5v14l11-7L8 5Z" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  )
}
