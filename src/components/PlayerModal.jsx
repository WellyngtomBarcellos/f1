import { useEffect, useRef, useState } from 'react'
import { formatViewers } from '../api/channels.js'
import Cover from './Cover.jsx'

export default function PlayerModal({ channel, onClose }) {
  const [phase, setPhase] = useState('loading')
  const videoRef = useRef(null)
  const viewers = formatViewers(channel.viewers)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const useEmbed = channel.isEmbed || !channel.isHls

  useEffect(() => {
    if (useEmbed) return
    let hls
    let cancelled = false

    const video = videoRef.current
    if (!video) return

    const start = async () => {
      const { default: Hls } = await import('hls.js')
      if (cancelled || !video) return

      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true })
        hls.loadSource(channel.uri)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!cancelled) {
            setPhase('ready')
            video.play().catch(() => {})
          }
        })
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal && !cancelled) setPhase('error')
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.uri
        video.addEventListener('loadedmetadata', () => {
          if (!cancelled) setPhase('ready')
        })
        video.addEventListener('error', () => !cancelled && setPhase('error'))
      } else {
        setPhase('error')
      }
    }

    start()
    return () => {
      cancelled = true
      if (hls) hls.destroy()
    }
  }, [channel, useEmbed])

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={channel.title}>
      <div className="modal__backdrop" onClick={onClose} />

      <div className="modal__panel">
        <button className="modal__close" onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        <div className="modal__stage">
          {useEmbed ? (
            <iframe
              key={channel.id}
              src={channel.uri}
              title={channel.title}
              className="modal__frame"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="no-referrer"
              onLoad={() => setPhase('ready')}
            />
          ) : (
            <>
              <video ref={videoRef} className="modal__video" controls autoPlay playsInline />
              {phase === 'loading' && <div className="modal__hint">Carregando transmissão…</div>}
              {phase === 'error' && (
                <div className="modal__hint modal__hint--error">
                  Não foi possível reproduzir este fluxo (CORS ou link expirado).
                </div>
              )}
            </>
          )}

          {channel.status === 'offline' && (
            <div className="modal__warning">
              Este canal está marcado como <strong>offline</strong> na API. A transmissão pode
              não abrir.
            </div>
          )}
        </div>

        <div className="modal__meta">
          <div className="modal__meta-left">
            <div className="modal__thumb">
              <Cover channel={channel} className="modal__cover" />
            </div>

            <div>
              <h2 className="modal__title">{channel.cleanTitle ?? channel.title}</h2>
              <p className="modal__sub">
                <span
                  className={channel.status === 'online' ? 'dot dot--live' : 'dot dot--off'}
                />
                {channel.status === 'online' ? 'Online' : 'Offline'} · {channel.provider} ·
                atualizado em {formatDate(channel.updatedAt)}
                {viewers && (
                  <span className="modal__viewers">
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12 5C6.5 5 2.7 9.2 1.5 11.4a1.3 1.3 0 0 0 0 1.2C2.7 14.8 6.5 19 12 19s9.3-4.2 10.5-6.4a1.3 1.3 0 0 0 0-1.2C21.3 9.2 17.5 5 12 5Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6.2a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Z"
                      />
                    </svg>
                    {viewers} assistindo agora
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="modal__actions">
            <a className="btn btn-ghost" href={channel.uri} target="_blank" rel="noreferrer">
              Abrir em nova aba
            </a>
            <button className="btn btn-primary" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
