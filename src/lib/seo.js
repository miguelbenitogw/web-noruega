import siteContent from '../data/siteContent.js'

import publishedContent from '../data/publishedContent.js'

const SITE_URL = 'https://globalworking.no'
const DEFAULT_IMAGE = 'https://hahqimviirkkzkvmusga.supabase.co/storage/v1/object/public/content-media/og-image.jpg'
const SITE_NAME = 'Global Working Norge'

// ── Identidad de la entidad ──────────────────────────────────────────────────
// Espejo EXACTO de scripts/prerender-meta.mjs. Los mismos `@id`, los mismos
// nodos. Google lee el prerender, no esto; lo de aquí es lo que ve el navegador
// una vez hidratada la página. Si los dos dejan de coincidir volvemos al
// problema que ya se pagó una vez: el código dice una cosa y Google ve otra.
const ORG_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`
const ALICANTE_ID = `${SITE_URL}/#alicante`
const LOGO_ID = `${SITE_URL}/#logo`
const ORG_REF = { '@id': ORG_ID }
const NORWAY = { '@type': 'Country', name: 'Norway' }

const buildEntityNodes = () => [
  {
    '@type': 'EmploymentAgency',
    '@id': ORG_ID,
    name: SITE_NAME,
    legalName: 'Global Working Norge AS',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', '@id': LOGO_ID, url: DEFAULT_IMAGE },
    image: { '@id': LOGO_ID },
    description: 'Rekruttering og språkopplæring for kvalifiserte fagfolk fra Sør-Europa til det norske arbeidsmarkedet.',
    foundingDate: '2014',
    numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 50 },
    areaServed: NORWAY,
    knowsLanguage: ['nb-NO', 'es-ES', 'en'],
    email: 'kontakt@globalworking.no',
    telephone: '+47 919 00 649',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'kundeservice',
      email: 'kontakt@globalworking.no',
      telephone: '+47 919 00 649',
      availableLanguage: ['nb-NO', 'es-ES'],
    },
    address: [
      { '@type': 'PostalAddress', addressLocality: 'Oslo', addressCountry: 'NO' },
      {
        '@type': 'PostalAddress',
        streetAddress: 'Carrer de Periodista Pirula Arderius, 4',
        postalCode: '03001',
        addressLocality: 'Alicante',
        addressCountry: 'ES',
      },
    ],
    sameAs: [
      'https://www.linkedin.com/company/globalworking-norge',
      'https://www.instagram.com/globalworkingnorge',
      'https://www.youtube.com/@GlobalWorkingNorge',
    ],
  },
  {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'nb-NO',
    publisher: ORG_REF,
  },
  {
    '@type': 'LocalBusiness',
    '@id': ALICANTE_ID,
    name: 'Global Working – Alicante',
    url: SITE_URL,
    image: { '@id': LOGO_ID },
    description: 'Global Workings hovedkontor for rekruttering av fagfolk til Norge.',
    parentOrganization: ORG_REF,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Carrer de Periodista Pirula Arderius, 4',
      postalCode: '03001',
      addressLocality: 'Alicante',
      addressRegion: 'Comunitat Valenciana',
      addressCountry: 'ES',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 38.3452, longitude: -0.481 },
    telephone: '+47 919 00 649',
    openingHours: 'Mo-Fr 09:00-17:00',
    priceRange: '$$',
  },
]

// Nodos por ruta. `EXTRAS` va por `pathname` y es el espejo de la clave
// `extras` de cada entrada de ROUTES en el prerender.
const EXTRAS = {
  '/vr-rekrutteringsmodell': {
    kind: 'service',
    name: 'Rekruttering av helsepersonell fra utlandet',
    serviceType: 'Internasjonal rekruttering',
    summary: 'Utvelgelse, språklig og faglig kvalifisering, autorisasjon og oppfølging frem til første arbeidsdag i Norge.',
    audienceType: 'Norske arbeidsgivere',
  },
  '/helse': {
    kind: 'service',
    name: 'Rekruttering av sykepleiere og helsefagarbeidere til Norge',
    serviceType: 'Rekruttering av helsepersonell',
    summary: 'Vi finner, forbereder og følger opp utenlandske sykepleiere og helsefagarbeidere til norske kommuner og sykehus — med språk, autorisasjon og trygg oppstart.',
    audienceType: 'Norske kommuner, sykehus og sykehjem',
  },
  '/spansk-i-alicante/helsenorsk': {
    kind: 'course',
    name: 'Helsenorsk – yrkesrettet norsk for helsesektoren',
    summary: 'Yrkesrettet norskopplæring for sykepleiere og helsefagarbeidere, tilpasset hverdagen i norsk helsetjeneste.',
    teaches: 'Yrkesrettet norsk for helsesektoren: fagterminologi, pasientkommunikasjon og faglig dokumentasjon',
    timeRequired: 'PT650H',
    courseMode: 'blended',
    audienceType: 'Sykepleiere og helsefagarbeidere',
  },
  '/om-oss': { kind: 'faq' },
}

