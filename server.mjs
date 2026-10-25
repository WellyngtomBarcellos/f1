import { createServer } from 'node:http'
import * as https from 'node:https'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), 'dist')
const PORT = Number(process.env.PORT) || 3000

const PROXY_ROUTES = {
  '/api/channels': { host: 'cdn.flive.dpdns.org', path: '/channels.json' },
  '/api/count': { host: 'stats.flive.dpdns.org', path: '/count' },
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
}

function proxyApi(target, req, res) {
  const upstream = https.request(
    {
      host: target.host,
      path: target.path,
      method: 'GET',
      headers: { 'user-agent': req.headers['user-agent'] || 'flive-app' },
    },
    (up) => {
      res.writeHead(up.statusCode || 502, {
        'content-type': up.headers['content-type'] || 'application/json',
        'access-control-allow-origin': '*',
        'cache-control': 'no-store',
      })
      up.pipe(res)
    },
  )

  upstream.on('error', () => {
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'application/json' })
    res.end('{"error":"proxy_failed"}')
  })
  upstream.end()
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split('?')[0])
  const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  let filePath = join(ROOT, safePath)

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden')
    return
  }

  const ext = extname(filePath)
  if (!existsSync(filePath)) {
    if (ext) {
      res.writeHead(404).end('Not found')
      return
    }
    filePath = join(ROOT, 'index.html')
  } else if (!ext) {
    filePath = join(ROOT, 'index.html')
  }

  try {
    const body = await readFile(filePath)
    res.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404).end('Not found')
  }
}

createServer((req, res) => {
  const target = PROXY_ROUTES[req.url.split('?')[0]]
  if (target) return proxyApi(target, req, res)
  return serveStatic(req, res)
}).listen(PORT, () => {
  console.log(`FLIVE rodando em http://localhost:${PORT}`)
})
