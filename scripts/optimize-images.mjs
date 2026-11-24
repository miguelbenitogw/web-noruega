import sharp from 'sharp'
import { readdir, stat, mkdir } from 'node:fs/promises'
import path from 'node:path'

const ASSETS_DIR = path.resolve('src/assets')

/* ──────────────────────────────────────────────────────────────────────────
   1. Imágenes críticas (LCP) — variantes responsive empaquetadas localmente
   ──────────────────────────────────────────────────────────────────────────

   El problema: estas cuatro imágenes vivían SOLO en Supabase Storage, que las
   sirve con `Cache-Control: private, no-cache`. Es decir: revalidación en cada
   visita, 3 MB de hero, y descubrimiento tardío (las inyecta React después del
   bundle). Son las candidatas a LCP de sus rutas.

   La salida va a `public/assets/media/`, NO a `src/assets/`. Dos razones:

   a) Vercel ya tiene una regla `/assets/(.*)` →
      `Cache-Control: public, max-age=31536000, immutable` en vercel.json.
      Todo lo que Vite copia de `public/assets/` termina en `dist/assets/` y
      se sirve bajo `/assets/...`, así que hereda ese caché inmutable igual
      que los bundles hasheados.

   b) El nombre tiene que ser ESTABLE para poder escribir a mano el
      `<link rel="preload" as="image" imagesrcset=...>` del hero en
      index.html. Si importáramos desde `src/assets`, Vite les pondría un
      hash de contenido impredecible y el preload no se podría escribir.

   Contrapartida de (b): con nombre estable + caché inmutable, si el
   CONTENIDO de una de estas imágenes cambia hay que renombrar el archivo
   (p. ej. `team-hero-1600.v2.webp`) y actualizar images.js + index.html.
   Son cuatro imágenes de marca que no rotan: el trade-off vale.

   AVIF: NO se genera. Un `<img srcset>` solo admite un formato; para servir
   AVIF con fallback hace falta `<picture>` + varios `<source>`, y eso exige
   tocar los componentes (Hero.jsx y cía.), que no son de este agente.
*/

const CRITICAL_OUT_DIR = path.resolve('public/assets/media')
const DEFAULT_WIDTHS = [640, 1024, 1600]

/**
 * `widths` por imagen cuando los anchos por defecto no sirven. Los anchos NO
 * se eligen por el peso del original sino por el tamaño al que se renderiza
 * de verdad (y por el DPR): generar 1600w para una foto que se pinta a 130 px
 * es tirar disco y banda.
 */