const buildServiceNode = (extras, url) => ({
  '@type': 'Service',
  '@id': `${url}#service`,
  name: extras.name,
  serviceType: extras.serviceType,
  description: extras.summary,
  provider: ORG_REF,
  areaServed: NORWAY,
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: url,
    servicePhone: '+47 919 00 649',
    serviceLocation: { '@id': ALICANTE_ID },
  },
  audience: { '@type': 'Audience', audienceType: extras.audienceType },
})

const buildCourseNode = (extras, url) => ({
  '@type': 'Course',
  '@id': `${url}#course`,
  name: extras.name,
  description: extras.summary,
  provider: ORG_REF,
  inLanguage: 'nb-NO',
  teaches: extras.teaches,
  timeRequired: extras.timeRequired,
  audience: { '@type': 'Audience', audienceType: extras.audienceType },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: extras.courseMode,
    courseWorkload: extras.timeRequired,
    location: { '@id': ALICANTE_ID },
    inLanguage: 'nb-NO',
  },
})

// Las preguntas salen de publishedContent, las MISMAS que pinta <FAQ /> en
// /om-oss. Las respuestas vienen en markdown y se aplanan: un `[texto](url)`
// dentro de `acceptedAnswer.text` se lee literal, con corchetes y todo.
const flattenAnswer = (raw) => String(raw ?? '')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/[*_`#>]/g, '')
  .split(/\s*\n+\s*/)
  .map((line) => line.trim())
  .filter(Boolean)
  .join(' ')
  .replace(/\s{2,}/g, ' ')
  .trim()

const buildFaqNode = (url) => {
  const items = publishedContent?.faq?.items
  if (!Array.isArray(items)) return null
  const questions = items
    .map((item) => ({ q: String(item?.q ?? '').trim(), a: flattenAnswer(item?.a) }))
    .filter((item) => item.q && item.a)
  if (questions.length === 0) return null
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: questions.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

const buildExtraNodes = (pathname, url) => {
  const extras = EXTRAS[pathname]
  if (!extras) return []
  if (extras.kind === 'service') return [buildServiceNode(extras, url)]
  if (extras.kind === 'course') return [buildCourseNode(extras, url)]
  if (extras.kind === 'faq') {
    const faq = buildFaqNode(url)
    return faq ? [faq] : []
  }
  return []
}

const DEFAULT_SEO = {
  // LA PALABRA QUE BUSCA EL CLIENTE VA PRIMERO, LA MARCA AL FINAL.
  // Antes empezaba por "Global Working Norge", y los primeros caracteres de un título son
  // los que más pesan tanto para Google como para el que decide si hace clic. Gastarlos en
  // el nombre propio solo sirve si ya te conocen — y el 94% de los clics de esta web ya
  // eran de gente que la conocía. El problema no era la marca: era que no había nada para
  // los que NO la conocen.
  title: 'Rekruttering av sykepleiere fra utlandet | Global Working Norge',
  description:
    'Vi rekrutterer sykepleiere og helsefagarbeidere fra Sør-Europa til norske kommuner og sykehus. 650 timer helsenorsk, hjelp med autorisasjon og oppfølging helt frem til oppstart.',
  pathname: '/',
  image: DEFAULT_IMAGE,
  type: 'website',
}

const SECTION_SEO = {
  rekruttering: {
    // "Vår rekrutteringsmodell" habla de nosotros. `hvordan rekruttere helsepersonell` es
    // una búsqueda real, y "Slik ..." es la forma noruega de responder a un "cómo".
    title: 'Slik rekrutterer du helsepersonell fra utlandet | Global Working',
    description:
      'Hvordan rekruttere helsepersonell fra utlandet? Se hele prosessen steg for steg: utvelgelse, 650 timer helsenorsk, autorisasjon og oppfølging frem til første arbeidsdag.',
    pathname: '/vr-rekrutteringsmodell',
    breadcrumbName: 'Rekrutteringsmodell',
    keywords: 'hvordan rekruttere helsepersonell, internasjonal rekruttering, rekruttering av sykepleiere, arbeidsinnvandring',
  },
  helse: {
    // "Helsesektor" describe el sector, no lo que alguien escribe cuando tiene el problema.
    // Nadie busca "helsesektor" para contratar a nadie.
    title: 'Rekruttering av sykepleiere til Norge | Global Working',
    description:
      'Mangel på sykepleiere? Vi finner, forbereder og følger opp utenlandske sykepleiere og helsefagarbeidere til norske kommuner og sykehus — med språk, autorisasjon og trygg oppstart.',
    pathname: '/helse',
    breadcrumbName: 'Helsesektor',
    keywords: 'rekruttering av sykepleiere, utenlandske sykepleiere i Norge, rekrutteringsbyrå helsepersonell, mangel på sykepleiere',
  },
  nyheter: {
    title: 'Nyheter & artikler | Global Working Norge',
    description:
      'Følg siste nytt, artikler og oppdateringer fra Global Working om rekruttering, språk og arbeidsliv i Norge.',
    pathname: '/nyheter',
    // Es un índice de artículos, no una página de contenido: CollectionPage.
    schemaType: 'CollectionPage',
    breadcrumbName: 'Nyheter',
    keywords: 'Global Working nyheter, rekruttering nyheter Norge, arbeidsliv Norge',
  },
  talentportalen: {
    // "Talentportalen" es el nombre interno del producto. En Search Console la gente la
    // encuentra buscando `kandidatportalen` (12 apariciones, puesto 7) — o sea, buscan la
    // palabra genérica. El nombre propio se queda, pero detrás de la que se busca.
    title: 'Kandidatportal for norske arbeidsgivere | Global Working',
    description:
      'Talentportalen er vår kandidatportal: se tilgjengelige sykepleiere og helsefagarbeidere med dokumentert norsknivå, og inviter til intervju direkte.',
    pathname: '/talentportalen',
    breadcrumbName: 'Talentportalen',
    keywords: 'kandidatportal, kandidatportalen, talentportalen, tilgjengelige sykepleiere, rekrutteringsportal',
  },
  'om-oss': {
    // `rekrutteringsbyrå helse` y `rekrutteringsbyrå helsepersonell` son búsquedas reales.
    // "Om oss" a secas no las capta ninguna.
    title: 'Rekrutteringsbyrå for helsesektoren | Global Working Norge',
    description:
      'Global Working er et rekrutteringsbyrå spesialisert på helsepersonell fra Sør-Europa. Møt teamet og se hvordan vi jobber med språk, autorisasjon og kvalitet.',
    pathname: '/om-oss',
    schemaType: 'AboutPage',
    breadcrumbName: 'Om oss',
    keywords: 'rekrutteringsbyrå helsepersonell, rekrutteringsbyrå helse, om Global Working, internasjonal rekruttering',
  },
  kontakt: {
    title: 'Kontakt oss om rekruttering av helsepersonell | Global Working',
    description:
      'Trenger dere sykepleiere eller helsefagarbeidere? Ta kontakt for en uforpliktende samtale om rekruttering, samarbeid eller kandidatportalen.',
    pathname: '/kontakt',
    schemaType: 'ContactPage',
    breadcrumbName: 'Kontakt',
    keywords: 'kontakt Global Working, rekruttering kontakt, samarbeid Norge',
  },
  'spansk-i-alicante': {
    title: 'Spansk i Alicante | Global Working Norge',
    description:
      'Bo gratis i Alicante og bli samtaleassistent i et internasjonalt miljø gjennom Spansk i Alicante-programmet.',
    pathname: '/spansk-i-alicante',
    breadcrumbName: 'Spansk i Alicante',
    keywords: 'spansk i Alicante, samtaleassistent, språkopphold Spania, bo gratis Alicante',
  },
  'spansk-i-alicante-hvorfor': {
    title: 'Hvorfor finnes Spansk i Alicante? | Global Working Norge',
    description:
      'Lær hvorfor Spansk i Alicante er en viktig del av Global Working sin forberedelse av fagfolk til jobb i Norge.',
    pathname: '/spansk-i-alicante/hvorfor',
    breadcrumbName: 'Hvorfor Spansk i Alicante',
    parentSection: 'spansk-i-alicante',
    keywords: 'hvorfor Spansk i Alicante, språkforberedelse fagfolk, Global Working Alicante',
  },
  'spansk-i-alicante-livet-som-student': {
    title: 'Livet som student i Alicante | Global Working Norge',
    description:
      'Slik er hverdagen for kandidatene våre i Alicante: undervisning, helsenorsk, samtaleassistenter og sosialt fellesskap.',
    pathname: '/spansk-i-alicante/livet-som-student',
    breadcrumbName: 'Livet som student',
    parentSection: 'spansk-i-alicante',
    keywords: 'livet som student Alicante, hverdagen i Alicante, helsenorsk, samtaleassistenter, sosialt fellesskap',
  },
  'spansk-i-alicante-helsenorsk': {
    title: 'Helsenorsk – Yrkesrettet norsk for helsesektoren | Global Working Norge',
    description:
      'Helsenorsk er Global Workings spesialiserte språkprogram for sykepleiere og helsefagarbeidere. 650 timer yrkesrettet norsk tilpasset norsk helsetjeneste.',
    pathname: '/spansk-i-alicante/helsenorsk',
    breadcrumbName: 'Helsenorsk',
    parentSection: 'spansk-i-alicante',
    keywords: 'helsenorsk, norsk for helsepersonell, yrkesrettet norsk, sykepleier norskopplæring, helsenorsk Alicante',
  },
  personvern: {
    title: 'Personvern | Global Working Norge',
    description:
      'Les hvordan Global Working Norge behandler personopplysninger, formål, lagringstid og dine rettigheter.',
    pathname: '/personvern',
    breadcrumbName: 'Personvern',
  },
  vilkar: {
    title: 'Vilkår | Global Working Norge',
    description:
      'Vilkår for bruk av nettstedet og tjenester fra Global Working Norge, inkludert ansvar og kontaktinformasjon.',
    pathname: '/vilkar',
    breadcrumbName: 'Vilkår',
  },
  cookies: {
    title: 'Informasjonskapsler | Global Working Norge',
    description:
      'Informasjon om hvilke cookies vi bruker, hvorfor vi bruker dem og hvordan du kan administrere samtykke.',
    pathname: '/cookies',
    breadcrumbName: 'Informasjonskapsler',
  },
}

const NOT_FOUND_SEO = {
  title: 'Siden ble ikke funnet | Global Working Norge',
  description: 'Siden du lette etter finnes ikke.',
  pathname: '/',
}

const ensureMeta = (attr, key, value) => {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector(selector)

  if (!value) {
    if (el) el.remove()
    return
  }

  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }

  el.setAttribute('content', value)
}

const getCanonicalUrl = (pathname = '/') => {
  const normalized = pathname && pathname !== '/' ? pathname.replace(/\/+$/, '') || '/' : '/'
  return `${SITE_URL}${normalized}`
}

const setCanonical = (url) => {
  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', url)
}

const setPageSEO = ({
  title,
  description,
  pathname = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  robots,
}) => {
  document.title = title
  ensureMeta('name', 'description', description)
  ensureMeta('property', 'og:type', type)
  ensureMeta('property', 'og:url', getCanonicalUrl(pathname))
  ensureMeta('property', 'og:title', title)
  ensureMeta('property', 'og:description', description)
  ensureMeta('property', 'og:image', image)
  ensureMeta('name', 'twitter:card', 'summary')
  ensureMeta('name', 'twitter:title', title)
  ensureMeta('name', 'twitter:description', description)
  ensureMeta('name', 'twitter:image', image)
  ensureMeta('name', 'robots', robots)
  setCanonical(getCanonicalUrl(pathname))
}

const clearJsonLd = (id) => {
  const old = document.getElementById(id)
  if (old) old.remove()
}

const setJsonLd = (id, payload) => {
  clearJsonLd(id)
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(payload)
  document.head.appendChild(script)
}

const buildBreadcrumbNode = (items, url) => ({
  '@type': 'BreadcrumbList',
  '@id': `${url}#breadcrumb`,
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
})

