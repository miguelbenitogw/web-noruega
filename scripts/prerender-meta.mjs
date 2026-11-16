import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import publishedContent from '../src/data/publishedContent.js'

const DIST_DIR = path.resolve('dist')
const INDEX_PATH = path.join(DIST_DIR, 'index.html')
const NEWS_DIR = path.resolve('src/content/news')
const SITE_URL = 'https://globalworking.no'
const DEFAULT_IMAGE = 'https://hahqimviirkkzkvmusga.supabase.co/storage/v1/object/public/content-media/og-image.jpg'
const SITE_NAME = 'Global Working Norge'

// ── Identidad de la entidad ──────────────────────────────────────────────────
// UNA empresa, UN nodo, UN identificador. Antes `index.html` declaraba tres
// bloques JSON-LD sueltos (EmploymentAgency, WebSite, LocalBusiness) y cada
// ruta añadía un cuarto con un `WebSite` anónimo dentro de `isPartOf`. Para un
// buscador eso no es «una empresa descrita cuatro veces»: son cuatro cosas sin
// relación, porque nada dice que sean la misma. Con `@id` sí lo dice, y todo lo
// demás (la página, el servicio, el curso, el artículo) puede apuntar al mismo
// identificador en vez de repetir los datos y arriesgarse a contradecirlos.
const ORG_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`
const ALICANTE_ID = `${SITE_URL}/#alicante`
const ORG_REF = { '@id': ORG_ID }

const NORWAY = { '@type': 'Country', name: 'Norway' }

// Los datos salen de los tres bloques que había en index.html, sin perder nada:
// este grafo los sustituye en el HTML servido (ver stripLegacyJsonLd).
const buildOrganizationNode = () => ({
  '@type': 'EmploymentAgency',
  '@id': ORG_ID,
  name: SITE_NAME,
  legalName: 'Global Working Norge AS',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', '@id': `${SITE_URL}/#logo`, url: DEFAULT_IMAGE },
  image: { '@id': `${SITE_URL}/#logo` },
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
})

const buildWebSiteNode = () => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'nb-NO',
  publisher: ORG_REF,
})

const buildAlicanteNode = () => ({
  '@type': 'LocalBusiness',
  '@id': ALICANTE_ID,
  name: 'Global Working – Alicante',
  url: SITE_URL,
  image: { '@id': `${SITE_URL}/#logo` },
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
})

/** Nodos de entidad que van en TODAS las rutas. Lo demás apunta a sus `@id`. */
const entityNodes = () => [buildOrganizationNode(), buildWebSiteNode(), buildAlicanteNode()]

// ── Nodos por ruta ───────────────────────────────────────────────────────────
// `Service` para lo que se contrata, `Course` para lo que se enseña. El que
// decide en una kommune no busca «helsesektor»: busca un servicio con un
// alcance y un destinatario. Decirlo en el grafo es lo que permite que la
// página se entienda como oferta y no como folleto.
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
  // Google pide `hasCourseInstance` para que un `Course` sea elegible: sin una
  // instancia con modalidad y carga horaria es solo una descripción.
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: extras.courseMode,
    courseWorkload: extras.timeRequired,
    location: { '@id': ALICANTE_ID },
    inLanguage: 'nb-NO',
  },
})

/**
 * FAQPage a partir de las preguntas que YA están publicadas en
 * `src/data/publishedContent.js` — las mismas que pinta `<FAQ />` en /om-oss.
 * No se inventa ni se traduce nada: si el texto cambia ahí, cambia aquí.
 *
 * Las respuestas vienen en markdown (enlaces, saltos dobles). Se aplanan a
 * texto porque `acceptedAnswer.text` no es sitio para sintaxis de markdown:
 * un `[texto](url)` ahí se lee literal, con los corchetes incluidos.
 */
