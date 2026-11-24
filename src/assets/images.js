/* ──────────────────────────────────────────────────────────────────────────
   Todas las fotos del sitio viven en el propio deploy
   ──────────────────────────────────────────────────────────────────────────

   Antes el catalogo colgaba de un bucket de Supabase Storage que oficialmente
   ya no usamos: sin transformaciones de imagen (el `?width=` se ignora y se
   bajaba el original de 3-5 MB), `Cache-Control: private, no-cache` y un
   punto unico de fallo fuera de nuestro control. Todo lo que el sitio pinta
   se empaqueto en `public/assets/media/` como variantes WebP responsive.

   Se sirven desde `/assets/media/...`, que cae dentro de la regla
   `/assets/(.*)` de vercel.json y por lo tanto sale con
   `public, max-age=31536000, immutable`.

   publishedContent.js sigue guardando las URLs viejas de Supabase (es el
   texto de produccion): `img()` y `srcSet()` las reconocen por el NOMBRE DE
   ARCHIVO (CRITICAL_SOURCES) y las traducen a la variante local. Una URL de
   Supabase que NO figure en esa tabla se devuelve tal cual: si agregas una
   foto nueva al contenido, agregala aca y genera sus variantes.

   IMPORTANTE: las variantes se generan con `.rotate()` (EXIF). Las fotos de
   movil (4032x3024 con orientation=6) se veian de costado sin eso.

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
  'alicante-hero-sunset-v2': [640, 1024, 1600],
  rekruttering: [640, 1024, 1388],
  // Las dos del mosaico del hero: par chico para el mosaico (~130 px) y un
  // tope grande porque las dos se reusan como imagen de seccion a ancho
  // completo. Ver el comentario en scripts/optimize-images.mjs.
  'helse-health-team-v2': [320, 640, 1440],
  'alicante-promenade-v2': [320, 640, 1440, 1920],

  // Fotos que antes colgaban de Supabase. Los anchos van del nativo hacia
  // abajo: nunca se escala hacia arriba.
  'home-metrics-team': [640, 1024],
  'pablo-ceo': [300],
  'team-group': [640, 1024, 1440, 1920],
  'miriam-svendsen': [192, 640],
  'gro-anette': [192, 640],
  'alicante-office': [640, 1024, 1440, 1920],
  oficina: [640, 1024],
  'alicante-beach-palms': [640, 1024, 1440],
  'alicante-city-view': [640, 1024, 1440],
  'alicante-castle-arch': [640, 1024],
  'helse-nurses': [640, 1024, 1440, 1920],
  'clase-noruego': [640, 1024],
  'people-team': [640, 858],
  'sykepleier-bilde': [640, 1024, 1536],
  'testimonial-oliver': [480, 993],
  'alicante-beach-collage': [1024, 1920, 2560],
  'alicante-group-office': [640, 932],
  'hvagjor-classroom': [640, 1024, 1536],
  trappebildet: [682],
  'livet-helse': [640, 1024],
  'livet-fellesskap': [640, 1024, 1440, 1920],
  'livet-undervisning': [640, 1024, 1440, 1920],
  'spansk-elev': [640, 1080],
  'spansk-alicante-teaser': [640, 1080],
  'sykepleier-hendergw': [640, 1024, 1536],
  'nyhet-vaga': [640, 1024, 1200],

  // Fotos de Nextcloud (24-11-2026), masters en src/assets/nextcloud/.
  'nc-helsenorsk-clase': [640, 1024, 1440, 1920, 2560],
  'nc-silje-pizarra': [640, 1024, 1440],
  'nc-spansk-clase-bandera': [640, 1024, 1440, 1920],
  'nc-equipo-completo': [640, 1024, 1440, 1920],
  'nc-pablo-lanza': [480, 640, 1024],
  'nc-helse-equipo-noruega': [640, 1024, 1440],
}

/** Nombre de archivo del original (en Supabase o en src/assets) -> slug local. */
const CRITICAL_SOURCES = {
  'team-hero.jpg': 'team-hero',
  'platform-hero.png': 'platform-hero',
  // Misma imagen (mismo md5) que platform-hero.png, pero la portada de la
  // noticia «kandidatportal-lansert» la referencia por Squarespace.
  'Screenshot+2026-02-26+at+15.58.15.png': 'platform-hero',
  'hero-sunset.jpeg': 'alicante-hero-sunset-v2',
  'rekruttering.png': 'rekruttering',
  'health-team.jpg': 'helse-health-team-v2',
  'promenade-lifestyle.jpg': 'alicante-promenade-v2',

  'metrics-team.jpg': 'home-metrics-team',
  'pablo-ceo.webp': 'pablo-ceo',
  'team-group.webp': 'team-group',
  'miriam-svendsen.jpg': 'miriam-svendsen',
  'gro-anette.jpg': 'gro-anette',
  'alicante-office.webp': 'alicante-office',
  'oficina.webp': 'oficina',
  'beach-palms.jpeg': 'alicante-beach-palms',
  'city-view.jpeg': 'alicante-city-view',
  'castle-arch.jpeg': 'alicante-castle-arch',
  'nurses.webp': 'helse-nurses',
  'clase-noruego.webp': 'clase-noruego',
  'people-team.png': 'people-team',
  '9310b14e-9e29-45fb-8ca8-85c672dee960-bilde-sykepleier.jpg': 'sykepleier-bilde',
  'testimonial-oliver.jpg': 'testimonial-oliver',
  'beach-collage.jpg': 'alicante-beach-collage',
  'group-office.jpg': 'alicante-group-office',
  'classroom-rekruttering.jpg': 'hvagjor-classroom',
  'e0497e7e-8d0d-4195-83a8-b6b21cb5d67c-trappebildet.png': 'trappebildet',
  'b1f5e99d-2d1a-4446-80b3-7ca1690a449c-image20260506141055.jpg': 'livet-helse',
  '8d3592ee-4a1c-4be9-822c-322db675ae1b-image20260506141047.jpg': 'livet-fellesskap',
  'cef58e85-8adb-489e-a9cb-42cecd251a0a-image20260506141052.jpg': 'livet-undervisning',
  '7ae916d9-cb56-4e16-bcc5-424f8476a329-elev-spansk-alicante.png': 'spansk-elev',
  'f82a2917-6c08-415f-bd89-41996cd1e155-spansk-alicante.jpg': 'spansk-alicante-teaser',
  '62841656-4198-4834-ab2d-eb643ebf9c06-sykepleier-hendergw.png': 'sykepleier-hendergw',
  '5762bbc0-baba-417c-9fb3-3366f7914102-vaga.jpg': 'nyhet-vaga',
}

