import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const DIST_DIR = path.resolve('dist')
const INDEX_PATH = path.join(DIST_DIR, 'index.html')
const NEWS_DIR = path.resolve('src/content/news')
const SITE_URL = 'https://globalworking.no'
const DEFAULT_IMAGE = 'https://hahqimviirkkzkvmusga.supabase.co/storage/v1/object/public/content-media/og-image.jpg'
const SITE_NAME = 'Global Working Norge'

const ROUTES = {
  '/vr-rekrutteringsmodell': {
    title: 'Vår rekrutteringsmodell | Global Working Norge',
    description: 'Se hvordan vi rekrutterer, forbereder og følger opp fagfolk fra Sør-Europa til trygg oppstart i Norge.',
    keywords: 'rekruttering Norge, fagfolk fra Europa, internasjonal rekruttering, arbeidsinnvandring',
    breadcrumbName: 'Rekrutteringsmodell',
    bodyExtra: '<h2>Slik fungerer rekrutteringsprosessen</h2><p>Global Workings rekrutteringsmodell er bygd opp i fire faser: identifisering av kandidater, språklig og faglig kvalifisering, dokumenthåndtering og autorisasjon, og til slutt tett oppfølging etter oppstart i Norge. Vi samarbeider med universiteter og fagmiljøer i Spania, Portugal og andre søreuropeiske land for å finne kandidater som matcher norske arbeidsgiveres behov. Alle kandidater gjennomgår norskopplæring til minimum B1-nivå før de starter i jobb.</p>',
  },
  '/helse': {
    title: 'Helsesektor | Global Working Norge',
    description: 'Vi forbereder helsepersonell for den norske helsesektoren med språk, faglig oppfølging og strukturert overgang til jobb.',
    keywords: 'helsepersonell Norge, sykepleiere rekruttering, helsesektor bemanning, autorisasjon helsepersonell',
    breadcrumbName: 'Helsesektor',
    bodyExtra: '<h2>Rekruttering av helsepersonell til Norge</h2><p>Norsk helsevesen trenger kvalifiserte sykepleiere, helsefagarbeidere og spesialistpersonell. Global Working spesialiserer seg på å rekruttere helsepersonell fra Sør-Europa og forberede dem for det norske arbeidsmarkedet. Programmet vårt inkluderer helsenorsk-opplæring, støtte gjennom autorisasjonsprosessen hos Helsedirektoratet, kulturell forberedelse og tett oppfølging det første året i Norge. Vi samarbeider med kommuner, sykehus og private helseinstitusjoner over hele landet.</p>',
  },
  '/nyheter': {
    title: 'Nyheter & artikler | Global Working Norge',
    description: 'Følg siste nytt, artikler og oppdateringer fra Global Working om rekruttering, språk og arbeidsliv i Norge.',
    keywords: 'Global Working nyheter, rekruttering nyheter Norge, arbeidsliv Norge',
    breadcrumbName: 'Nyheter',
    bodyExtra: '<h2>Siste nytt</h2><ul><li><a href="/nyheter/kandidatportal-lansert">Ny kandidatportal lansert</a></li><li><a href="/nyheter/innkjopsgrense-juli-2026">Nye innkjøpsgrenser fra juli 2026</a></li><li><a href="/nyheter/evaluering-sprakniva">Evaluering av språknivå</a></li><li><a href="/nyheter/sor-fron-integrasjon">Integrering i Sør-Fron</a></li></ul>',
  },
  '/talentportalen': {
    title: 'Talentportalen | Global Working Norge',
    description: 'Se tilgjengelige kandidater og inviter til intervju direkte gjennom vår kandidatportal.',
    keywords: 'kandidatportal, tilgjengelige kandidater Norge, rekrutteringsportal',
    breadcrumbName: 'Talentportalen',
    bodyExtra: '<h2>Hvordan Talentportalen fungerer</h2><p>Talentportalen gir norske arbeidsgivere direkte tilgang til forhåndsgodkjente kandidater fra Global Workings nettverk. Du kan filtrere etter fagområde, språknivå og tilgjengelighet, lese kandidatprofiler og invitere til intervju — alt på én plattform. Kandidatene er allerede kvalitetssikret gjennom vår rekrutteringsprosess, noe som gjør at du kan gå fra behov til intervju på kort tid.</p>',
  },
  '/om-oss': {
    title: 'Om oss | Global Working Norge',
    description: 'Lær mer om Global Working, teamet vårt og hvordan vi jobber med språk, kvalitet og internasjonal rekruttering.',
    keywords: 'Global Working team, om Global Working, rekrutteringsbyrå Norge',
    breadcrumbName: 'Om oss',
    bodyExtra: '<h2>Hvem er Global Working?</h2><p>Global Working ble grunnlagt i 2014 med et mål: å bygge bro mellom kvalifiserte fagfolk i Sør-Europa og arbeidsgivere i Norge som trenger kompetanse. Med hovedkontor i Alicante og representasjon i Oslo har vi over 50 ansatte som jobber daglig med rekruttering, språkopplæring og integrering. Vi tror på langvarige ansettelser bygget på grundig forberedelse — både faglig, språklig og kulturelt.</p>',
  },
  '/kontakt': {
    title: 'Kontakt | Global Working Norge',
    description: 'Ta kontakt for spørsmål om rekruttering, samarbeid eller kandidatportalen.',
    keywords: 'kontakt Global Working, rekruttering kontakt, samarbeid Norge',
    breadcrumbName: 'Kontakt',
    bodyExtra: '<h2>Ta kontakt med oss</h2><p>Har du spørsmål om rekruttering, samarbeid eller kandidatportalen? Vi svarer gjerne. E-post: kontakt@globalworking.no. Telefon: +47 919 00 649. Besøksadresse: Carrer de Periodista Pirula Arderius, 4, 03001 Alicante, Spania.</p>',
  },
  '/spansk-i-alicante': {
    title: 'Spansk i Alicante | Global Working Norge',
    description: 'Bo gratis i Alicante og bli samtaleassistent i et internasjonalt miljø gjennom Spansk i Alicante-programmet.',
    keywords: 'spansk i Alicante, samtaleassistent, språkopphold Spania, bo gratis Alicante',
    breadcrumbName: 'Spansk i Alicante',
    bodyExtra: '<h2>Hva er Spansk i Alicante?</h2><p>Spansk i Alicante er et unikt program der norske deltakere bor gratis i Alicante og fungerer som samtaleassistenter for kandidater som lærer norsk. Du trenger ingen forkunnskaper i spansk — programmet er for deg som vil oppleve Alicante, bidra i et internasjonalt miljø og hjelpe fagfolk med å bli trygge i norsk. Oppholdet inkluderer fri bolig, sosialt fellesskap og mulighet til å lære spansk på fritiden.</p>',
  },
  '/spansk-i-alicante/hvorfor': {
    title: 'Hvorfor finnes Spansk i Alicante? | Global Working Norge',
    description: 'Lær hvorfor Spansk i Alicante er en viktig del av Global Working sin forberedelse av fagfolk til jobb i Norge.',
    keywords: 'hvorfor Spansk i Alicante, språkforberedelse fagfolk, Global Working Alicante',
    breadcrumbName: 'Hvorfor Spansk i Alicante',
    parent: { name: 'Spansk i Alicante', path: '/spansk-i-alicante' },
    bodyExtra: '<h2>Hvorfor samtaleassistenter?</h2><p>Språkopplæring alene er ikke nok for å bli trygg i norsk. Kandidatene våre trenger daglig praksis med ekte norske samtaler. Samtaleassistentprogrammet gir dem akkurat det — naturlige, uformelle samtaler med nordmenn som bor i Alicante. Dette gjør overgangen til norsk arbeidsliv mye enklere.</p>',
  },
  '/spansk-i-alicante/livet-som-student': {
    title: 'Livet som student i Alicante | Global Working Norge',
    description: 'Slik er hverdagen for kandidatene våre i Alicante: undervisning, helsenorsk, samtaleassistenter og sosialt fellesskap.',
    keywords: 'livet som student Alicante, hverdagen i Alicante, helsenorsk, samtaleassistenter, sosialt fellesskap',
    breadcrumbName: 'Livet som student',
    parent: { name: 'Spansk i Alicante', path: '/spansk-i-alicante' },
    bodyExtra: '<h2>Hverdagen i Alicante</h2><p>Kandidatene våre følger et strukturert program med norskundervisning, helsenorsk, samtalegrupper med norske assistenter og sosialt fellesskap. Dagene er en blanding av klasseromsundervisning, praktiske øvelser og kulturelle aktiviteter. Alicante tilbyr et trygt og sosialt miljø med mildt klima, noe som gjør forberedelsesperioden til en positiv opplevelse.</p>',
  },
  '/spansk-i-alicante/helsenorsk': {
    title: 'Helsenorsk – Yrkesrettet norsk for helsesektoren | Global Working Norge',
    description: 'Helsenorsk er Global Workings spesialiserte språkprogram for sykepleiere og helsefagarbeidere. 650 timer yrkesrettet norsk tilpasset norsk helsetjeneste.',
    keywords: 'helsenorsk, norsk for helsepersonell, yrkesrettet norsk, sykepleier norskopplæring, helsenorsk Alicante',
    breadcrumbName: 'Helsenorsk',
    parent: { name: 'Spansk i Alicante', path: '/spansk-i-alicante' },
    bodyExtra: '<h2>Helsenorsk: yrkesrettet norsk for helsesektoren</h2><p>Helsenorsk er et sentralt spor i Global Workings opplæringsprogram. Gjennom 650 timer med yrkesrettet norskopplæring bygger sykepleiere og helsefagarbeidere opp et fagspråk knyttet til situasjoner de vil møte i norsk helsetjeneste. Programmet inkluderer simuleringer av realistiske arbeidssituasjoner, og undervises av spanske sykepleiere som selv har jobbet i Norge.</p>',
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

// ── Navigation links for body skeleton ──────────────────────────────
const NAV_LINKS = [
  { href: '/', label: 'Hjem' },
  { href: '/vr-rekrutteringsmodell', label: 'Rekrutteringsmodell' },
  { href: '/helse', label: 'Helsesektor' },
  { href: '/spansk-i-alicante', label: 'Spansk i Alicante' },
  { href: '/spansk-i-alicante/livet-som-student', label: 'Livet som student' },
  { href: '/talentportalen', label: 'Talentportalen' },
  { href: '/om-oss', label: 'Om oss' },
  { href: '/nyheter', label: 'Nyheter' },
  { href: '/kontakt', label: 'Kontakt' },
]

const FOOTER_LINKS = [
  { href: '/vr-rekrutteringsmodell', label: 'Rekrutteringsmodell' },
  { href: '/helse', label: 'Helsesektor' },
  { href: '/spansk-i-alicante', label: 'Spansk i Alicante' },
  { href: '/talentportalen', label: 'Talentportalen' },
  { href: '/om-oss', label: 'Om oss' },
  { href: '/kontakt', label: 'Kontakt' },
  { href: '/nyheter', label: 'Nyheter' },
  { href: '/personvern', label: 'Personvern' },
  { href: '/vilkar', label: 'Vilkår' },
  { href: '/cookies', label: 'Informasjonskapsler' },
]

/**
 * Build a static body skeleton with real nav, heading, description, and footer.
 * React hydration will replace this with the full interactive UI, but crawlers
 * that don't execute JS will see meaningful content and navigation.
 */
const buildBodySkeleton = ({ h1, description, breadcrumbs, extraContent }) => {
  const nav = NAV_LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join(' ')
  const crumbs = breadcrumbs
    ? `<nav aria-label="Brødsmuler">${breadcrumbs.map((b, i) => i < breadcrumbs.length - 1 ? `<a href="${b.url}">${b.name}</a> / ` : `<span>${b.name}</span>`).join('')}</nav>`
    : ''
  const footer = FOOTER_LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join(' ')

  return `<header><a href="/" aria-label="Global Working Norge – hjem">Global Working Norge</a><nav aria-label="Hovedmeny">${nav}</nav></header><main id="main-content">${crumbs}<h1>${h1}</h1><p>${description}</p>${extraContent || ''}</main><footer><p>© ${new Date().getFullYear()} Global Working Norge AS</p><p>E-post: kontakt@globalworking.no | Telefon: +47 919 00 649</p><nav aria-label="Bunntekst">${footer}</nav></footer>`
}

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

  // Inject body skeleton — gives crawlers real content (nav, H1, description, footer)
  const h1 = route.title.split(' | ')[0]
  const body = buildBodySkeleton({ h1, description: route.description, breadcrumbs, extraContent: route.bodyExtra })
  result = result.replace('<div id="root"></div>', `<div id="root">${body}</div>`)

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

  // Inject body skeleton for article
  const breadcrumbsList = [
    { name: 'Forside', url: SITE_URL },
    { name: 'Nyheter', url: `${SITE_URL}/nyheter` },
    { name: article.title, url },
  ]
  const dateLabel = article.date ? `<time>${article.date}</time>` : ''
  const excerptHtml = article.excerpt ? `<p><em>${escapeHtml(article.excerpt)}</em></p>` : ''
  const bodyText = article.body || ''
  // Extract first ~500 chars of markdown body as plain text for crawlers
  const plainBody = bodyText
    .replace(/^---[\s\S]*?---\n?/, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .trim()
    .slice(0, 800)
  const bodyPreview = plainBody ? `<p>${escapeHtml(plainBody)}</p>` : ''
  const body = buildBodySkeleton({
    h1: article.title,
    description: article.excerpt || article.description,
    breadcrumbs: breadcrumbsList,
    extraContent: `${dateLabel}${excerptHtml}${bodyPreview}`,
  })
  result = result.replace('<div id="root"></div>', `<div id="root">${body}</div>`)

  return result
}

const loadLocalArticles = async () => {
  const files = await readdir(NEWS_DIR)
  const articles = []
  for (const file of files.filter(f => f.endsWith('.md') && !f.startsWith('_'))) {
    const raw = await readFile(path.join(NEWS_DIR, file), 'utf8')
    const meta = parseFrontmatter(raw)
    if ((meta.status || 'published') !== 'published' || !meta.slug) continue
    // Extract body (everything after frontmatter) for skeleton prerender
    const bodyMatch = raw.match(/^---[\s\S]*?---\n?([\s\S]*)/)
    meta.body = bodyMatch ? bodyMatch[1] : ''
    articles.push(meta)
  }
  return articles
}

const loadRemoteArticles = async () => {
  const url = process.env.VITE_SUPABASE_URL?.trim()
  const key = process.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) return []

  try {
    const endpoint = `${url}/rest/v1/news?status=eq.published&select=slug,title,excerpt,body,date,tag,author,coverImage,seoTitle,seoDescription,publishAt&order=publishAt.desc`
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!res.ok) {
      console.warn(`  ⚠ Supabase fetch: ${res.status} ${res.statusText}`)
      return []
    }
    const rows = await res.json()
    return rows.map((row) => ({
      slug: row.slug,
      title: row.seoTitle || row.title,
      excerpt: row.excerpt || '',
      description: row.seoDescription || row.excerpt || '',
      date: row.date || (row.publishAt ? row.publishAt.slice(0, 10) : ''),
      tag: row.tag || 'Nyhet',
      author: row.author || 'Global Working',
      coverImage: row.coverImage || '',
      body: row.body || '',
      publishAt: row.publishAt || '',
      seoTitle: row.seoTitle || '',
      seoDescription: row.seoDescription || '',
    }))
  } catch (error) {
    console.warn(`  ⚠ Supabase fetch failed: ${error.message}`)
    return []
  }
}

