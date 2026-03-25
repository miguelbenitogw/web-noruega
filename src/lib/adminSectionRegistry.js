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
  { id: 'landing', label: 'Startside', path: '/' },
  { id: 'nyheter', label: 'Nyhetsside', path: '/nyheter' },
  { id: 'helse', label: 'Helse', path: '/helse' },
  { id: 'article', label: 'Artikkel', path: '/nyheter' },
  { id: 'news-manager', label: 'Nyhetsstudio', path: '/nyheter' },
]

const buildLandingSections = (articles) => {
  const featuredArticle = articles[0]
  const secondaryArticle = articles[1]

  return [
    section('landing-hero', 'Toppseksjon', {
      scrollToTop: true,
      description: 'Førsteinntrykket: merke, hovedtittel, ingress, CTA-er og nøkkeltall.',
      fields: [
        field('hero.badge', 'Merke'),
        field('hero.h1First', 'Tittel · del 1'),
        field('hero.h1Highlight', 'Tittel · uthevet'),
        field('hero.description', 'Ingress'),
        field('hero.cta1', 'Primær-CTA'),
        field('hero.cta2', 'Sekundær-CTA'),
        field('hero.stats.0.value', 'Nøkkeltall 1 · verdi'),
        field('hero.stats.0.label', 'Nøkkeltall 1 · etikett'),
      ],
    }),
    section('landing-services', 'Tjenester', {
      sectionIndex: 1,
      description: 'Kort oppsummering av verdiforslaget på startsiden.',
      fields: [
        field('homeServices.label', 'Fortekst'),
        field('homeServices.heading', 'Tittel'),
        field('homeServices.description', 'Beskrivelse'),
        field('homeServices.sections.0.title', 'Kort 1 · tittel'),
        field('homeServices.sections.0.description', 'Kort 1 · beskrivelse'),
        field('homeServices.sections.1.title', 'Kort 2 · tittel'),
      ],
    }),
    section('landing-health', 'Helseblokk', {
      sectionIndex: 2,
      description: 'Mørk seksjon som leder videre til helsevertikalen.',
      fields: [
        field('homeHealth.label', 'Fortekst'),
        field('homeHealth.heading', 'Tittel'),
        field('homeHealth.description', 'Beskrivelse'),
        field('homeHealth.cta', 'CTA'),
        field('homeStats.0.value', 'Nøkkeltall 1 · verdi'),
        field('homeStats.0.label', 'Nøkkeltall 1 · etikett'),
      ],
    }),
    section('landing-news', 'Siste nyheter', {
      sectionIndex: 3,
      description: 'Redaksjonell forhåndsvisning på startsiden.',
      fields: [
        field(featuredArticle ? `news.${featuredArticle.slug}.tag` : 'news.{slug}.tag', 'Fremhevet · tagg'),
        field(featuredArticle ? `news.${featuredArticle.slug}.title` : 'news.{slug}.title', 'Fremhevet · tittel'),
        field(featuredArticle ? `news.${featuredArticle.slug}.excerpt` : 'news.{slug}.excerpt', 'Fremhevet · ingress'),
        field(secondaryArticle ? `news.${secondaryArticle.slug}.title` : 'news.{slug}.title', 'Kort 2 · tittel'),
      ],
    }),
    section('landing-cta', 'CTA-banner', {
      sectionIndex: 4,
      fields: [
        field('ctaBanner.badge', 'Merke'),
        field('ctaBanner.heading', 'Tittel'),
        field('ctaBanner.description', 'Beskrivelse'),
        field('ctaBanner.cta', 'CTA'),
      ],
    }),
    section('landing-contact', 'Kontakt', {
      sectionIndex: 5,
      fields: [
        field('homeContact.label', 'Fortekst'),
        field('homeContact.heading', 'Tittel'),
        field('homeContact.description', 'Beskrivelse'),
        field('homeContact.cta', 'CTA'),
        field('contacts.0.name', 'Kontakt 1 · navn'),
        field('contacts.0.email', 'Kontakt 1 · e-post'),
      ],
    }),
  ]
}