/**
 * Slugs retirados -> slug vigente. Las variantes `alicante-hero-sunset-*`,
 * `alicante-promenade-*` y `helse-health-team-*` se generaron sin respetar el
 * EXIF y salian de costado. Como se sirven con cache `immutable`, corregirlas
 * en el mismo nombre no alcanza (el navegador del que ya las vio no las vuelve
 * a pedir en un ano): por eso las buenas se llaman `-v2-<ancho>.webp`.
 */
const LEGACY_SLUGS = {
  'alicante-hero-sunset': 'alicante-hero-sunset-v2',
  'alicante-promenade': 'alicante-promenade-v2',
  'helse-health-team': 'helse-health-team-v2',
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
  if (alreadyLocal) {
    if (LOCAL_VARIANTS[alreadyLocal[1]]) return alreadyLocal[1]
    // Las variantes viejas (sin -v2) salian GIRADAS 90 grados; se retiraron,
    // pero publishedContent.js todavia las nombra: se redirigen a la v2.
    const legacy = LEGACY_SLUGS[alreadyLocal[1]]
    if (legacy) return legacy
  }

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
  // teamHero es el LCP de la Home.
  teamHero:                 variantUrl('team-hero', 1600),
  homeMetricsTeam:          variantUrl('home-metrics-team', 1024),
  teamGroup:                variantUrl('team-group', 1440),
  // 640 y no el tope: los consumidores crudos (retratos de Om oss, avatares)
  // las pintan entre 64 y 290 px. Para un avatar, img(url, 192) baja a la de 192.
  contactMiriam:            variantUrl('miriam-svendsen', 640),
  contactGro:               variantUrl('gro-anette', 640),

  // Offices
  alicanteOffice:           variantUrl('alicante-office', 1440),
  oficina:                  variantUrl('oficina', 1024),

  // Alicante
  spanskAlicanteHeroSunset: variantUrl('alicante-hero-sunset-v2', 1600),
  spanskAlicanteBeachPalms: variantUrl('alicante-beach-palms', 1440),
  // 640 a proposito, NO el tope: el unico consumidor de la constante cruda
  // (sin pasar por img()) es el mosaico del hero, que la pinta a ~130 px. Las
  // vistas que la usan a ancho completo llaman img(url, 1400|1920) y desde
  // esta misma URL suben a 1440/1920. Si algun dia una vista nueva usa la
  // constante cruda para una imagen grande, tiene que pasarla por img().
  spanskAlicantePromenade:  variantUrl('alicante-promenade-v2', 640),
  spanskAlicanteCityView:   variantUrl('alicante-city-view', 1440),
  spanskAlicanteCastleArch: variantUrl('alicante-castle-arch', 1024),

  // Helse
  enfermeria:               variantUrl('helse-nurses', 1920),
  // 640 a proposito, mismo razonamiento que spanskAlicantePromenade.
  helseHealthTeam:          variantUrl('helse-health-team-v2', 640),
  helseSituasjon:           variantUrl('sykepleier-bilde', 1536),

  // Rekruttering / platform
  rekruttering:             variantUrl('rekruttering', 1388),
  platformHero:             variantUrl('platform-hero', 1600),

  // Fotos de Nextcloud. Las constantes apuntan al ancho medio; los
  // componentes pasan por img()/srcSet() y suben hasta el tope.
  helsenorskClase:          variantUrl('nc-helsenorsk-clase', 1920),
  siljePizarra:             variantUrl('nc-silje-pizarra', 1024),
  spanskClaseBandera:       variantUrl('nc-spansk-clase-bandera', 1440),
  equipoCompleto:           variantUrl('nc-equipo-completo', 1440),
  pabloLanza:               variantUrl('nc-pablo-lanza', 640),
  helseEquipoNoruega:       variantUrl('nc-helse-equipo-noruega', 1024),


  // Fuera del catalogo (borradas por muertas, ninguna tenia consumidores):
  // helsesektor, peopleHero, peopleTeam1 (mismos bytes que peopleHero),
  // peopleCTA (mismos bytes tambien), partner1/2, omOss1/2, partnersRow1/2
  // y empresas (Squarespace / globalworking.net).
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
