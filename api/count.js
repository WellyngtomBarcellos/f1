const SOURCE = 'https://stats.flive.dpdns.org/count'

export default async function handler(req, res) {
  res.setHeader('access-control-allow-origin', '*')

  try {
    const upstream = await fetch(SOURCE, { headers: { accept: 'application/json' } })
    const body = await upstream.text()

    res.statusCode = upstream.status
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.setHeader('cache-control', 'public, s-maxage=15, stale-while-revalidate=30')
    res.end(body)
  } catch {
    res.statusCode = 502
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end('{"error":"upstream_failed"}')
  }
}