const buildNewsSections = (articles) => {
  const featuredArticle = articles[0]
  const archiveArticle = articles[1] || featuredArticle

  return [
    section('news-hero', 'Toppseksjon', {
      sectionIndex: 0,
      fields: [
        field('nyheterHero.h1', 'Tittel'),
        field('nyheterHero.description', 'Beskrivelse'),
      ],
    }),
    section('news-featured', 'Fremhevet blokk', {
      anchorId: 'nyheter-heading',
      description: 'Hovedsaken i nyhetslisten.',
      fields: [
        field(featuredArticle ? `news.${featuredArticle.slug}.tag` : 'news.{slug}.tag', 'Tagg'),
        field(featuredArticle ? `news.${featuredArticle.slug}.readTime` : 'news.{slug}.readTime', 'Lesetid'),
        field(featuredArticle ? `news.${featuredArticle.slug}.title` : 'news.{slug}.title', 'Tittel'),
        field(featuredArticle ? `news.${featuredArticle.slug}.excerpt` : 'news.{slug}.excerpt', 'Ingress'),
      ],
    }),
    section('news-archive', 'Arkiv', {
      anchorId: 'nyheter-arkiv',
      description: 'Hele arkivet under toppseksjonen.',
      fields: [
        field(archiveArticle ? `news.${archiveArticle.slug}.tag` : 'news.{slug}.tag', 'Arkivkort · tagg'),
        field(archiveArticle ? `news.${archiveArticle.slug}.title` : 'news.{slug}.title', 'Arkivkort · tittel'),
        field(archiveArticle ? `news.${archiveArticle.slug}.excerpt` : 'news.{slug}.excerpt', 'Arkivkort · ingress'),
      ],
    }),
  ]
}

const buildHelseSections = () => [
  section('helse-hero', 'Toppseksjon', {
    sectionIndex: 0,
    fields: [
      field('helseHero.h1', 'Tittel'),
      field('helseHero.description', 'Beskrivelse'),
    ],
  }),
  section('helse-sector', 'Sektorargument', {
    anchorId: 'helsesektor-heading',
    fields: [
      field('helsesektorComp.label', 'Fortekst'),
      field('helsesektorComp.heading', 'Tittel'),
      field('helsesektorComp.description', 'Beskrivelse'),
      field('helsesektorComp.ctaLabel', 'CTA'),
      field('helsesektorComp.features.0.title', 'Fordel 1 · tittel'),
      field('helsesektorComp.features.0.description', 'Fordel 1 · beskrivelse'),
    ],
  }),
  section('helse-phases', 'Faser', {
    anchorId: 'faser-heading',
    fields: [
      field('helsePhases.label', 'Fortekst'),
      field('helsePhases.heading', 'Tittel'),
      field('helsePhases.description', 'Beskrivelse'),
      field('helsePhases.phases.0.title', 'Fase 1 · tittel'),
      field('helsePhases.phases.0.description', 'Fase 1 · beskrivelse'),
    ],
  }),
  section('helse-partnership', 'Partnerskap', {
    sectionIndex: 3,
    fields: [
      field('helsePartnership.label', 'Fortekst'),
      field('helsePartnership.heading', 'Tittel'),
      field('helsePartnership.p1', 'Avsnitt 1'),
      field('helsePartnership.p2', 'Avsnitt 2'),
      field('helsePartnership.cta1', 'Primær-CTA'),
      field('helsePartnership.cta2', 'Sekundær-CTA'),
    ],
  }),
]

