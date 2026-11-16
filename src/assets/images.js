const SB = 'https://hahqimviirkkzkvmusga.supabase.co/storage/v1/object/public/content-media'

/* ──────────────────────────────────────────────────────────────────────────
   Imagenes criticas (LCP) empaquetadas localmente
   ──────────────────────────────────────────────────────────────────────────

   Supabase Storage sirve este bucket con `Cache-Control: private, no-cache`:
   se revalida en cada visita. Y encima el hero pesaba 3 MB. Las cuatro
   imagenes que son candidatas a LCP de su ruta se bajaron a local; el resto
   del catalogo se queda en Supabase tal cual.

   Las variantes las genera `scripts/optimize-images.mjs` (prebuild, sharp)
   hacia `public/assets/media/`. Se sirven desde `/assets/media/...`, que cae
   dentro de la regla `/assets/(.*)` de vercel.json y por lo tanto sale con
   `public, max-age=31536000, immutable`.

   Nombres ESTABLES (sin hash de Vite) a proposito: el `<link rel="preload"
   as="image" imagesrcset>` del hero esta escrito a mano en index.html y
   necesita una URL predecible. Contrapartida: si el CONTENIDO de una de
   estas imagenes cambia, hay que renombrar el archivo (`-v2`) y actualizar
   aqui y en index.html — con cache inmutable no alcanza con sobrescribir.
*/

const MEDIA = '/assets/media'

/** Anchos realmente generados por imagen (nunca se escala hacia arriba). */
const LOCAL_VARIANTS = {
  'team-hero': [640, 1024, 1600],
  'platform-hero': [640, 1024, 1600],
  'alicante-hero-sunset': [640, 1024, 1600],
  rekruttering: [640, 1024, 1388],
  // Las dos del mosaico del hero: par chico para el mosaico (~130 px) y un
  // tope grande porque las dos se reusan como imagen de seccion a ancho
  // completo. Ver el comentario en scripts/optimize-images.mjs.
  'helse-health-team': [320, 640, 1440],
  'alicante-promenade': [320, 640, 1440, 1920],
}

/** Nombre de archivo del original (en Supabase o en src/assets) -> slug local. */
const CRITICAL_SOURCES = {
  'team-hero.jpg': 'team-hero',
  'platform-hero.png': 'platform-hero',
  'hero-sunset.jpeg': 'alicante-hero-sunset',
  'rekruttering.png': 'rekruttering',
  'health-team.jpg': 'helse-health-team',
  'promenade-lifestyle.jpg': 'alicante-promenade',
}

const variantUrl = (slug, width) => `${MEDIA}/${slug}-${width}.webp`

/**
 * Devuelve el slug local si la URL apunta a una imagen critica. Da igual si
 * llega como URL de Supabase (que es lo que guarda publishedContent.js) o si
 * ya es una de nuestras variantes locales.
 */
const slugFor = (url) => {
  if (typeof url !== 'string' || url === '') return null

  const file = url.split('?')[0].split('#')[0].split('/').pop()
  if (!file) return null

  if (CRITICAL_SOURCES[file]) return CRITICAL_SOURCES[file]

  const alreadyLocal = /^(.+)-\d+\.webp$/.exec(file)
  if (alreadyLocal && LOCAL_VARIANTS[alreadyLocal[1]]) return alreadyLocal[1]

  return null
}

/** El ancho generado mas chico que cubra el pedido; si no hay, el mayor. */
const pickWidth = (widths, requested) => {
  const largest = widths[widths.length - 1]
  if (!Number.isFinite(requested) || requested <= 0) return largest
  return widths.find((w) => w >= requested) ?? largest
}

