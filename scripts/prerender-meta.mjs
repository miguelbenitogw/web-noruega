import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const DIST_DIR = path.resolve('dist')
const INDEX_PATH = path.join(DIST_DIR, 'index.html')
const NEWS_DIR = path.resolve('src/content/news')
const SITE_URL = 'https://globalworking.no'
const DEFAULT_IMAGE = 'https://globalworking.net/wp-content/uploads/2025/12/cropped-GlobalWorking-Logotipo-Principal-vertical-cuadrado-scaled-1.jpg'
const SITE_NAME = 'Global Working Norge'

const ROUTES = {
  '/vr-rekrutteringsmodell': {
    title: 'Vår rekrutteringsmodell | Global Working Norge',
    description: 'Se hvordan vi rekrutterer, forbereder og følger opp fagfolk fra Sør-Europa til trygg oppstart i Norge.',
    keywords: 'rekruttering Norge, fagfolk fra Europa, internasjonal rekruttering, arbeidsinnvandring',
    breadcrumbName: 'Rekrutteringsmodell',
  },
  '/helse': {
    title: 'Helsesektor | Global Working Norge',
    description: 'Vi forbereder helsepersonell for den norske helsesektoren med språk, faglig oppfølging og strukturert overgang til jobb.',
    keywords: 'helsepersonell Norge, sykepleiere rekruttering, helsesektor bemanning, autorisasjon helsepersonell',
    breadcrumbName: 'Helsesektor',
  },
  '/nyheter': {
    title: 'Nyheter & artikler | Global Working Norge',
    description: 'Følg siste nytt, artikler og oppdateringer fra Global Working om rekruttering, språk og arbeidsliv i Norge.',
    keywords: 'Global Working nyheter, rekruttering nyheter Norge, arbeidsliv Norge',
    breadcrumbName: 'Nyheter',
  },
  '/talentportalen': {
    title: 'Talentportalen | Global Working Norge',
    description: 'Se tilgjengelige kandidater og inviter til intervju direkte gjennom vår kandidatportal.',
    keywords: 'kandidatportal, tilgjengelige kandidater Norge, rekrutteringsportal',
    breadcrumbName: 'Talentportalen',
  },
  '/om-oss': {
    title: 'Om oss | Global Working Norge',
    description: 'Lær mer om Global Working, teamet vårt og hvordan vi jobber med språk, kvalitet og internasjonal rekruttering.',
    keywords: 'Global Working team, om Global Working, rekrutteringsbyrå Norge',
    breadcrumbName: 'Om oss',
  },
  '/kontakt': {
    title: 'Kontakt | Global Working Norge',
    description: 'Ta kontakt for spørsmål om rekruttering, samarbeid eller kandidatportalen.',
    keywords: 'kontakt Global Working, rekruttering kontakt, samarbeid Norge',
    breadcrumbName: 'Kontakt',
  },
  '/spansk-i-alicante': {
    title: 'Spansk i Alicante | Global Working Norge',
    description: 'Bo gratis i Alicante og bli samtaleassistent i et internasjonalt miljø gjennom Spansk i Alicante-programmet.',
    keywords: 'spansk i Alicante, samtaleassistent, språkopphold Spania, bo gratis Alicante',
    breadcrumbName: 'Spansk i Alicante',
  },
  '/spansk-i-alicante/hvorfor': {
    title: 'Hvorfor finnes Spansk i Alicante? | Global Working Norge',
    description: 'Lær hvorfor Spansk i Alicante er en viktig del av Global Working sin forberedelse av fagfolk til jobb i Norge.',
    keywords: 'hvorfor Spansk i Alicante, språkforberedelse fagfolk, Global Working Alicante',
    breadcrumbName: 'Hvorfor Spansk i Alicante',
    parent: { name: 'Spansk i Alicante', path: '/spansk-i-alicante' },
  },
  '/spansk-i-alicante/livet-som-student': {
    title: 'Livet som student i Alicante | Global Working Norge',
    description: 'Slik er hverdagen for kandidatene våre i Alicante: undervisning, helsenorsk, samtaleassistenter og sosialt fellesskap.',
    keywords: 'livet som student Alicante, hverdagen i Alicante, helsenorsk, samtaleassistenter, sosialt fellesskap',
    breadcrumbName: 'Livet som student',
    parent: { name: 'Spansk i Alicante', path: '/spansk-i-alicante' },
  },
  '/personvern': {
    title: 'Personvern | Global Working Norge',
    description: 'Les hvordan Global Working Norge behandler personopplysninger, formål, lagringstid og dine rettigheter.',
    breadcrumbName: 'Personvern',
  },
  '/vilkar': {
    title: 'Vilkår | Global Working Norge',
    description: 'Vilkår for bruk av nettstedet og tjenester fra Global Working Norge, inkludert ansvar og kontaktinformasjon.',
    breadcrumbName: 'Vilkår',
  },
  '/cookies': {
    title: 'Informasjonskapsler | Global Working Norge',
    description: 'Informasjon om hvilke cookies vi bruker, hvorfor vi bruker dem og hvordan du kan administrere samtykke.',
    breadcrumbName: 'Informasjonskapsler',
  },
}

const parseFrontmatter = (raw) => {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return {}
  const data = {}
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf(':')
    if (idx < 1) continue
    data[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
  }
  return data
}