const flattenAnswer = (raw) => String(raw ?? '')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/[*_`#>]/g, '')
  .split(/\s*\n+\s*/)
  .map((line) => line.trim())
  .filter(Boolean)
  .join(' ')
  .replace(/\s{2,}/g, ' ')
  .trim()

const faqItems = () => {
  const items = publishedContent?.faq?.items
  if (!Array.isArray(items)) return []
  return items
    .map((item) => ({ q: String(item?.q ?? '').trim(), a: flattenAnswer(item?.a) }))
    .filter((item) => item.q && item.a)
}

const buildFaqNode = (url) => {
  const items = faqItems()
  if (items.length === 0) return null
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

const buildExtraNodes = (route, url) => {
  const extras = route.extras
  if (!extras) return []
  if (extras.kind === 'service') return [buildServiceNode(extras, url)]
  if (extras.kind === 'course') return [buildCourseNode(extras, url)]
  if (extras.kind === 'faq') {
    const faq = buildFaqNode(url)
    return faq ? [faq] : []
  }
  return []
}

const ROUTES = {
  '/vr-rekrutteringsmodell': {
    title: 'Slik rekrutterer du helsepersonell fra utlandet | Global Working',
    description: 'Hvordan rekruttere helsepersonell fra utlandet? Se hele prosessen steg for steg: utvelgelse, 650 timer helsenorsk, autorisasjon og oppfølging frem til første arbeidsdag.',
    keywords: 'hvordan rekruttere helsepersonell, internasjonal rekruttering, rekruttering av sykepleiere, arbeidsinnvandring',
    breadcrumbName: 'Rekrutteringsmodell',
    bodyExtra: '<h2>Slik fungerer rekrutteringsprosessen</h2><p>Global Workings rekrutteringsmodell er bygd opp i fire faser: identifisering av kandidater, språklig og faglig kvalifisering, dokumenthåndtering og autorisasjon, og til slutt tett oppfølging etter oppstart i Norge. Vi samarbeider med universiteter og fagmiljøer i Spania, Portugal og andre søreuropeiske land for å finne kandidater som matcher norske arbeidsgiveres behov. Alle kandidater gjennomgår norskopplæring til minimum B1-nivå før de starter i jobb.</p>',
    related: ['/helse', '/spansk-i-alicante/helsenorsk', '/talentportalen', 'news:hvordan-lykkes', 'news:rekrutteringspartner'],
    extras: {
      kind: 'service',
      name: 'Rekruttering av helsepersonell fra utlandet',
      serviceType: 'Internasjonal rekruttering',
      summary: 'Utvelgelse, språklig og faglig kvalifisering, autorisasjon og oppfølging frem til første arbeidsdag i Norge.',
      audienceType: 'Norske arbeidsgivere',
    },
  },
  '/helse': {
    title: 'Rekruttering av sykepleiere til Norge | Global Working',
    description: 'Mangel på sykepleiere? Vi finner, forbereder og følger opp utenlandske sykepleiere og helsefagarbeidere til norske kommuner og sykehus — med språk, autorisasjon og trygg oppstart.',
    keywords: 'rekruttering av sykepleiere, utenlandske sykepleiere i Norge, rekrutteringsbyrå helsepersonell, mangel på sykepleiere',
    breadcrumbName: 'Helsesektor',
    bodyExtra: '<h2>Rekruttering av helsepersonell til Norge</h2><p>Norsk helsevesen trenger kvalifiserte sykepleiere, helsefagarbeidere og spesialistpersonell. Global Working spesialiserer seg på å rekruttere helsepersonell fra Sør-Europa og forberede dem for det norske arbeidsmarkedet. Programmet vårt inkluderer helsenorsk-opplæring, støtte gjennom autorisasjonsprosessen hos Helsedirektoratet, kulturell forberedelse og tett oppfølging det første året i Norge. Vi samarbeider med kommuner, sykehus og private helseinstitusjoner over hele landet.</p>',
    related: ['/vr-rekrutteringsmodell', '/spansk-i-alicante/helsenorsk', '/talentportalen', 'news:vaga', 'news:sor-fron-intervju', 'news:hvordan-lykkes', 'news:sommervikarer'],
    extras: {
      kind: 'service',
      name: 'Rekruttering av sykepleiere og helsefagarbeidere til Norge',
      serviceType: 'Rekruttering av helsepersonell',
      summary: 'Vi finner, forbereder og følger opp utenlandske sykepleiere og helsefagarbeidere til norske kommuner og sykehus — med språk, autorisasjon og trygg oppstart.',
      audienceType: 'Norske kommuner, sykehus og sykehjem',
    },
  },
  '/nyheter': {
    schemaType: 'CollectionPage',
    title: 'Nyheter & artikler | Global Working Norge',
    description: 'Følg siste nytt, artikler og oppdateringer fra Global Working om rekruttering, språk og arbeidsliv i Norge.',
    keywords: 'Global Working nyheter, rekruttering nyheter Norge, arbeidsliv Norge',
    breadcrumbName: 'Nyheter',
    // Sin `bodyExtra` a mano: la lista se genera de los .md reales (ver
    // `newsIndex`). La que había aquí estaba escrita a mano con cuatro
    // enlaces, y DOS apuntaban a slugs que ya no existen
    // (`evaluering-sprakniva`, `sor-fron-integrasjon`): el índice de noticias
    // mandaba a los rastreadores a dos páginas muertas y se callaba las ocho
    // vivas. Una lista escrita a mano de algo que ya está en disco solo puede
    // acabar desfasada; esta no puede.
    newsIndex: true,
  },
  '/talentportalen': {
    title: 'Kandidatportal for norske arbeidsgivere | Global Working',
    description: 'Talentportalen er vår kandidatportal: se tilgjengelige sykepleiere og helsefagarbeidere med dokumentert norsknivå, og inviter til intervju direkte.',
    keywords: 'kandidatportal, kandidatportalen, talentportalen, tilgjengelige sykepleiere, rekrutteringsportal',
    breadcrumbName: 'Talentportalen',
    bodyExtra: '<h2>Hvordan Talentportalen fungerer</h2><p>Talentportalen gir norske arbeidsgivere direkte tilgang til forhåndsgodkjente kandidater fra Global Workings nettverk. Du kan filtrere etter fagområde, språknivå og tilgjengelighet, lese kandidatprofiler og invitere til intervju — alt på én plattform. Kandidatene er allerede kvalitetssikret gjennom vår rekrutteringsprosess, noe som gjør at du kan gå fra behov til intervju på kort tid.</p>',
    related: ['/helse', '/vr-rekrutteringsmodell', 'news:kandidatportal-lansert'],
  },
  '/om-oss': {
    schemaType: 'AboutPage',
    title: 'Rekrutteringsbyrå for helsesektoren | Global Working Norge',
    description: 'Global Working er et rekrutteringsbyrå spesialisert på helsepersonell fra Sør-Europa. Møt teamet og se hvordan vi jobber med språk, autorisasjon og kvalitet.',
    keywords: 'rekrutteringsbyrå helsepersonell, rekrutteringsbyrå helse, om Global Working, internasjonal rekruttering',
    breadcrumbName: 'Om oss',
    bodyExtra: '<h2>Hvem er Global Working?</h2><p>Global Working ble grunnlagt i 2014 med et mål: å bygge bro mellom kvalifiserte fagfolk i Sør-Europa og arbeidsgivere i Norge som trenger kompetanse. Med hovedkontor i Alicante og representasjon i Oslo har vi over 50 ansatte som jobber daglig med rekruttering, språkopplæring og integrering. Vi tror på langvarige ansettelser bygget på grundig forberedelse — både faglig, språklig og kulturelt.</p>',
    related: ['/helse', '/vr-rekrutteringsmodell', 'news:pablo-intervju'],
    // El <FAQ /> de esta página solo existe después de que corra React. Las seis
    // preguntas —incluida «Hva koster det å bruke Global Working?»— son
    // exactamente lo que escribe en el buscador quien tiene que fichar
    // enfermeras, y hasta ahora ni Googlebot en su pasada de HTML ni GPTBot,
    // ClaudeBot o PerplexityBot (que no ejecutan JavaScript) veían una sola
    // palabra. `faqBody` las escribe en el HTML estático y `extras` las declara
    // como FAQPage. El texto es el mismo que pinta la web: sale de
    // src/data/publishedContent.js, no se reescribe aquí.
    faqBody: true,
    extras: { kind: 'faq' },
  },
  '/kontakt': {
    schemaType: 'ContactPage',
    title: 'Kontakt oss om rekruttering av helsepersonell | Global Working',
    description: 'Trenger dere sykepleiere eller helsefagarbeidere? Ta kontakt for en uforpliktende samtale om rekruttering, samarbeid eller kandidatportalen.',
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
    related: ['/helse', '/vr-rekrutteringsmodell', 'news:praktisk-norsk', 'news:evaluere-norsk-spraak'],
    extras: {
      kind: 'course',
      name: 'Helsenorsk – yrkesrettet norsk for helsesektoren',
      summary: 'Yrkesrettet norskopplæring for sykepleiere og helsefagarbeidere, tilpasset hverdagen i norsk helsetjeneste.',
      teaches: 'Yrkesrettet norsk for helsesektoren: fagterminologi, pasientkommunikasjon og faglig dokumentasjon',
      // 650 h es lo que dice el título y la descripción de ESTA página. Ojo:
      // la web dice 600 en otros sitios (ver el informe) — la cifra correcta
      // la decide el cliente, aquí solo se refleja la de la propia página.
      timeRequired: 'PT650H',
      courseMode: 'blended',
      audienceType: 'Sykepleiere og helsefagarbeidere',
    },
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
// ── Inyección del cuerpo ─────────────────────────────────────────────────────
// Marcadores en index.html. Antes se buscaba la cadena exacta
// '<div id="root"></div>'; cuando el loader se metió dentro del root, el
// replace dejó de encontrar nada y el cuerpo prerenderizado desapareció de
// TODAS las rutas sin que el build se quejara. Un marcador explícito más un
// guard que revienta hace que eso no pueda repetirse en silencio.
const BODY_MARKER = '<!--PRERENDER-->'
const PRELOAD_START = '<!--HOME-PRELOAD-START-->'
const PRELOAD_END = '<!--HOME-PRELOAD-END-->'

const injectBody = (html, body, label) => {
  if (!html.includes(BODY_MARKER)) {
    throw new Error(
      `prerender: no se encontró ${BODY_MARKER} en el HTML de ${label}. ` +
      'Alguien tocó <div id="root"> en index.html. El cuerpo estático no se ' +
      'inyectó, así que los crawlers que no ejecutan JS verían una página vacía.',
    )
  }
  return html.replace(BODY_MARKER, body)
}

// El preload del hero solo sirve en la portada: en el resto de rutas esa
// imagen no se usa y serían ~128 KB descargados para nada.
const stripHomePreload = (html) => {
  const start = html.indexOf(PRELOAD_START)
  const end = html.indexOf(PRELOAD_END)
  if (start === -1 || end === -1) return html
  return html.slice(0, start) + html.slice(end + PRELOAD_END.length)
}

const buildBodySkeleton = ({ h1, description, breadcrumbs, extraContent }) => {
  const nav = NAV_LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join(' ')
  const crumbs = breadcrumbs
    ? `<nav aria-label="Brødsmuler">${breadcrumbs.map((b, i) => i < breadcrumbs.length - 1 ? `<a href="${b.url}">${b.name}</a> / ` : `<span>${b.name}</span>`).join('')}</nav>`
    : ''
  const footer = FOOTER_LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join(' ')

  return `<header><a href="/" aria-label="Global Working Norge – hjem">Global Working Norge</a><nav aria-label="Hovedmeny">${nav}</nav></header><main id="main-content">${crumbs}<h1>${h1}</h1><p>${description}</p>${extraContent || ''}</main><footer><p>© ${new Date().getFullYear()} Global Working Norge AS</p><p>E-post: kontakt@globalworking.no | Telefon: +47 919 00 649</p><nav aria-label="Bunntekst">${footer}</nav></footer>`
}

// `Article`, no `NewsArticle`: eso último es para medios de comunicación.
// Global Working es una reclutadora que publica notas y entrevistas; fuera de
// Google News (donde no está dada de alta) declararse medio no aporta nada y
// sí abre un desajuste entre lo declarado y lo que hay. `Article` es el padre
// de ambos y describe lo que es sin afirmar nada falso.
//
// Tiene que coincidir con buildArticleSchema en src/lib/seo.js. Google lee
// ESTE, el estático; el de seo.js solo se inyecta después, por JS.
const buildArticleNode = (article, url) => ({
  '@type': 'Article',
  '@id': `${url}#article`,
  headline: article.title,
  description: article.description,
  datePublished: article.publishAt || `${article.date}T08:00:00Z`,
  // Sin `dateModified`: antes se emitía igual que datePublished en los diez
  // artículos, que no dice «no se editó», dice «no lo sé». Ausente, Google
  // asume que no se ha tocado desde que salió, que es la verdad.
  // `author` y `publisher` apuntan al MISMO nodo que el resto del sitio, en vez
  // de repetir una Organization anónima por artículo. Antes había diez copias
  // sueltas de «Global Working» que para un buscador podían ser diez empresas.
  author: ORG_REF,
  publisher: ORG_REF,
  // Un objeto, no una cadena: `mainEntityOfPage` espera una entidad, y una URL
  // pelada obliga al consumidor a inferir de qué tipo es.
  mainEntityOfPage: { '@id': `${url}#webpage` },
  isPartOf: { '@id': `${url}#webpage` },
  inLanguage: 'nb-NO',
  image: [article.image || DEFAULT_IMAGE],
})

