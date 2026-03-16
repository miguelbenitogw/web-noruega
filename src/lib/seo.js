const SITE_URL = 'https://globalworking.no'
const DEFAULT_IMAGE = 'https://globalworking.net/wp-content/uploads/2025/12/cropped-GlobalWorking-Logotipo-Principal-vertical-cuadrado-scaled-1.jpg'

const DEFAULT_SEO = {
  title: 'Global Working Norge | Rekruttering av helsepersonell og fagfolk til Norge',
  description:
    'Global Working hjelper norske arbeidsgivere med rekruttering av kvalifiserte fagfolk fra Sør-Europa. Språkopplæring, integrering og dokumentert oppfølging fra første kontakt til oppstart.',
  url: `${SITE_URL}/`,
  image: DEFAULT_IMAGE,
  type: 'website',
}

const ensureMeta = (attr, key, value) => {
  if (!value) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
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
  document.title = DEFAULT_SEO.title
  ensureMeta('name', 'description', DEFAULT_SEO.description)
  ensureMeta('property', 'og:type', 'website')
  ensureMeta('property', 'og:url', DEFAULT_SEO.url)
  ensureMeta('property', 'og:title', DEFAULT_SEO.title)
  ensureMeta('property', 'og:description', DEFAULT_SEO.description)
  ensureMeta('property', 'og:image', DEFAULT_SEO.image)
  ensureMeta('name', 'twitter:card', 'summary_large_image')
  ensureMeta('name', 'twitter:title', DEFAULT_SEO.title)
  ensureMeta('name', 'twitter:description', DEFAULT_SEO.description)
  ensureMeta('name', 'twitter:image', DEFAULT_SEO.image)
  setCanonical(DEFAULT_SEO.url)
  clearJsonLd('news-article-schema')
}

export function setArticleSEO(article) {
  const url = `${SITE_URL}/nyheter/${article.slug}`
  const title = article.seoTitle || article.title
  const description = article.seoDescription || article.excerpt
  const image = article.coverImage || DEFAULT_IMAGE

  document.title = `${title} | Global Working`
  ensureMeta('name', 'description', description)
  ensureMeta('property', 'og:type', 'article')
  ensureMeta('property', 'og:url', url)
  ensureMeta('property', 'og:title', title)
  ensureMeta('property', 'og:description', description)
  ensureMeta('property', 'og:image', image)
  ensureMeta('name', 'twitter:card', 'summary_large_image')
  ensureMeta('name', 'twitter:title', title)
  ensureMeta('name', 'twitter:description', description)
  ensureMeta('name', 'twitter:image', image)
  setCanonical(url)

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
