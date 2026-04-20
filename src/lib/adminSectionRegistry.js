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
  { id: 'global', label: 'Navigasjon & Footer', path: '/' },
  { id: 'landing', label: 'Startside', path: '/' },
  { id: 'nyheter', label: 'Nyhetsside', path: '/nyheter' },
  { id: 'helse', label: 'Helse', path: '/helse' },
  { id: 'spansk-alicante', label: 'Spansk i Alicante', path: '/spansk-i-alicante' },
  { id: 'spansk-alicante-hvorfor', label: 'Spansk i Alicante · Hvorfor', path: '/spansk-i-alicante/hvorfor' },
  { id: 'rekruttering', label: 'Rekrutteringsmodell', path: '/vr-rekrutteringsmodell' },
  { id: 'article', label: 'Artikkel', path: '/nyheter' },
  { id: 'news-manager', label: 'Nyhetsstudio', path: '/nyheter' },
  { id: 'kontakt', label: 'Kontakt', path: '/kontakt' },
  { id: 'om-oss', label: 'Om oss', path: '/om-oss' },
  { id: 'talentportalen', label: 'Talentportalen', path: '/talentportalen' },
  { id: 'personvern', label: 'Personvern', path: '/personvern' },
  { id: 'vilkar', label: 'Vilkår', path: '/vilkar' },
  { id: 'cookies', label: 'Cookies', path: '/cookies' },
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
        field('hero.imageUrl', 'Bilde'),
        field('hero.imageAlt', 'Bilde · alt-tekst'),
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
        field('homeHealth.imageUrl', 'Bilde'),
        field('homeHealth.imageAlt', 'Bilde · alt-tekst'),
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
    section('landing-spansk-alicante', 'Spansk i Alicante', {
      sectionIndex: 4,
      description: 'Teaserblokk som leder til den nye Alicante-siden.',
      fields: [
        field('spanskAlicanteTeaser.label', 'Fortekst'),
        field('spanskAlicanteTeaser.heading', 'Tittel'),
        field('spanskAlicanteTeaser.description', 'Beskrivelse'),
        field('spanskAlicanteTeaser.imageUrl', 'Bilde'),
        field('spanskAlicanteTeaser.imageAlt', 'Bilde · alt-tekst'),
        field('spanskAlicanteTeaser.cta', 'CTA'),
      ],
    }),
    section('landing-cta', 'CTA-banner', {
      sectionIndex: 5,
      fields: [
        field('ctaBanner.badge', 'Merke'),
        field('ctaBanner.heading', 'Tittel'),
        field('ctaBanner.description', 'Beskrivelse'),
        field('ctaBanner.imageUrl', 'Bilde'),
        field('ctaBanner.imageAlt', 'Bilde · alt-tekst'),
        field('ctaBanner.cta1', 'Primær-CTA'),
        field('ctaBanner.cta2', 'Sekundær-CTA'),
      ],
    }),
    section('landing-contact', 'Kontakt', {
      sectionIndex: 6,
      fields: [
        field('homeContact.label', 'Fortekst'),
        field('homeContact.heading', 'Tittel'),
        field('homeContact.description', 'Beskrivelse'),
        field('homeContact.cta', 'CTA'),
        field('contacts.0.name', 'Kontakt 1 · navn'),
        field('contacts.0.role', 'Kontakt 1 · rolle'),
        field('contacts.0.email', 'Kontakt 1 · e-post'),
        field('contacts.0.imageUrl', 'Kontakt 1 · bilde'),
        field('contacts.0.imageAlt', 'Kontakt 1 · alt-tekst'),
        field('contacts.1.name', 'Kontakt 2 · navn'),
        field('contacts.1.role', 'Kontakt 2 · rolle'),
        field('contacts.1.email', 'Kontakt 2 · e-post'),
        field('contacts.1.imageUrl', 'Kontakt 2 · bilde'),
        field('contacts.1.imageAlt', 'Kontakt 2 · alt-tekst'),
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
      field('helseHero.imageUrl', 'Hero · bilde'),
      field('helseHero.imageAlt', 'Hero · alt-tekst'),
    ],
  }),
  section('helse-sector', 'Sektorargument', {
    anchorId: 'helsesektor-heading',
    description: 'Anker i siden: #helsesektor. Brukes av interne lenker i helseseksjonens brødtekst.',
    fields: [
      field('helsesektorComp.label', 'Fortekst'),
      field('helsesektorComp.heading', 'Tittel'),
      field('helsesektorComp.description', 'Beskrivelse'),
      field('helsesektorComp.imageUrl', 'Bilde'),
      field('helsesektorComp.imageAlt', 'Bilde · alt-tekst'),
      field('helsesektorComp.ctaLabel', 'CTA'),
      field('helsesektorComp.features.0.title', 'Fordel 1 · tittel'),
      field('helsesektorComp.features.0.description', 'Fordel 1 · beskrivelse'),
    ],
  }),
  section('helse-phases', 'Faser', {
    anchorId: 'faser-heading',
    description: 'Anker i siden: #faser-heading. Brukes av interne lenker i prosessbeskrivelsen.',
    fields: [
      field('helsePhases.label', 'Fortekst'),
      field('helsePhases.heading', 'Tittel'),
      field('helsePhases.description', 'Beskrivelse'),
      field('helsePhases.phases.0.title', 'Fase 1 · tittel'),
      field('helsePhases.phases.0.description', 'Fase 1 · beskrivelse', 'Bruk \\n\\n for å dele inn i avsnitt'),
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

const buildSpanskAlicanteSections = () => [
  section('spansk-alicante-hero', 'Hero', {
    sectionIndex: 0,
    fields: [
      field('spanskAlicantePage.heroTitle', 'Tittel'),
      field('spanskAlicantePage.heroSubtitle', 'Undertittel'),
      field('spanskAlicantePage.intro', 'Intro'),
      field('spanskAlicantePage.heroImageUrl', 'Hero · bilde'),
      field('spanskAlicantePage.heroImageAlt', 'Hero · alt-tekst'),
    ],
  }),
  section('spansk-alicante-role', 'Rolle og oppgaver', {
    sectionIndex: 1,
    fields: [
      field('spanskAlicantePage.roleTitle', 'Seksjonstittel'),
      field('spanskAlicantePage.roleItems.0', 'Oppgave 1'),
      field('spanskAlicantePage.roleItems.1', 'Oppgave 2'),
      field('spanskAlicantePage.roleImageUrl', 'Rolle · bilde'),
      field('spanskAlicantePage.roleImageAlt', 'Rolle · alt-tekst'),
      field('spanskAlicantePage.exchangeNote', 'Bytteordning'),
    ],
  }),
  section('spansk-alicante-benefits', 'Fordeler', {
    sectionIndex: 2,
    fields: [
      field('spanskAlicantePage.benefitsTitle', 'Seksjonstittel'),
      field('spanskAlicantePage.benefitsItems.0', 'Fordel 1'),
      field('spanskAlicantePage.weekTitle', 'Ukestruktur · tittel'),
      field('spanskAlicantePage.weekItems.0', 'Ukestruktur · punkt 1'),
      field('spanskAlicantePage.cityImageUrl', 'Byliv · bilde'),
      field('spanskAlicantePage.cityImageAlt', 'Byliv · alt-tekst'),
    ],
  }),
  section('spansk-alicante-social', 'Byliv og sosial proof', {
    sectionIndex: 3,
    fields: [
      field('spanskAlicantePage.testimonialQuote', 'Testimonial'),
      field('spanskAlicantePage.testimonialAuthor', 'Testimonial · forfatter'),
      field('spanskAlicantePage.cityTitle', 'Byliv · tittel'),
      field('spanskAlicantePage.cityItems.0', 'Byliv · punkt 1'),
      field('spanskAlicantePage.socialInstagram', 'Instagram'),
      field('spanskAlicantePage.socialTikTok', 'TikTok'),
    ],
  }),
  section('spansk-alicante-cta', 'CTA', {
    sectionIndex: 4,
    fields: [
      field('spanskAlicantePage.processTitle', 'Prosess · tittel'),
      field('spanskAlicantePage.processSteps.0', 'Steg 1'),
      field('spanskAlicantePage.ctaPrimary', 'Primær-CTA'),
      field('spanskAlicantePage.ctaSecondary', 'Sekundær-CTA'),
      field('spanskAlicantePage.visionLinkLabel', 'Lenke til hvorfor-siden'),
    ],
  }),
]

const buildSpanskAlicanteHvorforSections = () => [
  section('spansk-alicante-hvorfor-hero', 'Hero', {
    sectionIndex: 0,
    fields: [
      field('spanskAlicanteVision.breadcrumb', 'Brødsmule'),
      field('spanskAlicanteVision.title', 'Tittel'),
      field('spanskAlicanteVision.intro', 'Intro'),
      field('spanskAlicanteVision.imageUrl', 'Bilde'),
      field('spanskAlicanteVision.imageAlt', 'Bilde · alt-tekst'),
    ],
  }),
  section('spansk-alicante-hvorfor-sections', 'Innhold', {
    sectionIndex: 1,
    fields: [
      field('spanskAlicanteVision.sections.0.heading', 'Seksjon 1 · tittel'),
      field('spanskAlicanteVision.sections.0.body', 'Seksjon 1 · brødtekst'),
      field('spanskAlicanteVision.sections.1.heading', 'Seksjon 2 · tittel'),
      field('spanskAlicanteVision.sections.1.body', 'Seksjon 2 · brødtekst'),
    ],
  }),
  section('spansk-alicante-hvorfor-highlights', 'Highlights', {
    sectionIndex: 2,
    fields: [
      field('spanskAlicanteVision.highlights.0', 'Highlight 1'),
      field('spanskAlicanteVision.highlights.1', 'Highlight 2'),
      field('spanskAlicanteVision.highlights.2', 'Highlight 3'),
    ],
  }),
]

const buildRekrutteringSections = () => [
  section('rekruttering-hero', 'Toppseksjon', {
    sectionIndex: 0,
    fields: [
      field('rekrutteringHero.h1', 'Tittel'),
      field('rekrutteringHero.description', 'Beskrivelse'),
    ],
  }),
  section('rekruttering-hva-gjor', 'Hva gjør vi', {
    sectionIndex: 1,
    anchorId: 'hvagjor',
    description: 'Anker i siden: #hvagjor. Brukes av interne lenker i introduksjonsdelen.',
    fields: [
      field('hvaGjor.label', 'Fortekst'),
      field('hvaGjor.heading', 'Tittel'),
      field('hvaGjor.description', 'Beskrivelse'),
      field('hvaGjor.sectionImageUrl', 'Bilde under CTA'),
      field('hvaGjor.sectionImageAlt', 'Bilde · alt-tekst'),
    ],
  }),
  section('rekruttering-comp', 'Rekrutteringsprosessen', {
    sectionIndex: 2,
    fields: [
      field('rekrutteringComp.label', 'Fortekst'),
      field('rekrutteringComp.heading', 'Tittel'),
      field('rekrutteringComp.p1', 'Avsnitt 1'),
      field('rekrutteringComp.p2', 'Avsnitt 2'),
      field('rekrutteringComp.p3', 'Avsnitt 3'),
      field('rekrutteringComp.steps.0.title', 'Steg 1 · tittel'),
      field('rekrutteringComp.steps.0.description', 'Steg 1 · beskrivelse'),
    ],
  }),
  section('rekruttering-collab', 'Samarbeidsmodell', {
    sectionIndex: 3,
    fields: [
      field('rekrutteringCollab.label', 'Fortekst'),
      field('rekrutteringCollab.heading', 'Tittel'),
      field('rekrutteringCollab.p1', 'Avsnitt 1'),
      field('rekrutteringCollab.p2', 'Avsnitt 2'),
      field('rekrutteringCollab.p3', 'Avsnitt 3'),
      field('rekrutteringCollab.imageUrl', 'Bilde'),
      field('rekrutteringCollab.imageAlt', 'Bilde · alt-tekst'),
      field('rekrutteringCollab.cta1', 'Primær-CTA'),
      field('rekrutteringCollab.cta2', 'Sekundær-CTA'),
    ],
  }),
  section('rekruttering-grunner', 'Gode grunner', {
    sectionIndex: 4,
    fields: [
      field('godeGrunner.label', 'Fortekst'),
      field('godeGrunner.heading', 'Tittel'),
      field('godeGrunner.description', 'Beskrivelse'),
      field('godeGrunner.imageUrl', 'Bilde'),
      field('godeGrunner.imageAlt', 'Bilde · alt-tekst'),
      field('godeGrunner.articleLinkLabel', 'Lenketekst'),
      field('godeGrunner.articleLink', 'Lenke'),
    ],
  }),
]

const buildKontaktSections = () => [
  section('kontakt-hero', 'Toppseksjon', {
    scrollToTop: true,
    fields: [
      field('kontaktHero.h1', 'Tittel'),
      field('kontaktHero.description', 'Beskrivelse'),
    ],
  }),
  section('kontakt-comp', 'Kontaktblokk', {
    sectionIndex: 1,
    fields: [
      field('kontaktComp.label', 'Fortekst'),
      field('kontaktComp.heading', 'Tittel'),
      field('kontaktComp.description', 'Beskrivelse'),
      field('kontaktComp.imageUrl', 'Bilde'),
      field('kontaktComp.imageAlt', 'Bilde · alt-tekst'),
      field('kontaktComp.officeTitle', 'Kontortittel'),
      field('kontaktComp.officeAddress', 'Kontoradresse'),
    ],
  }),
  section('kontakt-contacts', 'Kontaktpersoner', {
    sectionIndex: 2,
    fields: [
      field('contacts.0.name', 'Kontakt 1 · navn'),
      field('contacts.0.role', 'Kontakt 1 · rolle'),
      field('contacts.0.imageUrl', 'Kontakt 1 · bilde'),
      field('contacts.0.imageAlt', 'Kontakt 1 · alt-tekst'),
      field('contacts.1.name', 'Kontakt 2 · navn'),
      field('contacts.1.role', 'Kontakt 2 · rolle'),
      field('contacts.1.imageUrl', 'Kontakt 2 · bilde'),
      field('contacts.1.imageAlt', 'Kontakt 2 · alt-tekst'),
    ],
  }),
]

const buildOmOssSections = () => [
  section('om-oss-hero', 'Toppseksjon', {
    scrollToTop: true,
    fields: [
      field('omOssHero.h1', 'Tittel'),
      field('omOssHero.description', 'Beskrivelse'),
    ],
  }),
  section('om-oss-team', 'Team', {
    sectionIndex: 1,
    fields: [
      field('omOssTeam.label', 'Fortekst'),
      field('omOssTeam.heading', 'Tittel'),
      field('omOssTeam.description', 'Beskrivelse'),
      field('omOssTeam.members.0.name', 'Medlem 1 · navn'),
      field('omOssTeam.members.0.role', 'Medlem 1 · rolle'),
      field('omOssTeam.members.0.imageUrl', 'Medlem 1 · bilde'),
      field('omOssTeam.members.0.imageAlt', 'Medlem 1 · alt-tekst'),
      field('omOssTeam.members.1.name', 'Medlem 2 · navn'),
      field('omOssTeam.members.1.role', 'Medlem 2 · rolle'),
      field('omOssTeam.members.1.imageUrl', 'Medlem 2 · bilde'),
      field('omOssTeam.members.1.imageAlt', 'Medlem 2 · alt-tekst'),
      field('omOssTeam.members.2.name', 'Medlem 3 · navn'),
      field('omOssTeam.members.2.role', 'Medlem 3 · rolle'),
      field('omOssTeam.members.2.imageUrl', 'Medlem 3 · bilde'),
      field('omOssTeam.members.2.imageAlt', 'Medlem 3 · alt-tekst'),
    ],
  }),
  section('om-oss-offices', 'Kontorer', {
    sectionIndex: 2,
    fields: [
      field('omOssOffices.label', 'Fortekst'),
      field('omOssOffices.heading', 'Tittel'),
      field('omOssOffices.description', 'Beskrivelse'),
      field('omOssOffices.imageUrl', 'Bilde'),
      field('omOssOffices.imageAlt', 'Bilde · alt-tekst'),
      field('omOssOffices.officeName', 'Kontornavn'),
      field('omOssOffices.officeAddress', 'Kontoradresse'),
    ],
  }),
  section('om-oss-comp', 'Om-blokk', {
    sectionIndex: 3,
    fields: [
      field('omOssComp.label', 'Fortekst'),
      field('omOssComp.heading', 'Tittel'),
      field('omOssComp.p1', 'Avsnitt 1'),
      field('omOssComp.p2', 'Avsnitt 2'),
      field('omOssComp.blockquote.text', 'Sitat'),
      field('omOssComp.blockquote.author', 'Sitatforfatter'),
      field('omOssComp.teamImageUrl', 'Team · bilde'),
      field('omOssComp.teamImageAlt', 'Team · alt-tekst'),
      field('omOssComp.officeImageUrl', 'Kontor · bilde'),
      field('omOssComp.officeImageAlt', 'Kontor · alt-tekst'),
      field('omOssComp.stats.0.value', 'Nøkkeltall 1 · verdi'),
      field('omOssComp.stats.0.label', 'Nøkkeltall 1 · etikett'),
      field('omOssComp.locationLabel', 'Lokasjon'),
      field('omOssComp.locationSub', 'Lokasjon · undertekst'),
    ],
  }),
  section('om-oss-faq', 'FAQ', {
    sectionIndex: 4,
    fields: [
      field('faq.label', 'Fortekst'),
      field('faq.heading', 'Tittel'),
      field('faq.description', 'Beskrivelse'),
      field('faq.ctaText', 'CTA-tekst'),
      field('faq.items.0.q', 'Spørsmål 1'),
      field('faq.items.0.a', 'Svar 1'),
    ],
  }),
]

const buildTalentportalenSections = () => [
  section('talentportalen-hero', 'Toppseksjon', {
    scrollToTop: true,
    fields: [
      field('talentportalenHero.h1', 'Tittel'),
      field('talentportalenHero.description', 'Beskrivelse'),
    ],
  }),
  section('talentportalen-steps', 'Steg', {
    sectionIndex: 1,
    fields: [
      field('talentportalenSteps.label', 'Fortekst'),
      field('talentportalenSteps.heading', 'Tittel'),
      field('talentportalenSteps.steps.0.title', 'Steg 1 · tittel'),
      field('talentportalenSteps.steps.0.desc', 'Steg 1 · beskrivelse'),
    ],
  }),
  section('talentportalen-benefits', 'Fordeler', {
    sectionIndex: 2,
    fields: [
      field('talentportalenBenefits.label', 'Fortekst'),
      field('talentportalenBenefits.heading', 'Tittel'),
      field('talentportalenBenefits.items.0', 'Fordel 1'),
      field('talentportalenBenefits.items.1', 'Fordel 2'),
    ],
  }),
  section('talentportalen-comp', 'Portalblokk', {
    sectionIndex: 3,
    fields: [
      field('talentportalenComp.label', 'Fortekst'),
      field('talentportalenComp.heading', 'Tittel'),
      field('talentportalenComp.description', 'Beskrivelse'),
      field('talentportalenComp.benefits.0.title', 'Fordel 1 · tittel'),
      field('talentportalenComp.benefits.0.desc', 'Fordel 1 · beskrivelse'),
      field('talentportalenComp.ctaLogin', 'CTA Logg inn'),
      field('talentportalenComp.ctaContact', 'CTA Kontakt'),
    ],
  }),
]

const buildLegalSections = (contentKey, label) => [
  section(`${contentKey}-title`, label, {
    scrollToTop: true,
    fields: [
      field(`${contentKey}.title`, 'Tittel'),
      field(`${contentKey}.intro`, 'Intro'),
    ],
  }),
  section(`${contentKey}-blocks`, 'Innhold', {
    sectionIndex: 1,
    fields: [
      field(`${contentKey}.blocks.0.heading`, 'Blokk 1 · tittel'),
      field(`${contentKey}.blocks.0.body`, 'Blokk 1 · tekst'),
      field(`${contentKey}.blocks.1.heading`, 'Blokk 2 · tittel'),
      field(`${contentKey}.blocks.1.body`, 'Blokk 2 · tekst'),
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

const buildGlobalSections = () => [
  section('global-navbar', 'Navigasjon', {
    scrollToTop: true,
    description: 'Navigasjonslenker og CTA-knapp som vises i toppen av alle sider.',
    fields: [
      field('navbar.links.0.label', 'Lenke 1 · tekst'),
      field('navbar.links.1.label', 'Lenke 2 · tekst'),
      field('navbar.links.2.label', 'Lenke 3 · tekst'),
      field('navbar.links.3.label', 'Lenke 4 · tekst'),
      field('navbar.links.4.label', 'Lenke 5 · tekst'),
      field('navbar.links.5.label', 'Lenke 6 · tekst'),
      field('navbar.links.6.label', 'Lenke 7 · tekst'),
      field('navbar.ctaLabel', 'CTA-knapp'),
    ],
  }),
  section('global-footer', 'Footer', {
    sectionIndex: 1,
    description: 'Beskrivelsestekst, kolonnetitler og lenkelabels i bunnteksten.',
    fields: [
      field('footer.description', 'Beskrivelse'),
      field('footer.links.Tjenester', 'Kolonne 1 · tittel'),
      field('footer.links.Tjenester.0.label', 'Tjenester · lenke 1'),
      field('footer.links.Tjenester.1.label', 'Tjenester · lenke 2'),
      field('footer.links.Tjenester.2.label', 'Tjenester · lenke 3'),
      field('footer.links.Tjenester.3.label', 'Tjenester · lenke 4'),
      field('footer.links.Tjenester.4.label', 'Tjenester · lenke 5'),
      field('footer.links.Selskapet', 'Kolonne 2 · tittel'),
      field('footer.links.Selskapet.0.label', 'Selskapet · lenke 1'),
      field('footer.links.Selskapet.1.label', 'Selskapet · lenke 2'),
      field('footer.links.Selskapet.2.label', 'Selskapet · lenke 3'),
      field('footer.links.Selskapet.3.label', 'Selskapet · lenke 4'),
      field('footer.links.Kontakt', 'Kolonne 3 · tittel'),
    ],
  }),
]

export function getAdminPreviewConfig({ viewId, article, articles = [] }) {
  const currentMode = ADMIN_PREVIEW_MODES.find((entry) => entry.id === viewId) || ADMIN_PREVIEW_MODES[0]

  if (currentMode.id === 'global') {
    return {
      id: 'global',
      label: 'Navigasjon & Footer',
      path: '/',
      routeKey: 'admin:global',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Rediger navigasjonslenker, CTA og footer-innhold som vises på alle sider.',
      sections: buildGlobalSections(),
    }
  }

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

  if (currentMode.id === 'spansk-alicante') {
    return {
      id: 'spansk-alicante',
      label: 'Spansk i Alicante',
      path: '/spansk-i-alicante',
      routeKey: 'admin:spansk-alicante',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Rediger nye Alicante-siden seksjonsvis uten å miste struktur og CTA-flyt.',
      sections: buildSpanskAlicanteSections(),
    }
  }

  if (currentMode.id === 'spansk-alicante-hvorfor') {
    return {
      id: 'spansk-alicante-hvorfor',
      label: 'Spansk i Alicante · Hvorfor',
      path: '/spansk-i-alicante/hvorfor',
      routeKey: 'admin:spansk-alicante-hvorfor',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Rediger under­siden om hvorfor Spansk i Alicante finnes med egne seksjoner og highlights.',
      sections: buildSpanskAlicanteHvorforSections(),
    }
  }

  if (currentMode.id === 'rekruttering') {
    return {
      id: 'rekruttering',
      label: 'Rekrutteringsmodell',
      path: '/vr-rekrutteringsmodell',
      routeKey: 'admin:rekruttering',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Rediger rekrutteringsmodell-siden seksjonsvis med hero, prosess og samarbeidsmodell.',
      sections: buildRekrutteringSections(),
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

  if (currentMode.id === 'kontakt') {
    return {
      id: 'kontakt',
      label: 'Kontakt',
      path: '/kontakt',
      routeKey: 'admin:kontakt',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Rediger kontaktsiden seksjonsvis med hero, kontaktblokk og kontaktpersoner.',
      sections: buildKontaktSections(),
    }
  }

  if (currentMode.id === 'om-oss') {
    return {
      id: 'om-oss',
      label: 'Om oss',
      path: '/om-oss',
      routeKey: 'admin:om-oss',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Rediger om-oss-siden seksjonsvis med hero, team, kontorer, om-blokk og FAQ.',
      sections: buildOmOssSections(),
    }
  }

  if (currentMode.id === 'talentportalen') {
    return {
      id: 'talentportalen',
      label: 'Talentportalen',
      path: '/talentportalen',
      routeKey: 'admin:talentportalen',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Rediger talentportalen-siden seksjonsvis med hero, steg, fordeler og portalblokk.',
      sections: buildTalentportalenSections(),
    }
  }

  if (currentMode.id === 'personvern') {
    return {
      id: 'personvern',
      label: 'Personvern',
      path: '/personvern',
      routeKey: 'admin:personvern',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Rediger personvernerklæringen med tittel, intro og innholdsblokker.',
      sections: buildLegalSections('legalPersonvern', 'Personvern'),
    }
  }

  if (currentMode.id === 'vilkar') {
    return {
      id: 'vilkar',
      label: 'Vilkår',
      path: '/vilkar',
      routeKey: 'admin:vilkar',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Rediger vilkårssiden med tittel, intro og innholdsblokker.',
      sections: buildLegalSections('legalVilkar', 'Vilkår'),
    }
  }

  if (currentMode.id === 'cookies') {
    return {
      id: 'cookies',
      label: 'Cookies',
      path: '/cookies',
      routeKey: 'admin:cookies',
      usesVisualSession: true,
      topbarTitle: 'Visuell redigering',
      topbarDescription: 'Rediger cookies-siden med tittel, intro og innholdsblokker.',
      sections: buildLegalSections('legalCookies', 'Cookies'),
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
