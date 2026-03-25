import { getMarkdownSections } from '../components/MarkdownArticle'

const field = (path, label, description) => ({ path, label, description })

const section = (id, label, options = {}) => ({
  id,
  label,
  description: options.description || '',
  fields: options.fields || [],
  sectionIndex: options.sectionIndex,
  anchorId: options.anchorId || null,
  scrollToTop: Boolean(options.scrollToTop),
})

export const ADMIN_PREVIEW_MODES = [
  { id: 'landing', label: 'Landing', path: '/' },
  { id: 'nyheter', label: 'Noticias', path: '/nyheter' },
  { id: 'helse', label: 'Helse', path: '/helse' },
  { id: 'article', label: 'Artículo', path: '/nyheter' },
]

const buildLandingSections = (articles) => {
  const featuredArticle = articles[0]
  const secondaryArticle = articles[1]

  return [
    section('landing-hero', 'Hero', {
      scrollToTop: true,
      description: 'El primer impacto. Badge, título, descripción, CTAs y stats.',
      fields: [
        field('hero.badge', 'Badge'),
        field('hero.h1First', 'Título · parte 1'),
        field('hero.h1Highlight', 'Título · destacado'),
        field('hero.description', 'Descripción'),
        field('hero.cta1', 'CTA primaria'),
        field('hero.cta2', 'CTA secundaria'),
        field('hero.stats.0.value', 'Stat 1 · valor'),
        field('hero.stats.0.label', 'Stat 1 · etiqueta'),
      ],
    }),
    section('landing-services', 'Servicios', {
      sectionIndex: 1,
      description: 'Resumen principal de la propuesta de valor.',
      fields: [
        field('homeServices.label', 'Eyebrow'),
        field('homeServices.heading', 'Título'),
        field('homeServices.description', 'Descripción'),
        field('homeServices.sections.0.title', 'Card 1 · título'),
        field('homeServices.sections.0.description', 'Card 1 · descripción'),
        field('homeServices.sections.1.title', 'Card 2 · título'),
      ],
    }),
    section('landing-health', 'Bloque Helse', {
      sectionIndex: 2,
      description: 'Sección oscura que empuja al vertical sanitario.',
      fields: [
        field('homeHealth.label', 'Eyebrow'),
        field('homeHealth.heading', 'Título'),
        field('homeHealth.description', 'Descripción'),
        field('homeHealth.cta', 'CTA'),
        field('homeStats.0.value', 'Stat 1 · valor'),
        field('homeStats.0.label', 'Stat 1 · etiqueta'),
      ],
    }),
    section('landing-news', 'Últimas noticias', {
      sectionIndex: 3,
      description: 'Preview editorial de landing.',
      fields: [
        field(featuredArticle ? `news.${featuredArticle.slug}.tag` : 'news.{slug}.tag', 'Destacada · tag'),
        field(featuredArticle ? `news.${featuredArticle.slug}.title` : 'news.{slug}.title', 'Destacada · título'),
        field(featuredArticle ? `news.${featuredArticle.slug}.excerpt` : 'news.{slug}.excerpt', 'Destacada · extracto'),
        field(secondaryArticle ? `news.${secondaryArticle.slug}.title` : 'news.{slug}.title', 'Card 2 · título'),
      ],
    }),
    section('landing-cta', 'CTA banner', {
      sectionIndex: 4,
      fields: [
        field('ctaBanner.badge', 'Badge'),
        field('ctaBanner.heading', 'Título'),
        field('ctaBanner.description', 'Descripción'),
        field('ctaBanner.cta', 'CTA'),
      ],
    }),
    section('landing-contact', 'Contacto rápido', {
      sectionIndex: 5,
      fields: [
        field('homeContact.label', 'Eyebrow'),
        field('homeContact.heading', 'Título'),
        field('homeContact.description', 'Descripción'),
        field('homeContact.cta', 'CTA'),
        field('contacts.0.name', 'Contacto 1 · nombre'),
        field('contacts.0.email', 'Contacto 1 · email'),
      ],
    }),
  ]
}