const buildWebPageNode = (route, url, breadcrumbs, extraNodes) => {
  const faq = extraNodes.find((n) => n['@type'] === 'FAQPage')
  const subject = extraNodes.find((n) => n['@type'] === 'Service' || n['@type'] === 'Course')
  return {
    // Afinado por ruta: AboutPage, ContactPage o CollectionPage donde aplica.
    // Mismo criterio que SECTION_SEO en src/lib/seo.js.
    '@type': route.schemaType || 'WebPage',
    '@id': `${url}#webpage`,
    name: route.title,
    description: route.description,
    url,
    inLanguage: 'nb-NO',
    isPartOf: { '@id': WEBSITE_ID },
    about: ORG_REF,
    primaryImageOfPage: { '@id': `${SITE_URL}/#logo` },
    ...(breadcrumbs ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
    // `mainEntity` dice DE QUÉ va la página, no qué hay dentro. En /om-oss es
    // el bloque de preguntas; en /helse y /vr-rekrutteringsmodell, el servicio.
    ...(faq ? { mainEntity: { '@id': faq['@id'] } }
      : subject ? { mainEntity: { '@id': subject['@id'] } }
        : {}),
  }
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

/** Un solo <script> por página con todos los nodos y sus relaciones. */
const buildGraph = (nodes) => JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
})

