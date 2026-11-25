/**
 * generate-sitemap.mjs — un `lastmod` que no miente.
 *
 * POR QUÉ SE REESCRIBIÓ ESTO (16-11-2026)
 * La versión anterior ponía la fecha del build (`new Date()`) en 12 de las 14 rutas. Eso
 * significa que cada deploy movía el `lastmod` de TODAS las páginas, incluidas las que no
 * se habían tocado en meses (/personvern, /vilkar, /cookies). Google compara el `lastmod`
 * declarado contra lo que ve al rastrear, y cuando no cuadra deja de usar la señal para
 * TODO el sitio: pierdes la capacidad de decirle "esta sí cambió, vuelve a mirarla".
 * Un `lastmod` inflado no es neutro, es contraproducente.
 *
 * CÓMO SE CALCULA AHORA
 *
 *   Páginas fijas → fecha del último commit que tocó los archivos que generan esa ruta
 *                   (`git log -1 --format=%cs -- <archivo>`, se toma la más reciente del
 *                   conjunto). Es la única fecha verificable de que el contenido cambió.
 *
 *   Artículos     → fecha del frontmatter (`publishAt`, y si no, `date`), NO la de git.
 *                   Las noticias se exportaron de Supabase a `.md` el 13-11-2026, así que
 *                   el commit de `2026-03-10-kandidatportal-lansert.md` es de noviembre
 *                   aunque el artículo sea de marzo. Git fecha el archivo; el frontmatter
 *                   fecha el ARTÍCULO, que es lo que Google quiere saber.
 *
 *   Portada y /nyheter → además de sus propios archivos, la fecha del artículo más nuevo:
 *                   las dos listan noticias, así que publicar una las cambia de verdad.
 *
 * QUÉ NO ENTRA, Y POR QUÉ
 * `src/data/publishedContent.js` tiene el texto de producción de las 25 secciones en UN
 * solo archivo. Si lo contáramos como fuente, cualquier corrección de una coma en /helse
 * movería el `lastmod` de las 14 rutas a la vez — exactamente el falso positivo que
 * estamos quitando, y git no permite atribuir el cambio a una sección concreta. Se asume
 * el otro error, el falso negativo: un cambio SOLO de copy no mueve la fecha. Es el error
 * barato (Google tarda más en recrawlear) frente al caro (Google deja de creerte).
 * Si algún día se parte ese archivo por sección, cada trozo puede entrar en PAGE_SOURCES.
 *
 * DEGRADACIÓN (no se rompe el build, y no se inventa una fecha)
 *   1. git → fecha real.
 *   2. Sin git, o archivo no trackeado, o clon shallow donde ese archivo no aparece en el
 *      historial disponible (Vercel clona en superficie y este script corre en `prebuild`):
 *      se reutiliza el `lastmod` que ya tenía esa URL en el `public/sitemap.xml`
 *      commiteado, que se generó con el repo completo.
 *   3. Si tampoco hay eso, se OMITE `<lastmod>`. Es opcional en el protocolo: un sitemap
 *      sin fecha es válido, uno con fecha falsa es peor que no tenerla.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const SITE_URL = process.env.SITE_URL || 'https://globalworking.no'
const NEWS_DIR = path.resolve('src/content/news')
const SITEMAP_PATH = path.resolve('public/sitemap.xml')

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/* ─── git ────────────────────────────────────────────────────────────────── */

const gitWorks = () => {
  try {
    execFileSync('git', ['rev-parse', '--git-dir'], {
      stdio: ['ignore', 'ignore', 'ignore'],
    })
    return true
  } catch {
    return false
  }
}

const GIT_AVAILABLE = gitWorks()
const gitDateCache = new Map()

/**
 * Fecha (YYYY-MM-DD) del último commit que tocó `file`, o null.
 *
 * Se usa `%cs` (committer date, short) y no `%as`: lo que importa es cuándo entró el
 * cambio en la rama que se publica, no cuándo se escribió en local. Un rebase o un
 * cherry-pick de algo viejo cambia la página hoy.
 *
 * Devuelve null —y no revienta— si el archivo no existe, no está trackeado, o el
 * historial disponible no lo incluye (clon shallow).
 */
