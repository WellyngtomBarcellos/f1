const PROXY_URL = '/api/channels.json'
const DIRECT_URL = 'https://cdn.flive.dpdns.org/channels.json'
const COUNTS_URL = 'https://stats.flive.dpdns.org/count'

export const COUNTS_POLL_MS = 30000

export async function fetchChannels(signal) {
  const data = await getJSON(PROXY_URL, signal).catch(() => getJSON(DIRECT_URL, signal))
  if (!Array.isArray(data)) throw new Error('Resposta inesperada da API')
  return data.map(normalize)
}

async function getJSON(url, signal) {
  const res = await fetch(url, { signal, cache: 'no-store' })
  if (!res.ok) throw new Error(`Falha na API (${res.status})`)
  const type = res.headers.get('content-type') || ''
  if (!type.includes('json')) throw new Error('Resposta não é JSON')
  return res.json()
}

export async function fetchCounts(signal) {
  try {
    const data = await getJSON(COUNTS_URL, signal)
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
    const counts = {}
    for (const [id, value] of Object.entries(data)) {
      const n = Number(value)
      if (Number.isFinite(n) && n > 0) counts[id] = Math.round(n)
    }
    return counts
  } catch (err) {
    if (err.name === 'AbortError') throw err
    return {}
  }
}

const numberFormat = new Intl.NumberFormat('pt-BR')

export function formatViewers(value) {
  const n = Number(value) || 0
  if (n <= 0) return null
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace('.', ',')} mi`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',')} mil`
  return numberFormat.format(n)
}

function normalize(item, index) {
  const rawTitle = String(item.title ?? 'Sem título').trim()
  const cleanTitle = rawTitle.replace(/^\[embed\]\s*/i, '').trim() || rawTitle
  const uri = String(item.uri ?? '')
  const look = lookFor(rawTitle)
  return {
    id: item.id ?? index,
    title: rawTitle,
    cleanTitle,
    uri,
    status: item.status === 'online' ? 'online' : 'offline',
    isEmbed: Boolean(item.is_embed),
    provider: item.provider ?? 'other',
    blockable: Boolean(item.blockable),
    updatedAt: item.updated_at ?? '',
    isHls: /\.m3u8(\?|$)/i.test(uri),
    tags: extractTags(rawTitle),
    palette: look.palette,
    pattern: look.pattern,
    gradient: `linear-gradient(135deg, ${look.palette[0]} 0%, ${look.palette[1]} 100%)`,
  }
}

const TAG_RULES = [
  { tag: 'Fórmula 1', re: /(f1|formula\s*1|f[óo]rmula\s*1|grand\s*prix|skyf1|racing)/i },
  { tag: 'Sky Sports', re: /\bsky\s*sports?\b/i },
  { tag: 'ESPN', re: /\bespn\b/i },
  { tag: 'Apple TV', re: /\bapple\s*tv\b/i },
  { tag: '4K UHD', re: /\b(4k|uhd|2160p)\b/i },
  { tag: 'HD', re: /\b(hd|fhd|1080p)\b/i },
]

function extractTags(title) {
  return [...new Set(TAG_RULES.filter((r) => r.re.test(title)).map((r) => r.tag))]
}

const PALETTES = [
  ['#5b1a1f', '#e50914'],
  ['#0b2545', '#1f6feb'],
  ['#2b1d0e', '#c77b1e'],
  ['#12261c', '#1f9254'],
  ['#241338', '#7b3fe4'],
  ['#0f2b3a', '#18a0c4'],
  ['#33121f', '#d6336c'],
]

function hashOf(text) {
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  return hash
}

function lookFor(title) {
  const hash = hashOf(title)
  const palette = PALETTES[hash % PALETTES.length]
  return { palette, pattern: hash % 4 }
}

const ROWS = [
  {
    id: 'trending',
    title: 'Em alta',
    match: (c) => c.status === 'online',
    sort: (a, b) =>
      (b.viewers ?? 0) - (a.viewers ?? 0) ||
      new Date(b.updatedAt) - new Date(a.updatedAt),
  },
  {
    id: 'f1',
    title: 'Fórmula 1',
    match: (c) => c.tags.includes('Fórmula 1'),
  },
  {
    id: 'skysports',
    title: 'Sky Sports',
    match: (c) => c.tags.includes('Sky Sports'),
  },
  {
    id: 'espn',
    title: 'ESPN',
    match: (c) => c.tags.includes('ESPN'),
  },
  {
    id: 'others',
    title: 'Outros canais',
    match: () => true,
  },
  {
    id: 'offline',
    title: 'Indisponíveis agora',
    match: (c) => c.status === 'offline',
  },
]

export function buildRows(channels) {
  const used = new Set()
  const rows = []

  for (const def of ROWS) {
    const items = channels
      .filter((c) => def.match(c))
      .filter((c) => !used.has(c.id))
      .sort(def.sort ?? ((a, b) => a.title.localeCompare(b.title, 'pt-BR')))

    if (!items.length) continue
    items.forEach((c) => used.add(c.id))
    rows.push({ id: def.id, title: def.title, items })
  }

  return rows
}

export function pickFeatured(channels) {
  const online = channels.filter((c) => c.status === 'online')
  const pool = online.length ? online : channels
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}