// ── Limpieza de los bloques sueltos de index.html ────────────────────────────
// `index.html` trae tres JSON-LD de nivel superior sin `@id`. Si se dejan,
// quedan junto al grafo y el resultado es la misma empresa descrita dos veces
// sin que nada diga que es la misma: Google tendría que adivinar, y adivinando
// a veces se queda con la versión pobre. Se quitan del HTML SERVIDO y el grafo
// los sustituye con todos sus datos — `index.html` no se toca, así que en `dev`
// y en la web hidratada no cambia nada.
const LEGACY_JSONLD = /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g

const stripLegacyJsonLd = (html) => {
  const found = html.match(LEGACY_JSONLD)
  if (!found || found.length === 0) {
    throw new Error(
      'prerender: no se encontró ningún <script type="application/ld+json"> en dist/index.html. ' +
      'Los bloques de index.html cambiaron de forma; el grafo se habría sumado a ellos ' +
      'en vez de sustituirlos, duplicando la entidad.',
    )
  }
  return html.replace(LEGACY_JSONLD, '')
}

// ── Enlazado interno contextual ──────────────────────────────────────────────
// La nav y el footer ya enlazan todo con todo, y por eso mismo no dicen nada:
// un enlace que está en las veinticuatro páginas no señala relación entre dos.
// Esto enlaza /helse con /vr-rekrutteringsmodell, con helsenorsk y con los
// artículos donde una kommune cuenta que funcionó — con el título real como
// texto del enlace, que es la parte que lleva la señal.
const RELATED_HEADING = 'Les mer'