const gitLastCommitDate = (file) => {
  if (!GIT_AVAILABLE) return null
  if (gitDateCache.has(file)) return gitDateCache.get(file)

  let date = null
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    if (ISO_DATE.test(out)) date = out
  } catch {
    date = null
  }

  gitDateCache.set(file, date)
  return date
}

/** La más reciente de una lista de fechas ISO. Ordenan bien como texto. */
const newestDate = (dates) => {
  const valid = dates.filter((d) => d && ISO_DATE.test(d))
  if (valid.length === 0) return null
  return valid.sort()[valid.length - 1]
}

/* ─── frontmatter ────────────────────────────────────────────────────────── */

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

/**
 * Fecha del artículo en YYYY-MM-DD.
 *
 * Orden: `updatedAt` → `publishAt` → `date`. `lastmod` es "última modificación", así que
 * si algún día un artículo se edita y se anota `updatedAt`, esa gana. Hoy ninguno de los
 * 10 lo tiene, así que manda `publishAt` (lleva hora y zona, "2026-03-10T08:00:00+00:00",
 * y es el campo que el CMS rellenaba al publicar de verdad) y `date` queda de red.
 */
const articleDate = (meta) => {
  const candidate = (meta.updatedAt || meta.publishAt || meta.date || '').slice(0, 10)
  return ISO_DATE.test(candidate) ? candidate : null
}

/* ─── sitemap anterior (red de seguridad para clones shallow) ───────────── */

const readPreviousLastmods = async () => {
  const map = new Map()
  try {
    const xml = await readFile(SITEMAP_PATH, 'utf8')
    for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1]
      const lastmod = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1]
      if (loc && lastmod && ISO_DATE.test(lastmod)) map.set(loc, lastmod)
    }
  } catch {
    // Primera generación, o sitemap ilegible: no hay red, y no pasa nada.
  }
  return map
}

/* ─── qué archivos generan cada ruta ────────────────────────────────────── */

/**
 * Página + los componentes de sección que SOLO se usan en ella.
 *
 * Fuera quedan a propósito el chrome compartido (Navbar, Footer, PageEndNav, CookieConsent)
 * y los wrappers de edición (EditableText/EditableImage): tocar el footer no cambia de qué
 * habla /personvern, y si entrasen aquí volveríamos a mover las 14 fechas a la vez.
 */
const PAGE_SOURCES = {
  '/': [
    'src/pages/HomePage.jsx',
    'src/components/Hero.jsx',
    'src/components/VideoCarousel.jsx',
    'src/components/CTABanner.jsx',
    'src/components/SpanskAlicanteTeaser.jsx',
  ],
  '/vr-rekrutteringsmodell': [
    'src/pages/RekrutteringPage.jsx',
    'src/components/HvaGjor.jsx',
    'src/components/Rekruttering.jsx',
    'src/components/GodeGrunner.jsx',
  ],
  '/helse': [
    'src/pages/HelsePage.jsx',
    'src/components/Helsesektor.jsx',
    'src/components/GodeGrunner.jsx',
  ],
  '/nyheter': [
    'src/pages/NyheterPage.jsx',
    'src/components/Nyheter.jsx',
  ],
  '/talentportalen': [
    'src/pages/TalentportalenPage.jsx',
    'src/components/Talentportalen.jsx',
  ],
  '/om-oss': [
    'src/pages/OmOssPage.jsx',
    'src/components/OmOss.jsx',
    'src/components/FAQ.jsx',
  ],
  '/kontakt': [
    'src/pages/KontaktPage.jsx',
    'src/components/Kontakt.jsx',
  ],
  '/spansk-i-alicante': [
    'src/pages/SpanskAlicantePage.jsx',
    'src/components/KandidatKontakt.jsx',
  ],
  '/spansk-i-alicante/hvorfor': ['src/pages/SpanskAlicanteHvorforPage.jsx'],
  '/spansk-i-alicante/livet-som-student': ['src/pages/LivetSomStudentPage.jsx'],
  '/spansk-i-alicante/helsenorsk': ['src/pages/HelsenorskPage.jsx'],
  '/personvern': ['src/pages/PersonvernPage.jsx'],
  '/kvalitetspolicy': ['src/pages/KvalitetspolicyPage.jsx'],
  '/vilkar': ['src/pages/VilkarPage.jsx'],
  '/cookies': ['src/pages/CookiesPage.jsx'],
}

