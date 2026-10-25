const SOURCE = 'https://cdn.flive.dpdns.org/channels.json'

export default async function handler(req, res) {
  res.setHeader('access-control-allow-origin', '*')

  try {
    const upstream = await fetch(SOURCE, { headers: { accept: 'application/json' } })
    const body = await upstream.text()

    res.statusCode = upstream.status
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.setHeader('cache-control', 'public, s-maxage=60, stale-while-revalidate=300')
    res.end(body)
  } catch {
    res.statusCode = 502
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end('{"error":"upstream_failed"}')
  }
}