/** Un solo <script> con todos los nodos y sus relaciones. */
const setGraph = (nodes) => setJsonLd('page-schema', {
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
})

/**
 * `WebPage` es el tipo genérico, el "por defecto" de schema.org. Decirle a Google que
 * /kontakt es una ContactPage y /om-oss una AboutPage no es decorar: son los tipos que
 * usa para entender qué ENTIDAD describe la página (la organización, sus datos de
 * contacto) en vez de tratarla como un documento cualquiera. `type` llega desde
 * `schemaType` en SECTION_SEO, y si la sección no lo declara se queda en WebPage.
 */
const buildWebPageNode = ({ title, description, url, type = 'WebPage', hasBreadcrumb, extraNodes = [] }) => {
  const faq = extraNodes.find((n) => n['@type'] === 'FAQPage')
  const subject = extraNodes.find((n) => n['@type'] === 'Service' || n['@type'] === 'Course')
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    name: title,
    description,
    url,
    inLanguage: 'nb-NO',
    isPartOf: { '@id': WEBSITE_ID },
    about: ORG_REF,
    primaryImageOfPage: { '@id': LOGO_ID },
    ...(hasBreadcrumb ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
    ...(faq ? { mainEntity: { '@id': faq['@id'] } }
      : subject ? { mainEntity: { '@id': subject['@id'] } }
        : {}),
  }
}