export const IMAGES = {
  // Logos (kept as static imports — not content-editable)
  logo:           new URL('./logo-white.webp', import.meta.url).href,
  logoColor:      new URL('./logo-horizontal.png', import.meta.url).href,

  // Team / people
  // teamHero es el LCP de la Home: local, ya no Supabase.
  teamHero:                 variantUrl('team-hero', 1600),
  homeMetricsTeam:          `${SB}/home/metrics-team.jpg`,
  ceoPhoto:                 `${SB}/team/pablo-ceo.webp`,
  teamGroup:                `${SB}/team/team-group.webp`,
  contactMiriam:            `${SB}/team/miriam-svendsen.jpg`,
  contactGro:               `${SB}/team/gro-anette.jpg`,

  // Offices
  alicanteOffice:           `${SB}/office/alicante-office.webp`,
  oficina:                  `${SB}/office/oficina.webp`,

  // Alicante
  spanskAlicanteHeroSunset: variantUrl('alicante-hero-sunset', 1600),
  spanskAlicanteBeachPalms: `${SB}/alicante/beach-palms.jpeg`,
  // 640 a proposito, NO el tope: el unico consumidor de la constante cruda
  // (sin pasar por img()) es el mosaico del hero, que la pinta a ~130 px. Las
  // vistas que la usan a ancho completo llaman img(url, 1400|1920) y desde
  // esta misma URL suben a 1440/1920. Si algun dia una vista nueva usa la
  // constante cruda para una imagen grande, tiene que pasarla por img().
  spanskAlicantePromenade:  variantUrl('alicante-promenade', 640),
  spanskAlicanteCityView:   `${SB}/alicante/city-view.jpeg`,
  spanskAlicanteCastleArch: `${SB}/alicante/castle-arch.jpeg`,

  // Helse
  enfermeria:               `${SB}/helse/nurses.webp`,
  // 640 a proposito, mismo razonamiento que spanskAlicantePromenade.
  helseHealthTeam:          variantUrl('helse-health-team', 640),
  helsesektor:              `${SB}/cdn/helsesektor.png`,
  helseSituasjon:           `${SB}/2026/04/17/9310b14e-9e29-45fb-8ca8-85c672dee960-bilde-sykepleier.jpg`,

  // Rekruttering / platform
  rekruttering:             variantUrl('rekruttering', 1388),
  platformHero:             variantUrl('platform-hero', 1600),
  claseNoruego:             `${SB}/clase-noruego.webp`,

  // People / backgrounds
  peopleHero:               `${SB}/cdn/people-hero.jpg`,
  peopleTeam1:              `${SB}/cdn/people-hero.jpg`,
  peopleTeam2:              `${SB}/people-team.png`,
  peopleCTA:                `${SB}/cdn/people-cta.jpg`,

  // Partner logos (still on CDN — not critical)
  partner1:      'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/daa93884-fbf5-4659-b78c-124a0ccb6d3c/Screenshot+2026-02-26+at+18.15.19.png',
  partner2:      'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/54a26273-89d1-48c9-8404-f1dc25e3df48/Screenshot+2026-02-26+at+18.28.39.png',
  omOss1:        'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/a9bc873b-c7a6-4d48-a550-b69907729127/Screenshot+2026-02-27+at+10.43.30.png',
  omOss2:        'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/7a7c6e81-e17d-44e5-b62b-0257b043f23e/Screenshot+2026-02-26+at+17.51.02.png',
  partnersRow1:  'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/daa93884-fbf5-4659-b78c-124a0ccb6d3c/Screenshot+2026-02-26+at+18.15.19.png',
  partnersRow2:  'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/54a26273-89d1-48c9-8404-f1dc25e3df48/Screenshot+2026-02-26+at+18.28.39.png',
  empresas:      'https://globalworking.net/wp-content/uploads/2024/10/Empresas-con-las-que-trabajamos_Mesa-de-trabajo-1-1024x89.webp',
}

/**
 * Preload del hero de la Home. Tiene que coincidir EXACTO con el
 * `<link rel="preload" as="image">` escrito a mano en index.html: si cambian
 * los anchos o el `sizes`, cambian los dos a la vez o el navegador descarga
 * dos variantes distintas.
 */
export const HOME_HERO_PRELOAD = {
  href: variantUrl('team-hero', 1024),
  imageSrcSet: LOCAL_VARIANTS['team-hero']
    .map((w) => `${variantUrl('team-hero', w)} ${w}w`)
    .join(', '),
  imageSizes: '(max-width: 640px) 100vw, 33vw',
}

/**
 * img(url, width) — para las imagenes criticas devuelve la variante local mas
 * chica que cubra `width`. Para cualquier otra URL (Supabase, Squarespace)
 * la devuelve tal cual, igual que antes.
 *
 * La firma no cambio: `img(url, 1200)` sigue siendo valido.
 */
export const img = (url, width) => {
  if (!url) return ''

  const slug = slugFor(url)
  if (!slug) return url

  return variantUrl(slug, pickWidth(LOCAL_VARIANTS[slug], width))
}

/**
 * srcSet(url, sizes) — devuelve un srcset real para las imagenes criticas
 * locales y `undefined` para el resto, que es lo que ya pasaba: las
 * transformaciones de imagen de Supabase piden plan de pago, asi que esas
 * degradan a `src` solo.
 *
 * Los anchos pedidos se ajustan a los que existen de verdad en disco: pedir
 * [640, 1024, 1200] sobre team-hero da 640w/1024w/1600w, porque el descriptor
 * `w` tiene que ser el ancho real del archivo o el navegador elige mal.
 */
export const srcSet = (url, sizes) => {
  const slug = slugFor(url)
  if (!slug) return undefined

  const available = LOCAL_VARIANTS[slug]
  const requested = Array.isArray(sizes) && sizes.length > 0 ? sizes : available

  const widths = [...new Set(requested.map((w) => pickWidth(available, w)))].sort((a, b) => a - b)

  return widths.map((w) => `${variantUrl(slug, w)} ${w}w`).join(', ')
}
