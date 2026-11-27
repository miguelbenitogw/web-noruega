import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import publishedContent from '../src/data/publishedContent.js'
import siteContent from '../src/data/siteContent.js'
import { deepMergeContent } from '../src/lib/contentMappers.js'
import { escapeHtml as esc, richTextToHtml, markdownTextToHtml, articleToHtml } from '../src/lib/staticHtml.js'
import { parseTourChapters } from '../src/lib/talentTour.js'

const DIST_DIR = path.resolve('dist')
const INDEX_PATH = path.join(DIST_DIR, 'index.html')
const NEWS_DIR = path.resolve('src/content/news')
const SITE_URL = 'https://globalworking.no'
const DEFAULT_IMAGE = 'https://globalworking.no/assets/media/og-default.jpg'
const SITE_NAME = 'Global Working Norge'

// El MISMO contenido que pinta la web: siteContent con publishedContent encima,
// con la misma función que usa src/hooks/useContent.js. Las cifras del hero, los
// contactos y los vídeos salen de aquí, no de copias escritas a mano en este
// script: si alguien cambia «2500+» en publishedContent, el HTML estático cambia
// con él. Antes la portada estática decía «over 50 norske arbeidsgivere» —una
// lectura equivocada de «50+ ansatte»— mientras la web decía otra cosa.
const content = deepMergeContent(siteContent, publishedContent)

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
// La certificación es el dato que más pesa para quien firma en una kommune, y
// hasta ahora solo existía como texto suelto en /om-oss. Espejo de seo.js.
// Sin `about` (el alcance del certificado): no está confirmado por el cliente,
// y un alcance publicado que no coincide con el real es justo lo que un
// comprador de una kommune puede comprobar.
// Datos copiados del certificado (CERT_9001_NOR.pdf, Nextcloud de Global
// Working), publicados con autorización expresa del cliente el 24/11/2026.
// El alcance es el texto literal del certificado: no se resume ni se adorna,
// porque un kommune puede pedir el certificado y comparar palabra por palabra.
// Si el certificado se renueva (caduca el 07/01/2028), hay que actualizar
// número y fechas aquí y en el espejo (src/lib/seo.js ↔ scripts/prerender-meta.mjs).
const ISO_CERTIFICATION = {
  '@type': 'Certification',
  name: 'ISO 9001:2015',
  description: 'Utvelgelse av personell for internasjonal rekruttering. Opplæring i språk og kultur som hjelpemiddel til internasjonal rekruttering.',
  certificationIdentification: '4410015510134',
  validFrom: '2025-02-06',
  expires: '2028-01-07',
  issuedBy: { '@type': 'Organization', name: 'TÜV NORD CERT GmbH', url: 'https://www.tuev-nord-cert.com' },
}

// El fundador como entidad, con el `founder` de la Organization apuntando a
// él. Sin esto Pablo Lanza no existía en ningún grafo ni en ningún HTML
// estático. La foto es la misma que pinta /om-oss. Espejo de seo.js.
const FOUNDER_ID = `${SITE_URL}/#pablo-lanza`
const FOUNDER_NAME = 'Pablo Lanza'
const FOUNDER_TITLE = 'CEO og grunnlegger'

const buildFounderNode = () => ({
  '@type': 'Person',
  '@id': FOUNDER_ID,
  name: FOUNDER_NAME,
  jobTitle: FOUNDER_TITLE,
  worksFor: ORG_REF,
  image: 'https://globalworking.no/assets/media/nc-pablo-lanza-1024.webp',
})