// Provider-specific URL helpers for VideoObject schema. Mirrors VideoCarousel's
// PROVIDERS map so the structured data stays in sync with what we embed.
const VIDEO_SCHEMA_PROVIDERS = {
  youtube: {
    thumb: (id) => `https://i.ytimg.com/vi/${id}/oardefault.jpg`,
    embed: (id) => `https://www.youtube.com/embed/${id}`,
    watch: (id) => `https://www.youtube.com/watch?v=${id}`,
  },
  vimeo: {
    thumb: () => null,
    embed: (id) => `https://player.vimeo.com/video/${id}`,
    watch: (id) => `https://vimeo.com/${id}`,
  },
}

const buildVideoNodes = () => {
  const data = siteContent.homeVideos
  const items = Array.isArray(data?.items) ? data.items.filter((it) => it && it.id) : []
  if (items.length === 0) return []

  const builder = VIDEO_SCHEMA_PROVIDERS[data.provider] || VIDEO_SCHEMA_PROVIDERS.youtube

  return items.map((item) => ({
    '@type': 'VideoObject',
    '@id': `${SITE_URL}/#video-${item.id}`,
    name: item.title || data.heading || SITE_NAME,
    description: item.description || data.description || DEFAULT_SEO.description,
    thumbnailUrl: [item.poster || builder.thumb(item.id) || DEFAULT_IMAGE],
    uploadDate: item.uploadDate || '2026-06-17',
    contentUrl: builder.watch(item.id),
    embedUrl: builder.embed(item.id),
    publisher: ORG_REF,
  }))
}