/** Desde cualquier artículo, hacia las páginas que se contratan. */
const ARTICLE_RELATED = ['/helse', '/vr-rekrutteringsmodell', '/talentportalen', '/kontakt']

const relatedLabel = (ref, articles) => {
  if (ref.startsWith('news:')) {
    const slug = ref.slice(5)
    const article = articles.find((a) => a.slug === slug)
    return article ? { href: `/nyheter/${slug}`, label: article.title } : null
  }
  const route = ROUTES[ref]
  return route ? { href: ref, label: route.title.split(' | ')[0] } : null
}

const buildRelatedNav = (related, articles) => {
  if (!Array.isArray(related) || related.length === 0) return ''
  const links = related.map((ref) => relatedLabel(ref, articles)).filter(Boolean)
  if (links.length === 0) return ''
  const items = links.map((l) => `<li><a href="${l.href}">${escapeHtml(l.label)}</a></li>`).join('')
  return `<nav aria-label="${RELATED_HEADING}"><h2>${RELATED_HEADING}</h2><ul>${items}</ul></nav>`
}

/** Las seis preguntas publicadas, como HTML estático en /om-oss. */
const buildFaqBody = () => {
  const items = faqItems()
  if (items.length === 0) return ''
  const blocks = items
    .map((item) => `<h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p>`)
    .join('')
  // Sin `aria-label`: no hay en publishedContent un título para este bloque y
  // no se va a inventar uno en noruego desde un script. Los <h3> ya dan la
  // estructura, que es lo que necesitan tanto el lector de pantalla como el
  // rastreador.
  return `<section>${blocks}</section>`
}