const buildNewsSections = (articles) => {
  const featuredArticle = articles[0]
  const archiveArticle = articles[1] || featuredArticle

  return [
    section('news-hero', 'Hero de Noticias', {
      sectionIndex: 0,
      fields: [
        field('nyheterHero.h1', 'Título'),
        field('nyheterHero.description', 'Descripción'),
      ],
    }),
    section('news-featured', 'Bloque destacado', {
      anchorId: 'nyheter-heading',
      description: 'La pieza principal del listado.',
      fields: [
        field(featuredArticle ? `news.${featuredArticle.slug}.tag` : 'news.{slug}.tag', 'Tag'),
        field(featuredArticle ? `news.${featuredArticle.slug}.readTime` : 'news.{slug}.readTime', 'Read time'),
        field(featuredArticle ? `news.${featuredArticle.slug}.title` : 'news.{slug}.title', 'Título'),
        field(featuredArticle ? `news.${featuredArticle.slug}.excerpt` : 'news.{slug}.excerpt', 'Extracto'),
      ],
    }),
    section('news-archive', 'Archivo', {
      anchorId: 'nyheter-arkiv',
      description: 'Listado completo del archivo.',
      fields: [
        field(archiveArticle ? `news.${archiveArticle.slug}.tag` : 'news.{slug}.tag', 'Item archivo · tag'),
        field(archiveArticle ? `news.${archiveArticle.slug}.title` : 'news.{slug}.title', 'Item archivo · título'),
        field(archiveArticle ? `news.${archiveArticle.slug}.excerpt` : 'news.{slug}.excerpt', 'Item archivo · extracto'),
      ],
    }),
  ]
}

const buildHelseSections = () => [
  section('helse-hero', 'Hero Helse', {
    sectionIndex: 0,
    fields: [
      field('helseHero.h1', 'Título'),
      field('helseHero.description', 'Descripción'),
    ],
  }),
  section('helse-sector', 'Argumento sectorial', {
    anchorId: 'helsesektor-heading',
    fields: [
      field('helsesektorComp.label', 'Eyebrow'),
      field('helsesektorComp.heading', 'Título'),
      field('helsesektorComp.description', 'Descripción'),
      field('helsesektorComp.ctaLabel', 'CTA'),
      field('helsesektorComp.features.0.title', 'Feature 1 · título'),
      field('helsesektorComp.features.0.description', 'Feature 1 · descripción'),
    ],
  }),
  section('helse-phases', 'Proceso', {
    anchorId: 'faser-heading',
    fields: [
      field('helsePhases.label', 'Eyebrow'),
      field('helsePhases.heading', 'Título'),
      field('helsePhases.description', 'Descripción'),
      field('helsePhases.phases.0.title', 'Fase 1 · título'),
      field('helsePhases.phases.0.description', 'Fase 1 · descripción'),
    ],
  }),
  section('helse-partnership', 'Partnership', {
    sectionIndex: 3,
    fields: [
      field('helsePartnership.label', 'Eyebrow'),
      field('helsePartnership.heading', 'Título'),
      field('helsePartnership.p1', 'Párrafo 1'),
      field('helsePartnership.p2', 'Párrafo 2'),
      field('helsePartnership.cta1', 'CTA primaria'),
      field('helsePartnership.cta2', 'CTA secundaria'),
    ],
  }),
]

const buildArticleSections = (article) => {
  if (!article) {
    return [
      section('article-empty', 'Sin artículo seleccionado', {
        scrollToTop: true,
        fields: [],
      }),
    ]
  }

  const markdownSections = getMarkdownSections(article.body || '').map((heading, index) => (
    section(`article-heading-${heading.id}`, heading.title, {
      anchorId: heading.id,
      description: `Bloque ${index + 1} dentro del markdown.`,
      fields: [field(`news.${article.slug}.body`, 'Body markdown', 'Editá este bloque desde el markdown completo.')],
    })
  ))

  return [
    section('article-header', 'Cabecera', {
      scrollToTop: true,
      fields: [
        field(`news.${article.slug}.tag`, 'Tag'),
        field(`news.${article.slug}.title`, 'Título'),
        field(`news.${article.slug}.excerpt`, 'Extracto'),
        field(`news.${article.slug}.readTime`, 'Read time'),
      ],
    }),
    section('article-body', 'Cuerpo', {
      sectionIndex: 0,
      fields: [field(`news.${article.slug}.body`, 'Body markdown')],
    }),
    ...markdownSections,
  ]
}

export function getAdminPreviewConfig({ viewId, article, articles = [] }) {
  const currentMode = ADMIN_PREVIEW_MODES.find((entry) => entry.id === viewId) || ADMIN_PREVIEW_MODES[0]

  if (currentMode.id === 'landing') {
    return {
      id: 'landing',
      label: 'Landing',
      path: '/',
      routeKey: 'admin:landing',
      sections: buildLandingSections(articles),
    }
  }

  if (currentMode.id === 'nyheter') {
    return {
      id: 'nyheter',
      label: 'Noticias',
      path: '/nyheter',
      routeKey: 'admin:nyheter',
      sections: buildNewsSections(articles),
    }
  }

  if (currentMode.id === 'helse') {
    return {
      id: 'helse',
      label: 'Helse',
      path: '/helse',
      routeKey: 'admin:helse',
      sections: buildHelseSections(),
    }
  }

  return {
    id: 'article',
    label: article ? `Artículo · ${article.title}` : 'Artículo',
    path: article ? `/nyheter/${article.slug}` : '/nyheter',
    routeKey: article ? `admin:article:${article.slug}` : 'admin:article',
    sections: buildArticleSections(article),
  }
}