const loadArticles = async () => {
  const local = await loadLocalArticles()
  const remote = await loadRemoteArticles()

  // Merge: remote articles take priority over local (by slug)
  const bySlug = new Map()
  for (const article of local) bySlug.set(article.slug, article)
  for (const article of remote) bySlug.set(article.slug, article)

  console.log(`  Articles: ${local.length} local, ${remote.length} remote, ${bySlug.size} total`)
  return [...bySlug.values()]
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

  // Inject body skeleton into the root index.html (homepage)
  // This file is NOT in ROUTES, so it doesn't go through injectMeta.
  const homeSkeleton = buildBodySkeleton({
    h1: 'Rekruttering av helsepersonell og fagfolk til Norge',
    description: 'Global Working hjelper norske arbeidsgivere med rekruttering av kvalifiserte fagfolk fra Sør-Europa. Språkopplæring, integrering og dokumentert oppfølging fra første kontakt til oppstart.',
    breadcrumbs: null,
    extraContent: [
      '<h2>Våre tjenester</h2>',
      '<ul>',
      '<li><a href="/vr-rekrutteringsmodell">Rekrutteringsmodell</a> — Vi identifiserer, kvalifiserer og følger opp fagfolk fra Sør-Europa til trygge ansettelser i Norge.</li>',
      '<li><a href="/helse">Helsesektor</a> — Spesialisert rekruttering av sykepleiere og helsefagarbeidere med autorisasjonsstøtte og helsenorsk.</li>',
      '<li><a href="/spansk-i-alicante">Spansk i Alicante</a> — Samtaleassistentprogram der norske deltakere bor gratis og hjelper kandidater med norsk språktrening.</li>',
      '<li><a href="/talentportalen">Talentportalen</a> — Digital plattform der arbeidsgivere ser tilgjengelige kandidater og inviterer til intervju.</li>',
      '</ul>',
      '<h2>Hvorfor Global Working?</h2>',
      '<p>Siden 2014 har vi hjulpet over 50 norske arbeidsgivere med å rekruttere kvalifiserte fagfolk. Vårt program inkluderer språkopplæring (norsk B1–B2), kulturell forberedelse, dokumenthåndtering og tett oppfølging gjennom hele prosessen — fra første kontakt til oppstart i Norge.</p>',
      '<h2>Kontakt oss</h2>',
      '<p>E-post: kontakt@globalworking.no | Telefon: +47 919 00 649</p>',
      '<p><a href="/kontakt">Ta kontakt for spørsmål om rekruttering og samarbeid</a></p>',
    ].join(''),
  })
  let homeHtml = await readFile(INDEX_PATH, 'utf8')
  homeHtml = homeHtml.replace('<div id="root"></div>', `<div id="root">${homeSkeleton}</div>`)
  await writeFile(INDEX_PATH, homeHtml, 'utf8')

  console.log(`Prerender meta: generated ${generated} HTML files (${Object.keys(ROUTES).length} pages + ${articles.length} articles) + homepage skeleton.`)
}

run().catch((error) => {
  console.error('Failed to prerender meta:', error)
  process.exit(1)
})
