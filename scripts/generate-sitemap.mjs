import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const SITE_URL = process.env.SITE_URL || 'https://globalworking.no'
const NEWS_DIR = path.resolve('src/content/news')
const SITEMAP_PATH = path.resolve('public/sitemap.xml')
const TODAY = new Date().toISOString().slice(0, 10)

const parseFrontmatter = (raw) => {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return {}

  const frontmatter = match[1]
  const data = {}

  for (const line of frontmatter.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf(':')
    if (idx < 1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    data[key] = value
  }

  return data
}

const buildUrlNode = ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`

const run = async () => {
  const files = await readdir(NEWS_DIR)
  const markdownFiles = files.filter(file => file.endsWith('.md') && !file.startsWith('_'))

  const articles = []
  for (const file of markdownFiles) {
    const fullPath = path.join(NEWS_DIR, file)
    const raw = await readFile(fullPath, 'utf8')
    const meta = parseFrontmatter(raw)
    if ((meta.status || 'published') !== 'published') continue
    if (!meta.slug) continue

    articles.push({
      slug: meta.slug,
      date: meta.date || TODAY,
    })
  }

  articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const homeLastmod = articles[0]?.date || TODAY

  const mainPages = [
    { loc: `${SITE_URL}/`,                        lastmod: homeLastmod, changefreq: 'weekly',  priority: '1.0' },
    { loc: `${SITE_URL}/vr-rekrutteringsmodell`,  lastmod: TODAY,       changefreq: 'monthly', priority: '0.9' },
    { loc: `${SITE_URL}/helse`,                   lastmod: TODAY,       changefreq: 'monthly', priority: '0.9' },
    { loc: `${SITE_URL}/nyheter`,                 lastmod: homeLastmod, changefreq: 'weekly',  priority: '0.9' },
    { loc: `${SITE_URL}/talentportalen`,          lastmod: TODAY,       changefreq: 'monthly', priority: '0.8' },
    { loc: `${SITE_URL}/om-oss`,                  lastmod: TODAY,       changefreq: 'monthly', priority: '0.8' },
    { loc: `${SITE_URL}/kontakt`,                 lastmod: TODAY,       changefreq: 'monthly', priority: '0.8' },
    { loc: `${SITE_URL}/personvern`,              lastmod: TODAY,       changefreq: 'yearly',  priority: '0.5' },
    { loc: `${SITE_URL}/vilkar`,                  lastmod: TODAY,       changefreq: 'yearly',  priority: '0.5' },
    { loc: `${SITE_URL}/cookies`,                 lastmod: TODAY,       changefreq: 'yearly',  priority: '0.5' },
  ]

  const nodes = [
    ...mainPages.map(buildUrlNode),
    ...articles.map(article =>
      buildUrlNode({
        loc: `${SITE_URL}/nyheter/${article.slug}`,
        lastmod: article.date,
        changefreq: 'monthly',
        priority: '0.8',
      }),
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${nodes.join('\n')}
</urlset>
`

  await mkdir(path.dirname(SITEMAP_PATH), { recursive: true })
  await writeFile(SITEMAP_PATH, xml, 'utf8')
  console.log(`Sitemap generated: ${mainPages.length} main pages + ${articles.length} news articles.`)
}

run().catch((error) => {
  console.error('Failed to generate sitemap:', error)
  process.exit(1)
})