/**
 * Ahora todo va en UN solo <script id="page-schema">, el del `@graph`. Los
 * otros tres ids son de cuando cada cosa tenía su propio bloque; se siguen
 * limpiando porque esto es una SPA: al navegar de /helse a /om-oss sin recargar
 * no hay head nuevo, y un nodo que no se borre se queda describiendo la página
 * anterior. Si alguna vez quedó uno de los antiguos en el DOM, esto lo barre.
 */
const clearAllDynamicSchemas = () => {
  clearJsonLd('page-schema')
  clearJsonLd('news-article-schema')
  clearJsonLd('breadcrumb-schema')
  clearJsonLd('home-videos-schema')
}

export function setDefaultSEO() {
  setPageSEO(DEFAULT_SEO)
  clearAllDynamicSchemas()

  const url = `${SITE_URL}/`
  setGraph([
    ...buildEntityNodes(),
    buildWebPageNode({
      title: DEFAULT_SEO.title,
      description: DEFAULT_SEO.description,
      url,
    }),
    ...buildVideoNodes(),
  ])
}

export function setSectionSEO(sectionRoute) {
  const page = SECTION_SEO[sectionRoute]
  if (!page) {
    setDefaultSEO()
    return
  }

  setPageSEO(page)
  if (page.keywords) {
    ensureMeta('name', 'keywords', page.keywords)
  }
  clearAllDynamicSchemas()

  const url = getCanonicalUrl(page.pathname)

  const breadcrumbItems = [{ name: 'Forside', url: SITE_URL }]
  if (page.parentSection) {
    const parent = SECTION_SEO[page.parentSection]
    if (parent) {
      breadcrumbItems.push({
        name: parent.breadcrumbName,
        url: getCanonicalUrl(parent.pathname),
      })
    }
  }
  breadcrumbItems.push({ name: page.breadcrumbName, url })

  const extraNodes = buildExtraNodes(page.pathname, url)
  setGraph([
    ...buildEntityNodes(),
    buildWebPageNode({
      title: page.title,
      description: page.description,
      url,
      type: page.schemaType,
      hasBreadcrumb: true,
      extraNodes,
    }),
    buildBreadcrumbNode(breadcrumbItems, url),
    ...extraNodes,
  ])
}