// ── Vídeos de la portada: PENDIENTE, y conviene saber por qué ────────────────
// `src/lib/seo.js` construye tres VideoObject para el carrusel de la portada,
// pero lo hace desde JavaScript: Google no los ha visto nunca, y los
// rastreadores de IA tampoco. Son datos estructurados escritos que no cuentan
// para nada, y espejarlos aquí sería el arreglo.
//
// No se puede todavía. Los vídeos viven en `src/data/siteContent.js`, que
// importa `'../assets/images'` SIN extensión: Vite lo resuelve, Node a secas
// no, así que este script no puede importar ese archivo
// (ERR_MODULE_NOT_FOUND). Se arregla con un carácter —`'../assets/images.js'`—
// en src/data/siteContent.js, y entonces esto puede importarlo igual que
// publishedContent.js.
//
// La alternativa era copiar aquí los ids y los textos de los vídeos. No se ha
// hecho a propósito: dos copias de los mismos datos acaban diciendo cosas
// distintas, que es exactamente el problema que este script existe para
// evitar. Mejor que falte y se sepa que falta.

/** Índice de noticias generado de los .md, nunca a mano. */
const buildNewsIndexBody = (articles) => {
  if (articles.length === 0) return ''
  const items = articles
    .map((a) => `<li><a href="/nyheter/${a.slug}">${escapeHtml(a.title)}</a></li>`)
    .join('')
  return `<ul>${items}</ul>`
}

const injectMeta = (html, pathname, route, articles) => {
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

  const extraNodes = buildExtraNodes(route, url)
  const graph = buildGraph([
    ...entityNodes(),
    buildWebPageNode(route, url, breadcrumbs, extraNodes),
    buildBreadcrumbNode(breadcrumbs, url),
    ...extraNodes,
  ])
  const schemas = `
    <script type="application/ld+json">${graph}</script>`

  result = result.replace(
    '<!-- Analytics is initialized from app code only after cookie consent -->',
    `${schemas}\n    <!-- Analytics is initialized from app code only after cookie consent -->`,
  )

  // Inject body skeleton — gives crawlers real content (nav, H1, description, footer)
  const h1 = route.title.split(' | ')[0]
  const extraContent = [
    route.bodyExtra || '',
    route.newsIndex ? buildNewsIndexBody(articles) : '',
    route.faqBody ? buildFaqBody() : '',
    buildRelatedNav(route.related, articles),
  ].join('')
  const body = buildBodySkeleton({ h1, description: route.description, breadcrumbs, extraContent })
  result = injectBody(result, body, pathname)
  result = stripHomePreload(result)

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

  const crumbs = [
    { name: 'Forside', url: SITE_URL },
    { name: 'Nyheter', url: `${SITE_URL}/nyheter` },
    { name: article.title, url },
  ]
  const graph = buildGraph([
    ...entityNodes(),
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      name: `${article.seoTitle || article.title} | Global Working`,
      description,
      url,
      inLanguage: 'nb-NO',
      isPartOf: { '@id': WEBSITE_ID },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      primaryImageOfPage: { '@type': 'ImageObject', url: image },
      mainEntity: { '@id': `${url}#article` },
    },
    buildArticleNode({ ...article, description, image }, url),
    buildBreadcrumbNode(crumbs, url),
  ])

  const schemas = `
    <script type="application/ld+json">${graph}</script>`

  result = result.replace(
    '<!-- Analytics is initialized from app code only after cookie consent -->',
    `${schemas}\n    <!-- Analytics is initialized from app code only after cookie consent -->`,
  )

  // Inject body skeleton for article
  const dateLabel = article.date ? `<time datetime="${article.date}">${article.date}</time>` : ''
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
  // Los artículos son la prueba (una kommune contando que funcionó) y hasta
  // ahora no devolvían nada: enlazaban a todo por la nav y a nada en concreto.
  // Desde cada uno, enlace a lo que se contrata.
  const related = buildRelatedNav(ARTICLE_RELATED, [])
  const body = buildBodySkeleton({
    h1: article.title,
    description: article.excerpt || article.description,
    breadcrumbs: crumbs,
    extraContent: `${dateLabel}${excerptHtml}${bodyPreview}${related}`,
  })
  result = injectBody(result, body, `/nyheter/${article.slug}`)
  result = stripHomePreload(result)

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