const CRITICAL_IMAGES = [
  { slug: 'team-hero', source: 'src/assets/team-hero.jpg' },
  { slug: 'platform-hero', source: 'src/assets/platform-hero.png' },
  { slug: 'alicante-hero-sunset-v2', source: 'src/assets/alicante/hero-sunset.jpeg' },
  { slug: 'rekruttering', source: 'src/assets/rekruttering.png' },

  // Las dos fotos chicas del mosaico del hero («dos orillas», Hero.jsx).
  // Ahí se pintan a ~130 px de ancho, así que 320/640 cubre hasta DPR 4.
  //
  // PERO las dos se reusan como imagen de sección a ancho completo, y ahí
  // 640 se vería borroso:
  //   health-team        → HelsenorskPage      img(..., 1400), h-[520px]
  //   promenade-lifestyle→ SpanskAlicantePage   img(..., 1400), h-[520px]
  //                        LivetSomStudentPage  img(..., 1400), h-[520px]
  //                        LivetSomStudentPage  img(..., 1400), h-[560px]
  //                        LivetSomStudentPage  img(..., 1920), banda completa
  // Por eso además del par chico se genera un tope grande: lo pide solo quien
  // pasa un `width` explícito a img(); el mosaico usa la constante cruda y se
  // queda en 640.
  { slug: 'helse-health-team-v2', source: 'src/assets/helse/health-team.jpg', widths: [320, 640, 1440] },
  {
    slug: 'alicante-promenade-v2',
    source: 'src/assets/alicante/promenade-lifestyle.jpg',
    widths: [320, 640, 1440, 1920],
  },

  // Fotos nuevas de Nextcloud (24-11-2026). Los masters (long side 2560, EXIF
  // aplicado, JPEG q85) viven en src/assets/nextcloud/; los originales de
  // 3-4 MB NO se commitean. Slugs con prefijo `nc-` y NUEVOS a propósito:
  // /assets/ sale con cache `immutable` de un año, así que jamás se pisa un
  // archivo ya servido. Los anchos salen del slot: el mayor cubre ~2x el
  // ancho pintado a 1440 px de viewport, y withoutEnlargement evita escalar.
  // Banda a ancho completo de /spansk-i-alicante/helsenorsk (1440-1920 px).
  { slug: 'nc-helsenorsk-clase', source: 'src/assets/nextcloud/helsenorsk-clase.jpg', widths: [640, 1024, 1440, 1920, 2560] },
  // «Vårt tilbud» en la Home (~584 px de ancho).
  { slug: 'nc-silje-pizarra', source: 'src/assets/nextcloud/silje-pizarra.jpg', widths: [640, 1024, 1440] },
  // Teaser Spansk i Alicante (~740 px, sangra por la izquierda).
  { slug: 'nc-spansk-clase-bandera', source: 'src/assets/nextcloud/spansk-clase-bandera.jpg', widths: [640, 1024, 1440, 1920] },
  // CTABanner (~700 px, sangra por la izquierda).
  { slug: 'nc-equipo-completo', source: 'src/assets/nextcloud/equipo-completo.jpg', widths: [640, 1024, 1440, 1920] },
  // Retrato de Pablo: se pinta a ~290 px; 1024 también es la imagen del nodo Person.
  { slug: 'nc-pablo-lanza', source: 'src/assets/nextcloud/pablo-lanza.jpg', widths: [480, 640, 1024] },
  // /helse, sección «Helsesektor» (~470 px).
  { slug: 'nc-helse-equipo-noruega', source: 'src/assets/nextcloud/helse-equipo-noruega.jpg', widths: [640, 1024, 1440] },
]

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`

/**
 * Anchos a generar para una imagen: los pedidos que no impliquen escalar
 * hacia arriba, más el ancho nativo si la original es más chica que el mayor
 * de la lista (así el srcset siempre tiene un tope real).
 */
const widthsFor = (sourceWidth, requested = DEFAULT_WIDTHS) => {
  const fitting = requested.filter((w) => w <= sourceWidth)
  const largest = requested[requested.length - 1]
  if (sourceWidth < largest && !fitting.includes(sourceWidth)) fitting.push(sourceWidth)
  return fitting.length > 0 ? fitting : [sourceWidth]
}

const buildCriticalVariants = async () => {
  await mkdir(CRITICAL_OUT_DIR, { recursive: true })
  const manifest = []

  for (const { slug, source, widths: requestedWidths } of CRITICAL_IMAGES) {
    const sourcePath = path.resolve(source)

    let sourceStat
    try {
      sourceStat = await stat(sourcePath)
    } catch {
      console.warn(`  ! falta el original ${source} — se omite ${slug}`)
      continue
    }

    const meta = await sharp(sourcePath).metadata()
    // Con EXIF orientation 5-8 la imagen se muestra girada 90 grados, así que
    // el ancho real es el alto de los píxeles crudos. Usar meta.width a secas
    // hacía que withoutEnlargement comparase contra un lado que no se ve.
    const anchoVisible = meta.orientation >= 5 ? meta.height : meta.width
    const widths = widthsFor(anchoVisible, requestedWidths)
    const variants = []

    for (const width of widths) {
      const outPath = path.join(CRITICAL_OUT_DIR, `${slug}-${width}.webp`)

      let existing = null
      try {
        existing = await stat(outPath)
      } catch {
        // No existe: hay que generarla.
      }

      // Se regenera solo si el original es más nuevo que la variante.
      if (existing && existing.mtimeMs >= sourceStat.mtimeMs) {
        variants.push({ width, size: existing.size, cached: true })
        continue
      }

      const info = await sharp(sourcePath)
        // .rotate() sin argumentos aplica el EXIF y lo consume. Sin esto, sharp
        // tira la orientación al escribir webp y la foto sale de costado.
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 74, effort: 6, smartSubsample: true })
        .toFile(outPath)

      variants.push({ width: info.width, size: info.size, cached: false })
    }

    manifest.push({ slug, source, sourceSize: sourceStat.size, meta, variants })
  }

  return manifest
}

/* ──────────────────────────────────────────────────────────────────────────
   2. Conversión genérica a WebP de todo src/assets (comportamiento previo)
   ────────────────────────────────────────────────────────────────────────── */

const convertToWebP = async (inputPath) => {
  const ext = path.extname(inputPath)
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return null

  const outputPath = inputPath.replace(ext, '.webp')

  try {
    await stat(outputPath)
    return null
  } catch {
    // File doesn't exist, convert
  }

  const inputStat = await stat(inputPath)
  const info = await sharp(inputPath)
    .rotate()
    .webp({ quality: 80, effort: 6 })
    .toFile(outputPath)

  const saved = ((1 - info.size / inputStat.size) * 100).toFixed(1)
  console.log(`  ${path.basename(inputPath)} → ${path.basename(outputPath)} (${saved}% smaller)`)
  return outputPath
}

const scanDir = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  let converted = 0

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // Los masters de Nextcloud solo alimentan las variantes de public/: un
      // .webp suelto al lado de cada uno sería peso muerto en el repo.
      if (entry.name === 'nextcloud') continue
      converted += await scanDir(fullPath)
    } else if (entry.isFile()) {
      const result = await convertToWebP(fullPath)
      if (result) converted++
    }
  }

  return converted
}

const run = async () => {
  console.log('Building responsive variants for critical (LCP) images...')
  const manifest = await buildCriticalVariants()
  for (const entry of manifest) {
    const widths = entry.variants.map((v) => v.width).join('/')
    console.log(
      `  ${entry.slug}: ${entry.meta.width}x${entry.meta.height} ${kb(entry.sourceSize)} → ${widths}w`,
    )
    for (const v of entry.variants) {
      console.log(`      ${entry.slug}-${v.width}.webp  ${kb(v.size)}${v.cached ? ' (cached)' : ''}`)
    }
  }

  console.log('Optimizing images...')
  const count = await scanDir(ASSETS_DIR)
  if (count > 0) {
    console.log(`Optimized ${count} images to WebP.`)
  } else {
    console.log('All images already optimized.')
  }
}

run().catch((error) => {
  console.error('Image optimization failed:', error)
  process.exit(1)
})