const buildOrganizationNode = () => ({
  // `Organization`, ya no `EmploymentAgency`: en schema.org ese tipo es la
  // agencia de colocación/ETT —el bemanningsbyrå con el que NO queremos que nos
  // confundan— y además cuelga de LocalBusiness. Lo que somos lo dicen
  // `description`, `knowsAbout` y la certificación. Espejo de seo.js.
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_NAME,
  // `global working` es la consulta que trae el 39 % de los clics.
  alternateName: 'Global Working',
  legalName: 'Global Working Norway AS',
  // Org.nr. verificado en Brønnøysundregistrene (24/11/2026); daglig leder Pablo
  // Lanza Garcia. Antes el nombre legal decía «Global Working Norge AS», que no existe.
  identifier: { '@type': 'PropertyValue', propertyID: 'Organisasjonsnummer', value: '918941851' },
  url: SITE_URL,
  logo: { '@type': 'ImageObject', '@id': `${SITE_URL}/#logo`, url: 'https://globalworking.no/assets/media/logo-512.jpg' },
  image: { '@id': `${SITE_URL}/#logo` },
  description: 'Rekrutteringsselskap med egen språkskole i Alicante. Vi rekrutterer og lærer opp sykepleiere og andre fagfolk fra Sør-Europa til faste stillinger hos norske arbeidsgivere, som ansetter kandidaten direkte. Vi er ikke et vikarbyrå.',
  hasCertification: ISO_CERTIFICATION,
  knowsAbout: [
    'Rekruttering av sykepleiere',
    'Rekruttering av helsepersonell fra utlandet',
    'Helsenorsk',
    'Norskopplæring for fagfolk',
  ],
  foundingDate: '2014',
  founder: { '@id': FOUNDER_ID },
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
  // Alicante es también la escuela donde se dan las 650 horas. Que sea propia es
  // lo que nos separa de un bemanningsbyrå: el tipo lo declara.
  '@type': ['LocalBusiness', 'EducationalOrganization'],
  '@id': ALICANTE_ID,
  name: 'Global Working – Alicante',
  url: SITE_URL,
  image: { '@id': `${SITE_URL}/#logo` },
  description: 'Global Workings hovedkontor og egen språkskole i Alicante, der kandidatene får opptil 650 timer norskundervisning før oppstart i Norge.',
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
const entityNodes = () => [buildOrganizationNode(), buildWebSiteNode(), buildAlicanteNode(), buildFounderNode()]

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

// Personas con nombre: `anette nordskog` ya aparece como consulta en Search
// Console (posición 1). Un rådgiver con nombre, cargo y teléfono es la prueba más
// barata de que detrás hay una empresa y no un formulario. Salen de `contacts`,
// los mismos que pinta /kontakt. Espejo de buildContactNodes en seo.js.
const slugify = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const contactPeople = () => (Array.isArray(content.contacts) ? content.contacts : []).filter((p) => p && p.name)

const buildContactNodes = (url) => contactPeople().map((p) => ({
  '@type': 'Person',
  '@id': `${url}#${slugify(p.name)}`,
  name: p.name,
  ...(p.role ? { jobTitle: p.role } : {}),
  ...(p.email ? { email: p.email } : {}),
  ...(p.phone ? { telephone: p.phone } : {}),
  worksFor: ORG_REF,
}))

const buildExtraNodes = (route, url) => {
  const extras = route.extras
  if (!extras) return []
  if (extras.kind === 'service') return [buildServiceNode(extras, url)]
  if (extras.kind === 'course') return [buildCourseNode(extras, url)]
  if (extras.kind === 'faq') {
    const faq = buildFaqNode(url)
    return faq ? [faq] : []
  }
  if (extras.kind === 'contacts') return buildContactNodes(url)
  return []
}

// Texto que separa a Global Working de un vikarbyrå, sacado de la pregunta que
// ya está publicada en el FAQ. No se reescribe aquí: si el cliente cambia la
// respuesta, cambia en todas partes.
const vikarbyraAnswer = () => {
  const items = Array.isArray(publishedContent?.faq?.items) ? publishedContent.faq.items : []
  const hit = items.find((i) => /vikarbyrå/i.test(String(i?.q ?? '')))
  return hit ? flattenAnswer(hit.a) : ''
}

// ── Cuerpo completo de las páginas de servicio ──────────────────────────────
// Antes el HTML estático de /helse, /vr-rekrutteringsmodell y /talentportalen
// era UN párrafo escrito a mano (180–280 palabras con la nav). Las fases, las
// cifras, los pasos y la explicación del modelo solo existían después de
// JavaScript, o sea nunca para GPTBot, ClaudeBot o PerplexityBot, y para
// Google solo en la segunda pasada. /vr-rekrutteringsmodell ni siquiera está
// indexada.
//
// Cada sección sale de la MISMA clave de contenido que lee el componente de
// React, en el mismo orden en que la pinta la página. Nada se escribe acá: si
// alguien cambia un texto en publishedContent, cambia la web y cambia esto.
//
// Los testimonios de GodeGrunner no se escriben aquí. Los tres que había no
// eran reales y se quitaron de los datos el 25/11/2026; si vuelven testimonios
// verificados, que se añadan aquí también.
const section = (heading, inner) => (inner ? `<section><h2>${esc(heading)}</h2>${inner}</section>` : '')

const listOf = (items, render, tag = 'ul') => {
  const lis = (Array.isArray(items) ? items : []).filter(Boolean).map(render).filter(Boolean)
  return lis.length ? `<${tag}>${lis.map((li) => `<li>${li}</li>`).join('')}</${tag}>` : ''
}

/** Lo que pinta <PageHero /> debajo del título: su bajada. */
const heroLead = (key) => richTextToHtml(content[key]?.description)

/** <GodeGrunner />, sin los testimonios (ver arriba). */
const godeGrunnerHtml = () => {
  const c = content.godeGrunner || {}
  const link = c.articleLink && c.articleLinkLabel
    ? `<p><a href="${esc(c.articleLink)}">${esc(c.articleLinkLabel)}</a></p>`
    : ''
  return section(c.heading, `${richTextToHtml(c.description)}${link}`)
}

const helseSections = () => {
  const comp = content.helsesektorComp || {}
  // Mismas cifras y en el mismo orden que <Helsesektor />: stats + grupos.
  const metrics = [
    ...(comp.stats || []),
    ...(comp.groupsValue ? [{ value: comp.groupsValue, label: comp.groupsLabel }] : []),
  ]
  const phases = content.helsePhases || {}
  const partnership = content.helsePartnership || {}
  return [
    heroLead('helseHero'),
    section(comp.heading, [
      richTextToHtml(comp.description),
      listOf(metrics, (m) => (m.value ? `${esc(m.value)} ${esc(m.label)}` : '')),
    ].join('')),
    section(phases.heading, [
      richTextToHtml(phases.description),
      listOf(phases.phases, (p) => [
        `<h3>${esc(p.title)}</h3>`,
        richTextToHtml(p.description),
        listOf(p.formats, (f) => `${esc(f.duration)}: ${esc(f.label)}`),
      ].join(''), 'ol'),
    ].join('')),
    section(partnership.heading, `${richTextToHtml(partnership.p1)}${richTextToHtml(partnership.p2)}`),
    godeGrunnerHtml(),
  ].join('')
}

const rekrutteringSections = () => {
  const hva = content.hvaGjor || {}
  const comp = content.rekrutteringComp || {}
  const collab = content.rekrutteringCollab || {}
  return [
    heroLead('rekrutteringHero'),
    section(hva.heading, [
      richTextToHtml(hva.description),
      listOf(hva.services, (s) => `<h3>${esc(s.title)}</h3>${richTextToHtml(s.description)}`),
    ].join('')),
    section(comp.heading, [
      comp.badge ? `<p>${esc(comp.badge)}</p>` : '',
      listOf(comp.steps, (s) => (s.title ? `${esc(s.title)}${s.description ? `: ${esc(s.description)}` : ''}` : ''), 'ol'),
      // p1–p3 pasan por <MarkdownText />: traen sus propios ## y listas.
      ...['p1', 'p2', 'p3'].map((k) => markdownTextToHtml(comp[k])),
    ].join('')),
    section(collab.heading, ['p1', 'p2', 'p3'].map((k) => richTextToHtml(collab[k])).join('')),
    godeGrunnerHtml(),
  ].join('')
}

// El recorrido del iframe, leído de su propio HTML (ver src/lib/talentTour.js).
// Se carga una vez, en run(), antes de generar las rutas.
let tourChapters = []

const talentportalenSections = () => {
  const comp = content.talentportalenComp || {}
  const steps = content.talentportalenSteps || {}
  const benefits = content.talentportalenBenefits || {}
  return [
    heroLead('talentportalenHero'),
    // El mismo titular que lleva la sección del iframe en TalentportalenPage.
    section('Se Talent Portal i praksis', listOf(tourChapters, (ch) =>
      `<h3>${esc(ch.title)}</h3><dl>${ch.steps.map((s) => `<dt>${esc(s.t)}</dt><dd>${esc(s.d)}</dd>`).join('')}</dl>`, 'ol')),
    section(comp.heading, [
      richTextToHtml(comp.description),
      listOf(comp.benefits, (b) => `<h3>${esc(b.title)}</h3>${richTextToHtml(b.desc)}`),
    ].join('')),
    section(steps.heading, listOf(steps.steps, (s) => `<h3>${esc(s.title)}</h3>${richTextToHtml(s.desc)}`, 'ol')),
    section(benefits.heading, listOf(benefits.items, (i) => esc(i))),
  ].join('')
}

// /om-oss: la cita del fundador que pinta <OmOss />, firmada con nombre y
// cargo. Es lo que hace visible a Pablo Lanza en el HTML estático; el nodo
// `Person` del grafo dice lo mismo para las máquinas.
const omOssFounderHtml = () => {
  const quote = content.omOssComp?.blockquote?.text
  const signature = `${FOUNDER_NAME}, ${FOUNDER_TITLE}`
  return quote
    ? `<blockquote><p>${esc(quote)}</p><footer>${esc(signature)}</footer></blockquote>`
    : `<p>${esc(signature)}</p>`
}

const ROUTES = {
  '/vr-rekrutteringsmodell': {
    title: 'Slik rekrutterer du helsepersonell fra utlandet | Global Working',
    description: 'Hvordan rekruttere helsepersonell fra utlandet? Se hele prosessen steg for steg: utvelgelse, 650 timer helsenorsk, autorisasjon og oppfølging frem til første arbeidsdag.',
    keywords: 'hvordan rekruttere helsepersonell, internasjonal rekruttering, rekruttering av sykepleiere, arbeidsinnvandring',
    breadcrumbName: 'Rekrutteringsmodell',
    // Corregido contra el contenido publicado: decía «opp til B2-nivå» para TODOS
    // (el artículo de evaluación dice que el mínimo es aprobar el B1) y hablaba de
    // «universiteter» que no aparecen en ningún otro sitio de la web.
    bodyExtra: '<h2>Slik fungerer rekrutteringsprosessen</h2><p>Global Workings rekrutteringsmodell er bygd opp i fire faser: utvelgelse av kandidater, språklig og faglig forberedelse på vår egen språkskole, dokumenthåndtering og autorisasjon, og oppfølging etter oppstart i Norge. Kandidatene kommer hovedsakelig fra Spania, Italia og Frankrike. De får opptil 650 undervisningstimer i norsk, må bestå B1-eksamen og kan nå opp mot B2 når rollen krever det. Opplæringen tar 5 måneder fysisk i Alicante, 7 måneder kombinert eller 9 måneder nettbasert.</p><p>Arbeidsgiveren intervjuer så mange kandidater den ønsker, uten forpliktelse, og ansetter kandidaten direkte. Global Working er ikke et vikarbyrå og har ikke arbeidsgiveransvar.</p>',
    sections: rekrutteringSections,
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
    // Descripción: 82 impresiones y 0 clics en tres meses. Ahora dice lo que nos
    // separa de un vikarbyrå y nombra dos kommuner reales. Title y descripción
    // arrancan con «rekruttering av helsepersonell» (Semrush, pos. 20). Espejo de seo.js.
    title: 'Rekruttering av helsepersonell og sykepleiere | Global Working',
    description: 'Rekruttering av helsepersonell: sykepleiere med opptil 650 timer norsk, ansatt direkte hos dere – ikke via vikarbyrå. Slik gjorde Vågå og Sør-Fron kommune.',
    keywords: 'rekruttering sykepleiere, rekruttering helsepersonell, utenlandske sykepleiere i Norge, faste sykepleiere kommune, mangel på sykepleiere',
    breadcrumbName: 'Helsesektor',
    // «tett oppfølging det første året» no lo dice ningún texto publicado: el FAQ
    // habla de la prøveperiode. Los dos casos salen de los artículos de Vågå y
    // Sør-Fron, con sus cifras.
    bodyExtra: '<h2>Rekruttering av helsepersonell til Norge</h2><p>Global Working rekrutterer sykepleiere og helsefagarbeidere fra Sør-Europa til faste stillinger i norske kommuner og helseforetak. Før oppstart får kandidatene opptil 650 timer norsk og helsenorsk på vår egen språkskole i Alicante. Vi hjelper med autorisasjon hos Helsedirektoratet, dokumenter og papirarbeid, og følger opp kandidat og arbeidsgiver gjennom prøveperioden. Kommunen ansetter kandidaten direkte – vi er ikke et vikarbyrå.</p><h2>Kommuner som har gjort det</h2><p>Vågå kommune ansatte seks sykepleiere fra Spania som hadde lært norsk i Alicante; alle seks har i dag fast jobb ved helsehjemmet. I Sør-Fron startet samarbeidet med to sykepleiere og endte med fire sykepleiere og to assistenter.</p>',
    sections: helseSections,
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
    sections: talentportalenSections,
    related: ['/helse', '/vr-rekrutteringsmodell', 'news:kandidatportal-lansert'],
    // Espejo de EXTRAS['/talentportalen'] en seo.js. Sin precio ni condiciones
    // de acceso: las tiene que confirmar el cliente.
    extras: {
      kind: 'service',
      name: 'Talentportalen',
      serviceType: 'Kandidatportal for rekruttering av helsepersonell',
      summary: 'Talentportalen er vår kandidatportal: se tilgjengelige sykepleiere og helsefagarbeidere med dokumentert norsknivå, og inviter til intervju direkte.',
      audienceType: 'Norske arbeidsgivere',
    },
  },
  '/om-oss': {
    schemaType: 'AboutPage',
    // 262 impresiones, 1 clic (CTR 0,4 %): búsquedas de marca que no encontraban
    // lo que buscaban, que es saber si la empresa es seria. «byrå» fuera: suena a
    // bemanningsbyrå. Espejo de seo.js.
    title: 'Om Global Working – rekruttering og språkskole siden 2014',
    description: 'Ikke et vikarbyrå: dere ansetter kandidaten direkte. Grunnlagt 2014, egen språkskole i Alicante, kontor i Oslo, 50+ ansatte og ISO 9001:2015-sertifisert av TÜV Nord.',
    keywords: 'om Global Working, rekrutteringsselskap helsepersonell, ISO 9001 rekruttering, språkskole Alicante, internasjonal rekruttering',
    breadcrumbName: 'Om oss',
    // Los porcentajes del equipo y la certificación salen de omOssComp en
    // publishedContent: es lo que pinta /om-oss después de JavaScript.
    bodyExtra: '<h2>Hvem er Global Working?</h2><p>Global Working ble grunnlagt i 2014 og har hovedkontor og egen språkskole i Alicante, Spania, og kontor i Oslo. Vi er over 50 ansatte: 25 % av teamet er psykologer som jobber med seleksjon og oppfølging, og 50 % er språklærere. Prosessene våre er ISO 9001:2015-sertifisert av TÜV Nord for språkundervisning og internasjonal rekruttering.</p><p>Vi er et rekrutteringsselskap, ikke et vikarbyrå: virksomheten som ansetter kandidaten blir arbeidsgiver, og målet er faste, langvarige ansettelser.</p>',
    sections: omOssFounderHtml,
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
    // La gente llega buscando nombres (`anette nordskog`): la descripción nombra
    // a quien contesta. Espejo de seo.js; si cambia `contacts`, cambiar esto.
    title: 'Kontakt oss om rekruttering av helsepersonell | Global Working',
    description: 'Snakk med rådgiverne Miriam Svendsen og Gro Anette Nordskog om rekruttering av sykepleiere og helsefagarbeidere. Uforpliktende samtale, svar innen én virkedag.',
    keywords: 'kontakt Global Working, rekruttering kontakt, samarbeid Norge',
    breadcrumbName: 'Kontakt',
    bodyExtra: '<h2>Ta kontakt med oss</h2><p>Har du spørsmål om rekruttering, samarbeid eller kandidatportalen? Vi svarer gjerne. E-post: kontakt@globalworking.no. Telefon: +47 919 00 649. Besøksadresse: Carrer de Periodista Pirula Arderius, 4, 03001 Alicante, Spania.</p>',
    // La lista de personas se genera de `contacts` (ver buildContactsBody).
    contactsBody: true,
    extras: { kind: 'contacts' },
  },
  '/spansk-i-alicante': {
    // `lær spansk i alicante` y `spanski i alicante` esperaban un curso de
    // español; el título viejo lo prometía. Ahora dice qué es. Espejo de seo.js.
    title: 'Spansk i Alicante: bo gratis som samtaleassistent | Global Working',
    description: 'Bo gratis i Alicante og jobb rundt 15 timer i uken som samtaleassistent på vår språkskole. Resten av tiden er din – til spanskkurs, jobb eller studier.',
    keywords: 'spansk i Alicante, lær spansk i Alicante, bli samtaleassistent, bo gratis Alicante, språkopphold Spania',
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
    // `helsenorsk`: 165 impresiones, posición 10,9, CTR 3,6 %. El título viejo
    // (71 caracteres) salía cortado. La descripción es también el primer <p> del
    // HTML estático: abre definiendo qué es helsenorsk (Semrush, pos. 17). Espejo de seo.js.
    title: 'Helsenorsk – norskkurs for helsepersonell | Global Working',
    description: 'Helsenorsk er norsk for helsepersonell: fagterminologi og pasientkommunikasjon. Opptil 650 timer i Alicante, undervist av sykepleiere som har jobbet i Norge.',
    keywords: 'helsenorsk, helsenorsk kurs, norskkurs for helsepersonell, norsk for helsepersonell, norskkurs for helseassistenter, helsenorsk Alicante',
    breadcrumbName: 'Helsenorsk',
    parent: { name: 'Spansk i Alicante', path: '/spansk-i-alicante' },
    bodyExtra: '<h2>Helsenorsk: yrkesrettet norsk for helsesektoren</h2><p>Helsenorsk er et sentralt spor i Global Workings opplæringsprogram. Gjennom 650 timer med yrkesrettet norskopplæring bygger sykepleiere og helsefagarbeidere opp et fagspråk knyttet til situasjoner de vil møte i norsk helsetjeneste. Programmet inkluderer simuleringer av realistiske arbeidssituasjoner, og undervises av spanske sykepleiere som selv har gått gjennom Global Working-programmet og jobbet i Norge.</p><p>Alle kandidatene må bestå B1-eksamen i norsk; målet settes ut fra rollen, ofte opp mot B2. Kommunen kan intervjue kandidatene og vurdere språket selv før ansettelse.</p>',
    related: ['/helse', '/vr-rekrutteringsmodell', 'news:praktisk-norsk', 'news:evaluere-norsk-spraak'],
    extras: {
      kind: 'course',
      name: 'Helsenorsk – yrkesrettet norsk for helsesektoren',
      summary: 'Yrkesrettet norskopplæring for sykepleiere og helsefagarbeidere, tilpasset hverdagen i norsk helsetjeneste.',
      teaches: 'Yrkesrettet norsk for helsesektoren: fagterminologi, pasientkommunikasjon og faglig dokumentasjon',
      // 650 h, confirmado por el cliente. Es la misma cifra en toda la web.
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
  '/kvalitetspolicy': {
    title: 'Kvalitetspolicy | Global Working Norge',
    description: 'Kvalitetspolicyen til Global Working: våre forpliktelser overfor kunder og kandidater, og ISO 9001:2015-sertifiseringen fra TÜV NORD CERT.',
    breadcrumbName: 'Kvalitetspolicy',
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

const parseFrontmatter = (input) => {
  // Quita el BOM: con BOM el `^---` no casa y el frontmatter se pierde en
  // silencio, igual que pasaba con CRLF.
  const raw = input.replace(/^\uFEFF/, '')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
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
  { href: '/kvalitetspolicy', label: 'Kvalitetspolicy' },
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

  return `<header><a href="/" aria-label="Global Working Norge – hjem">Global Working Norge</a><nav aria-label="Hovedmeny">${nav}</nav></header><main id="main-content">${crumbs}<h1>${h1}</h1><p>${description}</p>${extraContent || ''}</main><footer><p>© ${new Date().getFullYear()} Global Working Norway AS</p><p>E-post: kontakt@globalworking.no | Telefon: +47 919 00 649</p><nav aria-label="Bunntekst">${footer}</nav></footer>`
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
  // `dateModified` explícito: `updatedAt` del frontmatter si el artículo se
  // editó, y si no la fecha de publicación (la última versión ES la
  // publicada). Ausente, buscadores y LLM lo leen como «fecha desconocida».
  // Al editar un .md, añadirle `updatedAt`. Espejo de setArticleSEO en seo.js.
  dateModified: article.updatedAt || article.publishAt || `${article.date}T08:00:00Z`,
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

// ── Vídeos de la portada ────────────────────────────────────────────────────
// Antes esto estaba PENDIENTE porque src/data/siteContent.js importaba
// '../assets/images' sin extensión y Node no podía cargarlo. Ya lleva `.js`, así
// que los VideoObject se arman aquí con los mismos datos que usa seo.js
// (buildVideoNodes): mismo `@id`, mismos campos. Hasta ahora solo existían en el
// JavaScript del navegador, invisibles para cualquier rastreador que no lo ejecute.
const VIDEO_PROVIDERS = {
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

const buildVideoNodes = (fallbackDescription) => {
  const data = content.homeVideos
  const items = Array.isArray(data?.items) ? data.items.filter((it) => it && it.id) : []
  if (items.length === 0) return []
  const builder = VIDEO_PROVIDERS[data.provider] || VIDEO_PROVIDERS.youtube
  return items.map((item) => ({
    '@type': 'VideoObject',
    '@id': `${SITE_URL}/#video-${item.id}`,
    name: item.title || data.heading || SITE_NAME,
    description: item.description || data.description || fallbackDescription,
    thumbnailUrl: [item.poster || builder.thumb(item.id) || DEFAULT_IMAGE],
    uploadDate: item.uploadDate || '2026-06-17',
    contentUrl: builder.watch(item.id),
    embedUrl: builder.embed(item.id),
    publisher: ORG_REF,
  }))
}

/** Las personas de /kontakt, desde `contacts`: nombre, cargo, teléfono y correo. */
const buildContactsBody = () => {
  const people = contactPeople()
  if (people.length === 0) return ''
  const items = people
    .map((p) => {
      const bits = [p.role, p.phone, p.email].filter(Boolean).map((b) => escapeHtml(String(b)))
      return `<li>${escapeHtml(p.name)}${bits.length ? ` – ${bits.join(', ')}` : ''}</li>`
    })
    .join('')
  return `<h2>Rådgiverne våre</h2><ul>${items}</ul>`
}

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
  // Los bloques JSON-LD de abajo llevan id="page-schema" a propósito: es el id
  // que usa src/lib/seo.js al montar la página, que borra ese bloque y pone el
  // suyo. Sin el id, el estático no se borraba y Google, que ejecuta
  // JavaScript, veía el grafo entero DOS veces.
  const schemas = `
    <script type="application/ld+json" id="page-schema">${graph}</script>`

  result = result.replace(
    '<!-- Analytics is initialized from app code only after cookie consent -->',
    `${schemas}\n    <!-- Analytics is initialized from app code only after cookie consent -->`,
  )

  // Inject body skeleton — gives crawlers real content (nav, H1, description, footer)
  const h1 = route.title.split(' | ')[0]
  const extraContent = [
    route.bodyExtra || '',
    route.sections ? route.sections() : '',
    route.newsIndex ? buildNewsIndexBody(articles) : '',
    route.faqBody ? buildFaqBody() : '',
    route.contactsBody ? buildContactsBody() : '',
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
  // Una ruta que empieza por / sirve como <img> en cualquier entorno, pero no
  // como og:image: las redes exigen URL absoluta y descartan la relativa en
  // silencio. Se guarda relativa en el .md y se absolutiza solo aquí.
  const rawImage = article.coverImage || DEFAULT_IMAGE
  const image = rawImage.startsWith('/') ? `${SITE_URL}${rawImage}` : rawImage
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
    <script type="application/ld+json" id="page-schema">${graph}</script>`

  result = result.replace(
    '<!-- Analytics is initialized from app code only after cookie consent -->',
    `${schemas}\n    <!-- Analytics is initialized from app code only after cookie consent -->`,
  )

  // Inject body skeleton for article
  const dateLabel = article.date ? `<time datetime="${article.date}">${article.date}</time>` : ''
  const excerptHtml = article.excerpt ? `<p><em>${escapeHtml(article.excerpt)}</em></p>` : ''
  // El artículo ENTERO, con sus ## y ### y sus enlaces (citas de NRK
  // incluidas). Antes eran los primeros 800 caracteres aplanados a un párrafo:
  // sor-fron-intervju servía 289 palabras de 1737 y una sola H2, «Les mer».
  // articleToHtml sigue las mismas reglas que <MarkdownArticle />.
  const articleHtml = articleToHtml(article.body || '')
  const bodyPreview = articleHtml ? `<article>${articleHtml}</article>` : ''
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
  const skipped = []
  for (const file of files.filter(f => f.endsWith('.md') && !f.startsWith('_'))) {
    const raw = await readFile(path.join(NEWS_DIR, file), 'utf8')
    const meta = parseFrontmatter(raw)
    if ((meta.status || 'published') !== 'published' || !meta.slug) {
      skipped.push(`${file} (status=${meta.status ?? 'published'}, slug=${meta.slug ?? 'ninguno'})`)
      continue
    }
    // El cuerpo es todo lo que va después del frontmatter. Tolera CRLF por el
    // mismo motivo que parseFrontmatter.
    const bodyMatch = raw.match(/^---[\s\S]*?\r?\n---\r?\n?([\s\S]*)/)
    meta.body = bodyMatch ? bodyMatch[1] : ''
    articles.push(meta)
  }

  // Un .md que no produce artículo casi siempre es un frontmatter ilegible, no
  // una decisión editorial. Pasó de verdad: al hacer checkout en Windows los
  // .md llegaron con CRLF, parseFrontmatter buscaba un delimitador con LF y
  // devolvía {} para los diez. El build no falló: imprimió "Articles: 0" entre
  // treinta líneas de log y generó un sitio sin noticias. Diez URLs vivas se
  // habrían ido a 404 sin que nadie se enterara en semanas.
  //
  // El CRLF ya está arreglado en los parsers. Esto cubre lo que de verdad
  // falló: que la avería fuese silenciosa.
  if (articles.length === 0 && skipped.length > 0) {
    throw new Error(
      [
        `prerender: hay ${skipped.length} .md en ${NEWS_DIR} y ninguno produjo un artículo.`,
        'Lo más probable es que el frontmatter no se esté leyendo.',
        ...skipped.map(line => `  - ${line}`),
      ].join('\n'),
    )
  }
  if (skipped.length > 0) {
    console.log(`  Avisos: ${skipped.length} .md sin publicar: ${skipped.join(', ')}`)
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
// Las cifras del hero también, por el mismo motivo que en la portada: un
// «2500+» escrito a mano en llms.txt se queda viejo el día que cambie en
// publishedContent, y ese archivo es justo el que leen los LLM.
const LLMS_STATS_MARKER = '<!--LLMS-STATS-->'

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
  for (const marker of [LLMS_PAGES_MARKER, LLMS_NEWS_MARKER, LLMS_STATS_MARKER]) {
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

  const stats = (Array.isArray(content.hero?.stats) ? content.hero.stats : [])
    .filter((st) => st && st.value && st.label)
    .map((st) => `- ${st.label}: ${st.value}`)
    .join('\n')
  if (!stats) throw new Error('prerender: hero.stats vacío; llms.txt se publicaría sin cifras.')

  const out = raw
    .replace(LLMS_PAGES_MARKER, pages)
    .replace(LLMS_NEWS_MARKER, news)
    .replace(LLMS_STATS_MARKER, stats)

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

  // El resumen de la omvisning sale del HTML del propio recorrido. Si un día
  // cambia la forma de su diccionario y el parser no encuentra capítulos, se
  // para el build: publicar /talentportalen sin resumen sería volver al
  // párrafo suelto sin que nadie se entere.
  tourChapters = parseTourChapters(await readFile(path.resolve('public/tutorial-talent-portal/index.html'), 'utf8'))
  if (tourChapters.length === 0) {
    throw new Error('prerender: no se encontraron capítulos en public/tutorial-talent-portal/index.html (DICT.nb).')
  }

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

  // ── Portada ──────────────────────────────────────────────────────────────
  // No está en ROUTES (sale de index.html), así que su título y descripción se
  // repiten aquí. TIENEN que ser los de DEFAULT_SEO en seo.js y los de
  // index.html; check-seo-sync compara esos dos.
  const HOME_TITLE = 'Global Working Norge – rekruttering med egen språkskole'
  const HOME_DESCRIPTION = 'Ikke et vikarbyrå: dere ansetter sykepleiere og fagfolk fra Sør-Europa direkte. Egen språkskole i Alicante, ISO 9001:2015-sertifisert, siden 2014.'

  // Las cifras del hero (año, empleados, candidatos, kommuner) las pinta React
  // con un contador animado: en el HTML servido no estaba NINGUNA. Para GPTBot,
  // ClaudeBot o PerplexityBot —que no ejecutan JS— la empresa no tenía tamaño.
  // Salen de `hero.stats` del contenido fusionado, el mismo array que lee
  // src/components/Hero.jsx. Si desaparecen, el build falla: es justo el tipo de
  // dato que se pierde sin que nadie lo note.
  const heroStats = (Array.isArray(content.hero?.stats) ? content.hero.stats : [])
    .filter((st) => st && st.value && st.label)
  if (heroStats.length === 0) {
    throw new Error('prerender: hero.stats está vacío; la portada estática se quedaría sin cifras.')
  }
  const statsHtml = `<h2>Global Working i tall</h2><ul>${heroStats
    .map((st) => `<li>${escapeHtml(String(st.label))}: ${escapeHtml(String(st.value))}</li>`)
    .join('')}</ul>`

  // Consultas reales en Search Console que esta portada no contestaba:
  // `hvilke globale kontorer har de i dag?`, `hvor mange?`, `konkrete prosjekter`.
  // Tienen pinta de venir de respuestas generadas; se contestan con hechos ya
  // publicados en la web y en los artículos de Vågå y Sør-Fron.
  const vikar = vikarbyraAnswer()
  const caseLinks = ['vaga', 'sor-fron-intervju']
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter(Boolean)
    .map((a) => `<li><a href="/nyheter/${a.slug}">${escapeHtml(a.title)}</a></li>`)
    .join('')
  // Solo los nombres: la frase ya dice «rådgiverne», y el cargo con teléfono
  // está en /kontakt.
  const people = contactPeople()
    .map((p) => escapeHtml(p.name))
    .join(' og ')

  // Las secciones de la portada, de las mismas claves que leen HomePage y sus
  // componentes, en el orden en que se pintan. Antes «Våre tjenester» era una
  // lista escrita a mano con otras descripciones que las de la web.
  const hs = content.homeServices || {}
  const videos = content.homeVideos || {}
  const hHealth = content.homeHealth || {}
  const teaser = content.spanskAlicanteTeaser || {}
  const banner = content.ctaBanner || {}
  const hContact = content.homeContact || {}

  const homeSkeleton = buildBodySkeleton({
    h1: 'Rekruttering av helsepersonell og fagfolk til Norge',
    description: HOME_DESCRIPTION,
    breadcrumbs: null,
    extraContent: [
      richTextToHtml(content.hero?.description),
      statsHtml,
      section(hs.heading, [
        richTextToHtml(hs.description),
        // La pregunta final es el enlace a /kontakt de <HomePage />: el mismo
        // texto y el mismo destino en el HTML estático que en la web.
        hs.ctaQuestion ? `<p><a href="/kontakt">${esc(hs.ctaQuestion)}</a></p>` : '',
        listOf(hs.sections, (s) => `<h3><a href="${esc(s.href)}">${esc(s.title)}</a></h3>${richTextToHtml(s.description)}`),
      ].join('')),
      section(videos.heading, [
        richTextToHtml(videos.description),
        listOf((videos.items || []).filter((v) => v && v.id), (v) => `<h3>${esc(v.title)}</h3>${richTextToHtml(v.description)}`),
      ].join('')),
      // La descripción trae el enlace a helsenorsk (publishedContent.homeHealth).
      section(hHealth.heading, `${richTextToHtml(hHealth.description)}${hHealth.cta ? `<p><a href="/helse">${esc(hHealth.cta)}</a></p>` : ''}`),
      '<h2>Rekrutteringsselskap, ikke vikarbyrå</h2>',
      vikar ? `<p>${escapeHtml(vikar)}</p>` : '',
      '<p>Global Working ble grunnlagt i 2014 og har hovedkontor og egen språkskole i Alicante, Spania, og kontor i Oslo. Prosessene våre er ISO 9001:2015-sertifisert av TÜV Nord for språkundervisning og internasjonal rekruttering. Kandidatene får opptil 650 timer norskundervisning og må bestå B1-eksamen før oppstart.</p>',
      caseLinks ? `<h2>Kommuner som har gjort det</h2><ul>${caseLinks}</ul>` : '',
      section(teaser.heading, `${richTextToHtml(teaser.description)}${teaser.cta ? `<p><a href="/spansk-i-alicante">${esc(teaser.cta)}</a></p>` : ''}`),
      section(banner.heading, richTextToHtml(banner.description)),
      `<h2>${esc(hContact.heading || 'Kontakt oss')}</h2>`,
      richTextToHtml(hContact.description),
      people ? `<p>Rådgiverne ${people} svarer på spørsmål om rekruttering og samarbeid.</p>` : '',
      '<p>E-post: kontakt@globalworking.no | Telefon: +47 919 00 649</p>',
      '<p><a href="/kontakt">Ta kontakt for en uforpliktende samtale</a></p>',
      buildNewsIndexBody(articles.slice(0, 4)),
    ].join(''),
  })

  // La portada es la única ruta que no pasa por injectMeta, así que su grafo se
  // arma aquí: las mismas entidades que el resto, su propia WebPage y los
  // VideoObject del carrusel — el mismo grafo que setDefaultSEO() en seo.js.
  const homeUrl = `${SITE_URL}/`
  const homeGraph = buildGraph([
    ...entityNodes(),
    {
      '@type': 'WebPage',
      '@id': `${homeUrl}#webpage`,
      name: HOME_TITLE,
      description: HOME_DESCRIPTION,
      url: homeUrl,
      inLanguage: 'nb-NO',
      isPartOf: { '@id': WEBSITE_ID },
      about: ORG_REF,
      primaryImageOfPage: { '@id': `${SITE_URL}/#logo` },
    },
    ...buildVideoNodes(HOME_DESCRIPTION),
  ])

  // La portada conserva el preload: es la única ruta donde el hero se usa.
  // Solo se quitan los comentarios que lo delimitan, que ya no pintan nada.
  let homeHtml = injectBody(baseHtml, homeSkeleton, '/')
    .replace(PRELOAD_START, '')
    .replace(PRELOAD_END, '')
    .replace(
      '<!-- Analytics is initialized from app code only after cookie consent -->',
      `<script type="application/ld+json" id="page-schema">${homeGraph}</script>\n    <!-- Analytics is initialized from app code only after cookie consent -->`,
    )
  await writeFile(INDEX_PATH, homeHtml, 'utf8')

  // ── 404 ─────────────────────────────────────────────────────────────────
  // Antes, el rewrite catch-all de vercel.json mandaba CUALQUIER URL a
  // index.html, así que una dirección inventada devolvía 200 con la portada
  // entera: contenido duplicado indexable en infinitas URLs. Y con el cuerpo
  // prerenderizado iba a peor, porque pasaba a servir también su <h1>.
  //
  // Ahora el rewrite está acotado y lo que no casa con un archivo cae aquí.
  // Vercel sirve este archivo con código 404 de verdad. React monta encima y
  // pinta la página de «no encontrado» de la web, así que el visitante ve algo
  // con la cara del sitio y el buscador ve un 404 con noindex.
  const notFoundSkeleton = buildBodySkeleton({
    h1: 'Siden ble ikke funnet',
    description: 'Kontroller adressen eller gå tilbake til forsiden.',
    breadcrumbs: null,
    extraContent: '<p><a href="/">Tilbake til forsiden</a></p>',
  })
  const notFoundHtml = stripHomePreload(
    injectBody(baseHtml, notFoundSkeleton, '404'),
  )
    .replace(/<title>[^<]*<\/title>/, '<title>Siden ble ikke funnet | Global Working Norge</title>')
    .replace(
      /<meta name="robots" content="[^"]*" \/>/,
      '<meta name="robots" content="noindex, follow" />',
    )
  if (!notFoundHtml.includes('content="noindex')) {
    throw new Error('prerender: 404.html se escribió sin noindex.')
  }
  await writeFile(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf8')

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
    // Cuenta cualquier bloque JSON-LD, con o sin atributos. LEGACY_JSONLD solo casa
    // con los de index.html, que no llevan atributos; el grafo lleva
    // id="page-schema" y con aquella expresión el contador no lo veía.
    const sueltos = (html.match(/<script type="application\/ld\+json"[^>]*>/g) || []).length
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