// Antes esto también consultaba news_posts en Supabase y lo remoto pisaba a lo
// local. Supabase se desconectó: las noticias son ahora los .md del repo, que
// es lo mismo que lee la web en src/lib/news.js.
const loadArticles = async () => {
  const articles = await loadLocalArticles()
  // Más nuevo primero. Antes el orden era el de `readdir`, o sea el del sistema
  // de archivos: el índice de noticias y llms.txt salían en un orden arbitrario
  // que cambiaba de máquina a máquina.
  articles.sort((a, b) =>
    String(b.publishAt || b.date || '').localeCompare(String(a.publishAt || a.date || '')),
  )
  console.log(`  Articles: ${articles.length} desde src/content/news`)
  return articles
}

// ── llms.txt ─────────────────────────────────────────────────────────────────
// Las dos listas de `public/llms.txt` estaban escritas a mano y se habían
// quedado atrás: cuatro artículos de diez, y DOS de los cuatro apuntando a
// slugs que ya no existen (`evaluering-sprakniva`, `sor-fron-integrasjon`).
// Ese archivo es precisamente el que leen GPTBot, ClaudeBot y PerplexityBot
// para saber qué hay en la web — mandarles a dos páginas muertas y esconderles
// ocho vivas es lo contrario de lo que hace un llms.txt.
//
// Ahora las listas se generan de las rutas reales y de los .md, igual que el
// sitemap. El TEXTO sigue editándose a mano en public/llms.txt; solo los dos
// marcadores se sustituyen, y si desaparecen el build revienta.
const LLMS_SRC = path.resolve('public/llms.txt')
const LLMS_OUT = path.join(DIST_DIR, 'llms.txt')
const LLMS_PAGES_MARKER = '<!--LLMS-PAGES-->'
const LLMS_NEWS_MARKER = '<!--LLMS-NEWS-->'

// El orden importa: quien paga es el responsable de personal de una kommune,
// así que lo que contrata va arriba y el programa de Alicante —que interesa al
// candidato, no al que ficha— detrás.
const LLMS_PAGE_ORDER = [
  '/helse',
  '/vr-rekrutteringsmodell',
  '/talentportalen',
  '/spansk-i-alicante/helsenorsk',
  '/om-oss',
  '/kontakt',
  '/nyheter',
  '/spansk-i-alicante',
  '/spansk-i-alicante/livet-som-student',
  '/spansk-i-alicante/hvorfor',
]

const writeLlmsTxt = async (articles) => {
  const raw = await readFile(LLMS_SRC, 'utf8')
  for (const marker of [LLMS_PAGES_MARKER, LLMS_NEWS_MARKER]) {
    if (!raw.includes(marker)) {
      throw new Error(
        `prerender: public/llms.txt no contiene ${marker}. Las listas de páginas y ` +
        'artículos se generan aquí; sin el marcador se publicarían las de hace meses.',
      )
    }
  }

  const pages = [
    `- Forside: ${SITE_URL}/`,
    ...LLMS_PAGE_ORDER.map((p) => {
      const route = ROUTES[p]
      if (!route) throw new Error(`prerender: llms.txt apunta a ${p}, que no está en ROUTES.`)
      return `- ${route.title.split(' | ')[0]}: ${SITE_URL}${p}`
    }),
  ].join('\n')

  const news = articles.length > 0
    ? articles.map((a) => `- ${a.title}: ${SITE_URL}/nyheter/${a.slug}`).join('\n')
    : '- (ingen artikler)'

  const out = raw
    .replace(LLMS_PAGES_MARKER, pages)
    .replace(LLMS_NEWS_MARKER, news)

  await writeFile(LLMS_OUT, out, 'utf8')
  return { pages: LLMS_PAGE_ORDER.length + 1, news: articles.length }
}