const buildArticleSections = (article) => {
  if (!article) {
    return [
      section('article-empty', 'Ingen artikkel valgt', {
        scrollToTop: true,
        fields: [],
      }),
    ]
  }

  const markdownSections = getMarkdownSections(article.body || '').map((heading, index) => (
    section(`article-heading-${heading.id}`, heading.title, {
      anchorId: heading.id,
      description: `Del ${index + 1} i artikkelstrukturen.`,
      fields: [field(`news.${article.slug}.body`, 'Brødtekst', 'Denne delen redigeres fra artikkelinnholdet.')],
    })
  ))

  return [
    section('article-header', 'Artikkelhode', {
      scrollToTop: true,
      fields: [
        field(`news.${article.slug}.tag`, 'Tagg'),
        field(`news.${article.slug}.title`, 'Tittel'),
        field(`news.${article.slug}.excerpt`, 'Ingress'),
        field(`news.${article.slug}.readTime`, 'Lesetid'),
      ],
    }),
    section('article-body', 'Brødtekst', {
      sectionIndex: 0,
      fields: [field(`news.${article.slug}.body`, 'Artikkelinnhold')],
    }),
    ...markdownSections,
  ]
}

const buildNewsStudioSections = () => [
  section('news-studio-flow', 'Arbeidsflyt', {
    scrollToTop: true,
    description: 'Skjemaet i midten håndterer opprettelse, redigering, kladd og publisering.',
    fields: [],
  }),
  section('news-studio-featured', 'Fremhevet nyhet', {
    description: 'Bryteren i skjemaet lagrer fremhevet-status kompatibelt i metadata/content.',
    fields: [],
  }),
  section('news-studio-body', 'Artikkelbygger', {
    description: 'Bruk hjelpeknappene i body-editoren for å sette inn seksjoner uten å skrive markdown manuelt.',
    fields: [],
  }),
]

export function getAdminPreviewConfig({ viewId, article, articles = [] }) {
  const currentMode = ADMIN_PREVIEW_MODES.find((entry) => entry.id === viewId) || ADMIN_PREVIEW_MODES[0]

  if (currentMode.id === 'landing') {
    return {
      id: 'landing',
      label: 'Startside',
      path: '/',
      routeKey: 'admin:landing',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Rediger innhold direkte i forhåndsvisningen og bruk høyrepanelet for å holde oversikt over seksjoner og felter.',
      sections: buildLandingSections(articles),
    }
  }

  if (currentMode.id === 'nyheter') {
    return {
      id: 'nyheter',
      label: 'Nyhetsside',
      path: '/nyheter',
      routeKey: 'admin:nyheter',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Finjuster toppseksjon, fremhevet sak og arkiv direkte på den publiserte nyhetssiden.',
      sections: buildNewsSections(articles),
    }
  }

  if (currentMode.id === 'helse') {
    return {
      id: 'helse',
      label: 'Helse',
      path: '/helse',
      routeKey: 'admin:helse',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Jobb seksjonsvis med helse-siden uten å miste oversikten over strukturen.',
      sections: buildHelseSections(),
    }
  }

  if (currentMode.id === 'news-manager') {
    return {
      id: 'news-manager',
      label: 'Nyhetsstudio',
      path: '/nyheter',
      routeKey: 'admin:news-manager',
      usesVisualSession: false,
      topbarTitle: 'Nyhetsstudio',
      topbarDescription: 'Opprett, rediger og publiser nyheter med skjema og hjelpeverktøy – uten å skrive markdown manuelt.',
      panelVariant: 'news-manager',
      sections: buildNewsStudioSections(),
    }
  }

  return {
    id: 'article',
    label: article ? `Artikkel · ${article.title}` : 'Artikkel',
    path: article ? `/nyheter/${article.slug}` : '/nyheter',
    routeKey: article ? `admin:article:${article.slug}` : 'admin:article',
    usesVisualSession: true,
    topbarTitle: 'Visuell redigering',
    topbarDescription: 'Velg en artikkel og rediger overskrift, ingress og innhold direkte mot artikkelsiden.',
    sections: buildArticleSections(article),
  }
}
