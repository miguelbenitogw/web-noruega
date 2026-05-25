/**
 * prerender-body.mjs — Captures rendered React HTML and injects it into
 * the static HTML files so that crawlers (Googlebot, Bing, AI bots) see
 * real content instead of an empty <div id="root"></div>.
 *
 * Runs AFTER prerender-meta.mjs (which creates per-route HTML with proper head).
 * Uses Playwright to launch a headless browser, visit each route, wait for
 * React to render, then captures the innerHTML of #root.
 *
 * If Playwright/Chromium is not available, exits gracefully (build still succeeds).
 */
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const DIST_DIR = path.resolve('dist')
const NEWS_DIR = path.resolve('src/content/news')
const PORT = 4173
const RENDER_TIMEOUT = 20_000

// ── Static page routes (must match prerender-meta.mjs) ──────────────
const STATIC_ROUTES = [
  '/',
  '/vr-rekrutteringsmodell',
  '/helse',
  '/nyheter',
  '/talentportalen',
  '/om-oss',
  '/kontakt',
  '/spansk-i-alicante',
  '/spansk-i-alicante/hvorfor',
  '/spansk-i-alicante/livet-som-student',
  '/personvern',
  '/vilkar',
  '/cookies',
]

// ── Discover published news article slugs from markdown ─────────────
async function discoverArticleSlugs() {
  try {
    const files = await readdir(NEWS_DIR)
    const slugs = []
    for (const file of files) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue
      const raw = await readFile(path.join(NEWS_DIR, file), 'utf8')
      const match = raw.match(/^---\n([\s\S]*?)\n---/)
      if (!match) continue
      const slugMatch = match[1].match(/^slug:\s*["']?(.+?)["']?\s*$/m)
      const statusMatch = match[1].match(/^status:\s*["']?(.+?)["']?\s*$/m)
      if (!slugMatch) continue
      if (statusMatch && statusMatch[1] !== 'published') continue
      slugs.push(slugMatch[1])
    }
    return slugs
  } catch {
    return []
  }
}

// ── Minimal static file server for dist/ ────────────────────────────
function startServer() {
  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
  }

  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0])

      const candidates = [
        path.join(DIST_DIR, urlPath),
        path.join(DIST_DIR, urlPath, 'index.html'),
        path.join(DIST_DIR, 'index.html'),
      ]

      for (const candidate of candidates) {
        try {
          const s = await stat(candidate)
          if (s.isFile()) {
            const content = await readFile(candidate)
            const ext = path.extname(candidate).toLowerCase()
            res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
            res.end(content)
            return
          }
        } catch { /* try next candidate */ }
      }

      res.writeHead(404)
      res.end('Not found')
    })

    server.listen(PORT, '127.0.0.1', () => resolve(server))
  })
}

// ── Main ────────────────────────────────────────────────────────────
async function run() {
  const articleSlugs = await discoverArticleSlugs()
  const articleRoutes = articleSlugs.map((slug) => `/nyheter/${slug}`)
  const allRoutes = [...STATIC_ROUTES, ...articleRoutes]

  console.log(`Prerender-body: ${allRoutes.length} routes (${STATIC_ROUTES.length} pages + ${articleRoutes.length} articles)`)

  const server = await startServer()
  console.log(`  Server listening on http://127.0.0.1:${PORT}`)

  let browser
  try {
    browser = await chromium.launch({ headless: true })
  } catch (error) {
    console.warn(`  ⚠ Could not launch browser: ${error.message}`)
    console.warn('  Skipping body prerender (head meta still works)')
    server.close()
    return
  }

  const context = await browser.newContext({ javaScriptEnabled: true })
  let rendered = 0
  let skipped = 0

  for (const route of allRoutes) {
    const page = await context.newPage()
    const url = `http://127.0.0.1:${PORT}${route}`

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: RENDER_TIMEOUT })
      await page.waitForSelector('#root > *', { timeout: RENDER_TIMEOUT })

      // Allow Supabase fetches and lazy renders to settle
      await page.waitForTimeout(2500)

      const rootHTML = await page.evaluate(() => {
        const root = document.getElementById('root')
        if (!root) return ''
        const clone = root.cloneNode(true)
        // Strip scripts injected by analytics / browser extensions
        clone.querySelectorAll('script').forEach((s) => s.remove())
        return clone.innerHTML
      })

      if (!rootHTML || rootHTML.length < 100) {
        console.warn(`  ⚠ ${route}: too short (${rootHTML?.length ?? 0} chars)`)
        skipped++
        await page.close()
        continue
      }

      const htmlPath = route === '/'
        ? path.join(DIST_DIR, 'index.html')
        : path.join(DIST_DIR, ...route.slice(1).split('/'), 'index.html')

      const html = await readFile(htmlPath, 'utf8')
      const updated = html.replace('<div id="root"></div>', `<div id="root">${rootHTML}</div>`)

      if (updated === html) {
        console.warn(`  ⚠ ${route}: placeholder not found`)
        skipped++
      } else {
        await writeFile(htmlPath, updated, 'utf8')
        rendered++
        console.log(`  ✓ ${route} (${(rootHTML.length / 1024).toFixed(1)} KB)`)
      }
    } catch (error) {
      console.warn(`  ✗ ${route}: ${error.message}`)
      skipped++
    }

    await page.close()
  }

  await browser.close()
  server.close()

  console.log(`\nPrerender-body complete: ${rendered} rendered, ${skipped} skipped.`)
}

run().catch((error) => {
  console.error('Prerender-body failed:', error.message)
  // Don't break the build — head-only prerender is still active
  process.exit(0)
})
