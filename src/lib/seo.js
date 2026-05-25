const SITE_URL = 'https://globalworking.no'
const DEFAULT_IMAGE = 'https://hahqimviirkkzkvmusga.supabase.co/storage/v1/object/public/content-media/og-image.jpg'
const SITE_NAME = 'Global Working Norge'

const DEFAULT_SEO = {
  title: 'Global Working Norge | Rekruttering av helsepersonell og fagfolk til Norge',
  description:
    'Global Working hjelper norske arbeidsgivere med rekruttering av kvalifiserte fagfolk fra Sør-Europa. Språkopplæring, integrering og dokumentert oppfølging fra første kontakt til oppstart.',
  pathname: '/',
  image: DEFAULT_IMAGE,
  type: 'website',
}

const SECTION_SEO = {
  rekruttering: {
    title: 'Vår rekrutteringsmodell | Global Working Norge',
    description:
      'Se hvordan vi rekrutterer, forbereder og følger opp fagfolk fra Sør-Europa til trygg oppstart i Norge.',
    pathname: '/vr-rekrutteringsmodell',
    breadcrumbName: 'Rekrutteringsmodell',
    keywords: 'rekruttering Norge, fagfolk fra Europa, internasjonal rekruttering, arbeidsinnvandring',
  },
  helse: {
    title: 'Helsesektor | Global Working Norge',
    description:
      'Vi forbereder helsepersonell for den norske helsesektoren med språk, faglig oppfølging og strukturert overgang til jobb.',
    pathname: '/helse',
    breadcrumbName: 'Helsesektor',
    keywords: 'helsepersonell Norge, sykepleiere rekruttering, helsesektor bemanning, autorisasjon helsepersonell',
  },
  nyheter: {
    title: 'Nyheter & artikler | Global Working Norge',
    description:
      'Følg siste nytt, artikler og oppdateringer fra Global Working om rekruttering, språk og arbeidsliv i Norge.',
    pathname: '/nyheter',
    breadcrumbName: 'Nyheter',
    keywords: 'Global Working nyheter, rekruttering nyheter Norge, arbeidsliv Norge',
  },
  talentportalen: {
    title: 'Talentportalen | Global Working Norge',
    description:
      'Se tilgjengelige kandidater og inviter til intervju direkte gjennom vår kandidatportal.',
    pathname: '/talentportalen',
    breadcrumbName: 'Talentportalen',
    keywords: 'kandidatportal, tilgjengelige kandidater Norge, rekrutteringsportal',
  },
  'om-oss': {
    title: 'Om oss | Global Working Norge',
    description:
      'Lær mer om Global Working, teamet vårt og hvordan vi jobber med språk, kvalitet og internasjonal rekruttering.',
    pathname: '/om-oss',
    breadcrumbName: 'Om oss',
    keywords: 'Global Working team, om Global Working, rekrutteringsbyrå Norge',
  },
  kontakt: {
    title: 'Kontakt | Global Working Norge',
    description:
      'Ta kontakt for spørsmål om rekruttering, samarbeid eller kandidatportalen.',
    pathname: '/kontakt',
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

const buildWebPageSchema = ({ title, description, url, image }) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
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

const clearAllDynamicSchemas = () => {
  clearJsonLd('news-article-schema')
  clearJsonLd('page-schema')
  clearJsonLd('breadcrumb-schema')
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

  setJsonLd('news-article-schema', {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description,
    datePublished: article.publishAt || `${article.date}T08:00:00Z`,
    dateModified: article.updatedAt || article.publishAt || `${article.date}T08:00:00Z`,
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
