const SITE_URL = 'https://globalworking.no'
const DEFAULT_IMAGE = 'https://globalworking.net/wp-content/uploads/2025/12/cropped-GlobalWorking-Logotipo-Principal-vertical-cuadrado-scaled-1.jpg'

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
  },
  helse: {
    title: 'Helsesektor | Global Working Norge',
    description:
      'Vi forbereder helsepersonell for den norske helsesektoren med språk, faglig oppfølging og strukturert overgang til jobb.',
    pathname: '/helse',
  },
  nyheter: {
    title: 'Nyheter & artikler | Global Working Norge',
    description:
      'Følg siste nytt, artikler og oppdateringer fra Global Working om rekruttering, språk og arbeidsliv i Norge.',
    pathname: '/nyheter',
  },
  talentportalen: {
    title: 'Talentportalen | Global Working Norge',
    description:
      'Se tilgjengelige kandidater og inviter til intervju direkte gjennom vår kandidatportal.',
    pathname: '/talentportalen',
  },
  'om-oss': {
    title: 'Om oss | Global Working Norge',
    description:
      'Lær mer om Global Working, teamet vårt og hvordan vi jobber med språk, kvalitet og internasjonal rekruttering.',
    pathname: '/om-oss',
  },
  kontakt: {
    title: 'Kontakt | Global Working Norge',
    description:
      'Ta kontakt for spørsmål om rekruttering, samarbeid eller kandidatportalen.',
    pathname: '/kontakt',
  },
  personvern: {
    title: 'Personvern | Global Working Norge',
    description:
      'Les hvordan Global Working Norge behandler personopplysninger, formål, lagringstid og dine rettigheter.',
    pathname: '/personvern',
  },
  vilkar: {
    title: 'Vilkår | Global Working Norge',
    description:
      'Vilkår for bruk av nettstedet og tjenester fra Global Working Norge, inkludert ansvar og kontaktinformasjon.',
    pathname: '/vilkar',
  },
  cookies: {
    title: 'Informasjonskapsler | Global Working Norge',
    description:
      'Informasjon om hvilke cookies vi bruker, hvorfor vi bruker dem og hvordan du kan administrere samtykke.',
    pathname: '/cookies',
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
  ensureMeta('name', 'twitter:card', 'summary_large_image')
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

export function setDefaultSEO() {
  setPageSEO(DEFAULT_SEO)
  clearJsonLd('news-article-schema')
}

export function setSectionSEO(sectionRoute) {
  const page = SECTION_SEO[sectionRoute]
  if (!page) {
    setDefaultSEO()
    return
  }

  setPageSEO(page)
  clearJsonLd('news-article-schema')
}

export function setNotFoundSEO(pathname = '/') {
  setPageSEO({
    ...NOT_FOUND_SEO,
    pathname,
    robots: 'noindex, nofollow',
  })
  clearJsonLd('news-article-schema')
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

  setJsonLd('news-article-schema', {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description,
    datePublished: article.publishAt || `${article.date}T08:00:00Z`,
    dateModified: article.publishAt || `${article.date}T08:00:00Z`,
    author: {
      '@type': 'Organization',
      name: article.author || 'Global Working',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Global Working Norge',
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_IMAGE,
      },
    },
    mainEntityOfPage: url,
    image: [image],
  })
}