export function setNotFoundSEO(pathname = '/') {
  setPageSEO({
    ...NOT_FOUND_SEO,
    pathname,
    robots: 'noindex, nofollow',
  })
  clearAllDynamicSchemas()
}

export function setArticleSEO(article) {
  const url = `${SITE_URL}/nyheter/${article.slug}`
  const title = article.seoTitle || article.title
  const description = article.seoDescription || article.excerpt
  const image = article.coverImage || DEFAULT_IMAGE

  setPageSEO({
    title: `${title} | Global Working`,
    description,
    pathname: `/nyheter/${article.slug}`,
    image,
    type: 'article',
  })
  clearAllDynamicSchemas()

  // `datePublished` siempre; `dateModified` SOLO si hay una fecha de edición real y
  // distinta. Antes caía a `publishAt`, así que los dos campos salían idénticos en los 10
  // artículos: eso no es información, es ruido. Un `dateModified` igual al de publicación
  // no dice "no se ha editado", dice "no sé", y si algún día se edita uno de verdad la
  // señal ya no vale nada. Ausente, Google asume que no se ha tocado desde que salió, que
  // es exactamente la verdad: ningún `.md` de `src/content/news/` tiene hoy `updatedAt`.
  const datePublished = article.publishAt || `${article.date}T08:00:00Z`
  const dateModified =
    article.updatedAt && article.updatedAt !== datePublished ? article.updatedAt : null

  const crumbs = [
    { name: 'Forside', url: SITE_URL },
    { name: 'Nyheter', url: `${SITE_URL}/nyheter` },
    { name: article.title, url },
  ]

  setGraph([
    ...buildEntityNodes(),
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      name: `${title} | Global Working`,
      description,
      url,
      inLanguage: 'nb-NO',
      isPartOf: { '@id': WEBSITE_ID },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      primaryImageOfPage: { '@type': 'ImageObject', url: image },
      mainEntity: { '@id': `${url}#article` },
    },
    {
    // `Article`, no `NewsArticle`. NewsArticle es para medios de comunicación, y Global
    // Working es una empresa de reclutamiento: lo que publica son notas de empresa y
    // entrevistas a clientes. Declararse medio no da ninguna ventaja fuera de Google News
    // —donde no está ni va a estar, eso exige alta en Publisher Center— y sí expone a que
    // Google vea un desajuste entre el tipo declarado y el contenido real. `BlogPosting`
    // se descartó por lo mismo en espejo: esto no es un blog personal ni editorial, la
    // propia sección se llama "Nyheter & artikler". `Article` es el padre de los dos y
    // describe lo que hay sin afirmar nada que no sea cierto.
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: article.title,
      description,
      datePublished,
      ...(dateModified ? { dateModified } : {}),
      // `author` y `publisher` apuntan al mismo nodo que el resto del sitio en
      // vez de repetir una Organization anónima por artículo: diez copias
      // sueltas de «Global Working» pueden ser diez empresas distintas para un
      // buscador, y ninguna de las diez hereda la autoridad de la de verdad.
      author: ORG_REF,
      publisher: ORG_REF,
      // Un objeto, no una cadena pelada: `mainEntityOfPage` espera una entidad.
      mainEntityOfPage: { '@id': `${url}#webpage` },
      isPartOf: { '@id': `${url}#webpage` },
      inLanguage: 'nb-NO',
      image: [image],
    },
    buildBreadcrumbNode(crumbs, url),
  ])
}