const run = async () => {
  // Los bloques JSON-LD sueltos de index.html se quitan una vez, aquí, y el
  // grafo con `@id` los sustituye en cada ruta. Si index.html deja de tenerlos,
  // esto revienta en vez de duplicar la entidad en silencio.
  const rawHtml = await readFile(INDEX_PATH, 'utf8')
  const baseHtml = stripLegacyJsonLd(rawHtml)
  let generated = 0

  // Los artículos se cargan ANTES de las rutas: /nyheter construye su índice
  // con ellos, y las páginas enlazan a artículos por su título real.
  const articles = await loadArticles()

  for (const [pathname, route] of Object.entries(ROUTES)) {
    const routeDir = path.join(DIST_DIR, ...pathname.split('/').filter(Boolean))
    await mkdir(routeDir, { recursive: true })
    const html = injectMeta(baseHtml, pathname, route, articles)
    await writeFile(path.join(routeDir, 'index.html'), html, 'utf8')
    generated++
  }

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
      buildNewsIndexBody(articles.slice(0, 4)),
    ].join(''),
  })

  // La portada es la única ruta que no pasa por injectMeta, así que su grafo se
  // arma aquí: las mismas entidades que el resto más su propia WebPage y los
  // VideoObject, que hasta ahora solo existían en el JavaScript de seo.js.
  const homeUrl = `${SITE_URL}/`
  const homeGraph = buildGraph([
    ...entityNodes(),
    {
      '@type': 'WebPage',
      '@id': `${homeUrl}#webpage`,
      name: 'Rekruttering av sykepleiere fra utlandet | Global Working Norge',
      description: 'Vi rekrutterer sykepleiere og helsefagarbeidere fra Sør-Europa til norske kommuner og sykehus. 650 timer helsenorsk, hjelp med autorisasjon og oppfølging helt frem til oppstart.',
      url: homeUrl,
      inLanguage: 'nb-NO',
      isPartOf: { '@id': WEBSITE_ID },
      about: ORG_REF,
      primaryImageOfPage: { '@id': `${SITE_URL}/#logo` },
    },
  ])

  // La portada conserva el preload: es la única ruta donde el hero se usa.
  // Solo se quitan los comentarios que lo delimitan, que ya no pintan nada.
  let homeHtml = injectBody(baseHtml, homeSkeleton, '/')
    .replace(PRELOAD_START, '')
    .replace(PRELOAD_END, '')
    .replace(
      '<!-- Analytics is initialized from app code only after cookie consent -->',
      `<script type="application/ld+json">${homeGraph}</script>\n    <!-- Analytics is initialized from app code only after cookie consent -->`,
    )
  await writeFile(INDEX_PATH, homeHtml, 'utf8')

  // Comprobación final sobre lo ESCRITO EN DISCO, no sobre lo que creemos
  // haber escrito. El guard de injectBody cubre el marcador; esto cubre el
  // resultado: cuerpo con <h1> y un grafo con la entidad dentro.
  //
  // El grafo se comprueba porque es justo el tipo de cosa que desaparece sin
  // avisar: basta con que alguien reordene el comentario de analytics y el
  // `replace` deje de encontrar su ancla. Un `@id` que no llega al HTML es un
  // `@id` que no existe, y la web volvería a tener cuatro entidades sueltas
  // mientras el código dice que tiene una.
  const written = [
    INDEX_PATH,
    ...Object.keys(ROUTES).map(
      (p) => path.join(DIST_DIR, ...p.split('/').filter(Boolean), 'index.html'),
    ),
    ...articles.map((a) => path.join(DIST_DIR, 'nyheter', a.slug, 'index.html')),
  ]
  for (const file of written) {
    const html = await readFile(file, 'utf8')
    const rel = path.relative(DIST_DIR, file)
    if (!html.includes('<h1>')) {
      throw new Error(`prerender: ${rel} se escribió sin <h1>.`)
    }
    if (!html.includes('"@graph"')) {
      throw new Error(`prerender: ${rel} se escribió sin el @graph de datos estructurados.`)
    }
    if (!html.includes(`"@id":"${ORG_ID}"`)) {
      throw new Error(`prerender: ${rel} no declara la entidad ${ORG_ID}.`)
    }
    const sueltos = (html.match(LEGACY_JSONLD) || []).length
    if (sueltos !== 1) {
      throw new Error(
        `prerender: ${rel} tiene ${sueltos} bloques JSON-LD y debería tener exactamente 1 (el grafo).`,
      )
    }
  }

  const llms = await writeLlmsTxt(articles)

  console.log(`Prerender meta: generated ${generated} HTML files (${Object.keys(ROUTES).length} pages + ${articles.length} articles) + homepage skeleton.`)
  console.log(`  Cuerpo estático y @graph verificados en ${written.length} archivos.`)
  console.log(`  llms.txt: ${llms.pages} páginas + ${llms.news} artículos desde las fuentes reales.`)
}

run().catch((error) => {
  console.error('Failed to prerender meta:', error)
  process.exit(1)
})
