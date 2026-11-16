import siteContent from '../data/siteContent'

const SITE_URL = 'https://globalworking.no'
const DEFAULT_IMAGE = 'https://hahqimviirkkzkvmusga.supabase.co/storage/v1/object/public/content-media/og-image.jpg'
const SITE_NAME = 'Global Working Norge'

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

const buildBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
})

/**
 * `WebPage` es el tipo genérico, el "por defecto" de schema.org. Decirle a Google que
 * /kontakt es una ContactPage y /om-oss una AboutPage no es decorar: son los tipos que
 * usa para entender qué ENTIDAD describe la página (la organización, sus datos de
 * contacto) en vez de tratarla como un documento cualquiera. `type` llega desde
 * `schemaType` en SECTION_SEO, y si la sección no lo declara se queda en WebPage.
 */
const buildWebPageSchema = ({ title, description, url, image, type = 'WebPage' }) => ({
  '@context': 'https://schema.org',
  '@type': type,
  name: title,
  description,
  url,
  image,
  inLanguage: 'nb-NO',
  isPartOf: {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  },
})

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

const buildHomeVideosSchema = () => {
  const data = siteContent.homeVideos
  const items = Array.isArray(data?.items) ? data.items.filter((it) => it && it.id) : []
  if (items.length === 0) return null

  const builder = VIDEO_SCHEMA_PROVIDERS[data.provider] || VIDEO_SCHEMA_PROVIDERS.youtube

  return {
    '@context': 'https://schema.org',
    '@graph': items.map((item) => ({
      '@type': 'VideoObject',
      name: item.title || data.heading || SITE_NAME,
      description: item.description || data.description || DEFAULT_SEO.description,
      thumbnailUrl: [item.poster || builder.thumb(item.id) || DEFAULT_IMAGE],
      uploadDate: item.uploadDate || '2026-06-17',
      contentUrl: builder.watch(item.id),
      embedUrl: builder.embed(item.id),
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: DEFAULT_IMAGE },
      },
    })),
  }
}

const clearAllDynamicSchemas = () => {
  clearJsonLd('news-article-schema')
  clearJsonLd('page-schema')
  clearJsonLd('breadcrumb-schema')
  clearJsonLd('home-videos-schema')
}

export function setDefaultSEO() {
  setPageSEO(DEFAULT_SEO)
  clearAllDynamicSchemas()

  setJsonLd('page-schema', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_SEO.description,
    inLanguage: 'nb-NO',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  })

  const videosSchema = buildHomeVideosSchema()
  if (videosSchema) setJsonLd('home-videos-schema', videosSchema)
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
  setJsonLd('page-schema', buildWebPageSchema({
    title: page.title,
    description: page.description,
    url,
    image: DEFAULT_IMAGE,
    type: page.schemaType,
  }))

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
  setJsonLd('breadcrumb-schema', buildBreadcrumbSchema(breadcrumbItems))
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

  setJsonLd('news-article-schema', {
    '@context': 'https://schema.org',
    // `Article`, no `NewsArticle`. NewsArticle es para medios de comunicación, y Global
    // Working es una empresa de reclutamiento: lo que publica son notas de empresa y
    // entrevistas a clientes. Declararse medio no da ninguna ventaja fuera de Google News
    // —donde no está ni va a estar, eso exige alta en Publisher Center— y sí expone a que
    // Google vea un desajuste entre el tipo declarado y el contenido real. `BlogPosting`
    // se descartó por lo mismo en espejo: esto no es un blog personal ni editorial, la
    // propia sección se llama "Nyheter & artikler". `Article` es el padre de los dos y
    // describe lo que hay sin afirmar nada que no sea cierto.
    '@type': 'Article',
    headline: article.title,
    description,
    datePublished,
    ...(dateModified ? { dateModified } : {}),
    author: {
      '@type': 'Organization',
      name: article.author || 'Global Working',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_IMAGE,
      },
    },
    mainEntityOfPage: url,
    image: [image],
  })

  setJsonLd('breadcrumb-schema', buildBreadcrumbSchema([
    { name: 'Forside', url: SITE_URL },
    { name: 'Nyheter', url: `${SITE_URL}/nyheter` },
    { name: article.title, url },
  ]))
}
