const SOURCE = 'https://cdn.flive.dpdns.org/channels.json'
const RELAY = 'https://r.jina.ai/'

const BROWSER_HEADERS = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
}

async function readJson(url, headers) {
  const res = await fetch(url, { headers, cache: 'no-store' })
  const text = await res.text()
  if (!res.ok) throw new Error(`upstream ${res.status}`)

  const trimmed = text.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    JSON.parse(trimmed)
    return trimmed
  }

  const marker = trimmed.indexOf('Markdown Content:')
  const payload =
    marker >= 0 ? trimmed.slice(marker + 'Markdown Content:'.length).trim() : trimmed
  JSON.parse(payload)
  return payload
}

export default async function handler(req, res) {
  res.setHeader('access-control-allow-origin', '*')

  let body = null

  try {
    body = await readJson(SOURCE, BROWSER_HEADERS)
  } catch {
    try {
      body = await readJson(RELAY + SOURCE, BROWSER_HEADERS)
    } catch {
      res.statusCode = 502
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.end('{"error":"upstream_failed"}')
      return
    }
  }

  res.statusCode = 200
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'public, s-maxage=60, stale-while-revalidate=300')
  res.end(body)
}