const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const buildNewsArticleSchema = (article) => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: article.title,
  description: article.description,
  datePublished: article.publishAt || `${article.date}T08:00:00Z`,
  dateModified: article.publishAt || `${article.date}T08:00:00Z`,
  author: { '@type': 'Organization', name: article.author || 'Global Working' },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: { '@type': 'ImageObject', url: DEFAULT_IMAGE },
  },
  mainEntityOfPage: `${SITE_URL}/nyheter/${article.slug}`,
  image: [article.image || DEFAULT_IMAGE],
})

const buildBreadcrumbSchema = (items) => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
})

const buildWebPageSchema = (route) => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: route.title,
  description: route.description,
  url: `${SITE_URL}${route.pathname}`,
  image: DEFAULT_IMAGE,
  inLanguage: 'nb-NO',
  isPartOf: {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  },
})

const injectMeta = (html, pathname, route) => {
  const url = `${SITE_URL}${pathname}`
  let result = html

  result = result.replace(
    /<title>[^<]*<\/title>/,
    `<title>${route.title}</title>`,
  )
  result = result.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${route.description}" />`,
  )

  if (route.keywords) {
    result = result.replace(
      /<meta name="keywords" content="[^"]*" \/>/,
      `<meta name="keywords" content="${route.keywords}" />`,
    )
  }

  result = result.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${url}" />`,
  )
  result = result.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${route.title}" />`,
  )
  result = result.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${route.description}" />`,
  )

  result = result.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${route.title}" />`,
  )
  result = result.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${route.description}" />`,
  )

  result = result.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`,
  )

  const breadcrumbs = [{ name: 'Forside', url: SITE_URL }]
  if (route.parent) {
    breadcrumbs.push({ name: route.parent.name, url: `${SITE_URL}${route.parent.path}` })
  }
  breadcrumbs.push({ name: route.breadcrumbName, url })

  const schemas = `
    <script type="application/ld+json">${buildWebPageSchema({ ...route, pathname })}</script>
    <script type="application/ld+json">${buildBreadcrumbSchema(breadcrumbs)}</script>`

  result = result.replace(
    '<!-- Analytics is initialized from app code only after cookie consent -->',
    `${schemas}\n    <!-- Analytics is initialized from app code only after cookie consent -->`,
  )

  return result
}

const injectArticleMeta = (html, article) => {
  const pathname = `/nyheter/${article.slug}`
  const url = `${SITE_URL}${pathname}`
  const title = escapeHtml(article.seoTitle || article.title)
  const description = escapeHtml(article.seoDescription || article.excerpt)
  const image = article.coverImage || DEFAULT_IMAGE
  let result = html

  result = result.replace(/<title>[^<]*<\/title>/, `<title>${title} | Global Working</title>`)
  result = result.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`)
  result = result.replace(/<meta property="og:type" content="[^"]*" \/>/, '<meta property="og:type" content="article" />')
  result = result.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
  result = result.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title} | Global Working" />`)
  result = result.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`)
  result = result.replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${title} | Global Working" />`)
  result = result.replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${description}" />`)
  result = result.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)

  if (image && image !== DEFAULT_IMAGE) {
    result = result.replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${image}" />`)
    result = result.replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${image}" />`)
  }

  const breadcrumbs = buildBreadcrumbSchema([
    { name: 'Forside', url: SITE_URL },
    { name: 'Nyheter', url: `${SITE_URL}/nyheter` },
    { name: article.title, url },
  ])
  const articleSchema = buildNewsArticleSchema({ ...article, description, image })

  const schemas = `
    <script type="application/ld+json">${articleSchema}</script>
    <script type="application/ld+json">${breadcrumbs}</script>`

  result = result.replace(
    '<!-- Analytics is initialized from app code only after cookie consent -->',
    `${schemas}\n    <!-- Analytics is initialized from app code only after cookie consent -->`,
  )

  return result
}

const loadArticles = async () => {
  const files = await readdir(NEWS_DIR)
  const articles = []
  for (const file of files.filter(f => f.endsWith('.md') && !f.startsWith('_'))) {
    const raw = await readFile(path.join(NEWS_DIR, file), 'utf8')
    const meta = parseFrontmatter(raw)
    if ((meta.status || 'published') !== 'published' || !meta.slug) continue
    articles.push(meta)
  }
  return articles
}

const run = async () => {
  const baseHtml = await readFile(INDEX_PATH, 'utf8')
  let generated = 0

  for (const [pathname, route] of Object.entries(ROUTES)) {
    const routeDir = path.join(DIST_DIR, ...pathname.split('/').filter(Boolean))
    await mkdir(routeDir, { recursive: true })
    const html = injectMeta(baseHtml, pathname, route)
    await writeFile(path.join(routeDir, 'index.html'), html, 'utf8')
    generated++
  }

  const articles = await loadArticles()
  for (const article of articles) {
    const routeDir = path.join(DIST_DIR, 'nyheter', article.slug)
    await mkdir(routeDir, { recursive: true })
    const html = injectArticleMeta(baseHtml, article)
    await writeFile(path.join(routeDir, 'index.html'), html, 'utf8')
    generated++
  }

  console.log(`Prerender meta: generated ${generated} HTML files (${Object.keys(ROUTES).length} pages + ${articles.length} articles).`)
}

run().catch((error) => {
  console.error('Failed to prerender meta:', error)
  process.exit(1)
})