/** Rutas que listan noticias: publicar un artículo también las cambia a ellas. */
const NEWS_DRIVEN_ROUTES = new Set(['/', '/nyheter'])

/* ─── XML ────────────────────────────────────────────────────────────────── */

const buildUrlNode = ({ loc, lastmod, changefreq, priority }) => {
  const lines = [`    <loc>${loc}</loc>`]
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`)
  lines.push(`    <changefreq>${changefreq}</changefreq>`)
  lines.push(`    <priority>${priority}</priority>`)
  return `  <url>\n${lines.join('\n')}\n  </url>`
}

/* ─── run ────────────────────────────────────────────────────────────────── */

const run = async () => {
  const previousLastmods = await readPreviousLastmods()

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
      date: articleDate(meta),
    })
  }

  articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  const newestArticleDate = newestDate(articles.map(a => a.date))

  const stats = { computed: 0, previous: 0, omitted: 0 }

  /** Resuelve el lastmod de una ruta fija con la cadena git → sitemap anterior → nada. */
  const resolveLastmod = (pathname) => {
    const loc = pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`
    const candidates = (PAGE_SOURCES[pathname] || []).map(gitLastCommitDate)
    if (NEWS_DRIVEN_ROUTES.has(pathname)) candidates.push(newestArticleDate)

    const computed = newestDate(candidates)
    if (computed) {
      stats.computed += 1
      return computed
    }

    const fromPrevious = previousLastmods.get(loc)
    if (fromPrevious) {
      stats.previous += 1
      return fromPrevious
    }

    stats.omitted += 1
    return null
  }

  const mainPages = [
    { pathname: '/',                                     changefreq: 'weekly',  priority: '1.0' },
    { pathname: '/vr-rekrutteringsmodell',               changefreq: 'monthly', priority: '0.9' },
    { pathname: '/helse',                                changefreq: 'monthly', priority: '0.9' },
    { pathname: '/nyheter',                              changefreq: 'weekly',  priority: '0.9' },
    { pathname: '/talentportalen',                       changefreq: 'monthly', priority: '0.8' },
    { pathname: '/om-oss',                               changefreq: 'monthly', priority: '0.8' },
    { pathname: '/kontakt',                              changefreq: 'monthly', priority: '0.8' },
    { pathname: '/spansk-i-alicante',                    changefreq: 'weekly',  priority: '0.8' },
    { pathname: '/spansk-i-alicante/hvorfor',            changefreq: 'monthly', priority: '0.7' },
    { pathname: '/spansk-i-alicante/livet-som-student',  changefreq: 'monthly', priority: '0.7' },
    { pathname: '/spansk-i-alicante/helsenorsk',         changefreq: 'monthly', priority: '0.7' },
    { pathname: '/personvern',                           changefreq: 'yearly',  priority: '0.5' },
    { pathname: '/kvalitetspolicy',                      changefreq: 'yearly',  priority: '0.5' },
    { pathname: '/vilkar',                               changefreq: 'yearly',  priority: '0.5' },
    { pathname: '/cookies',                              changefreq: 'yearly',  priority: '0.5' },
  ].map(({ pathname, changefreq, priority }) => ({
    loc: pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`,
    lastmod: resolveLastmod(pathname),
    changefreq,
    priority,
  }))

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

  if (!GIT_AVAILABLE) {
    console.warn('  git no disponible: los lastmod de las páginas fijas salen del sitemap anterior.')
  }
  console.log(`Sitemap generated: ${mainPages.length} main pages + ${articles.length} news articles.`)
  console.log(`  lastmod: ${stats.computed} calculados (git/frontmatter), ${stats.previous} del sitemap anterior, ${stats.omitted} omitidos.`)
}

run().catch((error) => {
  console.error('Failed to generate sitemap:', error)
  process.exit(1)
})
