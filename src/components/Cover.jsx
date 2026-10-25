import { useMemo } from 'react'

const W = 320
const H = 180
const PAD_X = 24
const BUDGET_PX = W - PAD_X * 2
const BASE_SIZE = 27
const MIN_SIZE = 15
const MAX_LINES = 3

export default function Cover({ channel, className }) {
  const { lines, size, lineH } = useMemo(
    () => layout(channel.cleanTitle ?? channel.title),
    [channel],
  )

  const firstY = 164 - (lines.length - 1) * lineH
  const kickerY = firstY - 26
  const kicker = (channel.tags[0] ?? 'F1').toUpperCase().slice(0, 22)
  const gid = `cv${channel.id}`

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Capa de ${channel.title}`}
    >
      <defs>
        <linearGradient id={`${gid}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={channel.palette[0]} />
          <stop offset="100%" stopColor={channel.palette[1]} />
        </linearGradient>
        <linearGradient id={`${gid}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="40%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.75" />
        </linearGradient>
        <radialGradient id={`${gid}r`} cx="78%" cy="18%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${gid}g)`} />
      <rect width={W} height={H} fill={`url(#${gid}r)`} />
      <Pattern index={channel.pattern} />

      <text
        x={W - 18}
        y={30}
        textAnchor="end"
        fontSize={12}
        fontWeight={800}
        letterSpacing={3.5}
        fill="rgba(255,255,255,0.34)"
      >
        F1
      </text>

      <rect x={24} y={kickerY - 14} width={22} height={3} rx={1.5} fill="#e50914" />
      <text
        x={24}
        y={kickerY}
        fontSize={11}
        fontWeight={800}
        letterSpacing={2.6}
        fill="rgba(255,255,255,0.88)"
      >
        {kicker}
      </text>

      {lines.map((line, i) => (
        <text
          key={`${line}-${i}`}
          x={24}
          y={firstY + i * lineH}
          fontSize={size}
          fontWeight={800}
          letterSpacing={0.4}
          fill="#fff"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth={0.7}
          paintOrder="stroke"
        >
          {line.toUpperCase()}
        </text>
      ))}

      <rect width={W} height={H} fill={`url(#${gid}s)`} />
    </svg>
  )
}

function Pattern({ index }) {
  if (index === 0) {
    return (
      <g opacity="0.13" stroke="#fff" strokeWidth="11">
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={-70 + i * 36} y1={H} x2={30 + i * 36} y2={0} />
        ))}
      </g>
    )
  }

  if (index === 1) {
    return (
      <g opacity="0.17" fill="none" stroke="#fff" strokeWidth="3">
        {[26, 58, 90, 122, 154, 186, 218, 250].map((r) => (
          <circle key={r} cx={272} cy={34} r={r} />
        ))}
      </g>
    )
  }

  if (index === 2) {
    return (
      <g opacity="0.2" fill="#fff">
        {Array.from({ length: 6 }, (_, row) =>
          Array.from({ length: 11 }, (_, col) => (
            <circle key={`${row}-${col}`} cx={20 + col * 30} cy={16 + row * 30} r={2.2} />
          )),
        )}
      </g>
    )
  }

  return (
    <g opacity="0.16" fill="#fff">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={196} y={22 + i * 24} width={118 - i * 17} height={9} rx={4.5} />
      ))}
    </g>
  )
}

function layout(text) {
  const words = String(text).toUpperCase().split(/\s+/).filter(Boolean)
  const budgetEm = BUDGET_PX / BASE_SIZE
  const lines = []
  let line = ''
  let width = 0

  for (const word of words) {
    const wordWidth = widthEm(word)
    const nextWidth = line ? width + 0.28 + wordWidth : wordWidth

    if (!line || nextWidth <= budgetEm) {
      line = line ? `${line} ${word}` : word
      width = nextWidth
    } else {
      lines.push(line)
      line = word
      width = wordWidth
    }
  }
  if (line) lines.push(line)
  if (!lines.length) lines.push('CANAL')

  if (lines.length > MAX_LINES) {
    const kept = lines.slice(0, MAX_LINES)
    kept[MAX_LINES - 1] = `${kept[MAX_LINES - 1].slice(0, 16)}…`
    return finish(kept)
  }

  return finish(lines)
}

function finish(lines) {
  const maxEm = lines.reduce((max, l) => Math.max(max, widthEm(l)), 0.1)
  const size = Math.max(MIN_SIZE, Math.min(BASE_SIZE, BUDGET_PX / maxEm))
  return { lines, size, lineH: size * 1.08 }
}

function widthEm(text) {
  let width = 0
  for (const ch of String(text)) {
    if (ch === ' ') width += 0.28
    else if ('iljtI.,:;!\u0027|[]()'.includes(ch)) width += 0.34
    else if ('mwMW@%'.includes(ch)) width += 0.88
    else if (ch >= '0' && ch <= '9') width += 0.56
    else if (ch >= 'A' && ch <= 'Z') width += 0.72
    else width += 0.66
  }
  return width
}
