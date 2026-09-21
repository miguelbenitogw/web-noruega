/**
 * check-seo-sync.mjs — que los títulos no vivan en tres sitios distintos diciendo cosas
 * distintas.
 *
 * POR QUÉ EXISTE ESTO (21-09-2026)
 * El título y la descripción de cada página están escritos TRES veces:
 *
 *   1. `src/lib/seo.js`             → lo que pone JavaScript en el navegador
 *   2. `scripts/prerender-meta.mjs` → lo que se escribe en el HTML de cada ruta
 *   3. `index.html`                 → el HTML base, del que sale la portada
 *
 * Y GOOGLE LEE EL 2 Y EL 3, NO EL 1. Se cambiaron los títulos solo en `seo.js` creyendo
 * que bastaba: la web mostraba el título nuevo en la pestaña del navegador y Google
 * seguía viendo el viejo. El cambio no habría servido de nada y nada lo habría avisado.
 *
 * Lo ideal sería que hubiera UNA fuente y las otras dos la importaran. Mientras eso no se
 * haga, esto es la red: si las tres copias dejan de coincidir, el build falla y dice
 * exactamente cuál se quedó atrás.
 *
 * Solo compara `title` y `description`, que son los que sale en Google. Las `keywords` no
 * las usa ningún buscador desde hace más de una década.
 */
import { readFile } from 'node:fs/promises'

const ROJO = '[31m'
const VERDE = '[32m'
const FIN = '[0m'

/**
 * Se normalizan los saltos de línea antes de mirar nada.
 *
 * En Windows los archivos vienen con retorno de carro, y una expresión que busque un salto
 * de línea a secas no encuentra NADA: sin error y sin aviso, devuelve cero rutas y la
 * comprobación pasa por no haber mirado. Pasó escribiendo este mismo archivo.
 */
const leer = async (p) => (await readFile(p, 'utf8')).split('\r\n').join('\n')

const sacarTitulo = (txt) => txt.match(/title:\s*'((?:[^'\\]|\\.)*)'/)?.[1] ?? null
const sacarDescripcion = (txt) => txt.match(/description:\s*'((?:[^'\\]|\\.)*)'/)?.[1] ?? null

/** Saca `{ '/ruta': {title, description} }` de una tabla indexada por ruta. */
function extraerPorRuta(fuente) {
  const out = {}
  const rx = /'(\/[^']*)':\s*\{([\s\S]*?)\n {2}\}/g
  let m
  while ((m = rx.exec(fuente))) {
    out[m[1]] = { title: sacarTitulo(m[2]), description: sacarDescripcion(m[2]) }
  }
  return out
}

/** Lo mismo desde `seo.js`, que indexa por sección y lleva el `pathname` dentro. */
function extraerPorSeccion(fuente) {
  const out = {}
  const rx = /'?([a-z0-9-]+)'?:\s*\{\n([\s\S]*?)\n {2}\},/g
  let m
  while ((m = rx.exec(fuente))) {
    const ruta = m[2].match(/pathname:\s*'([^']*)'/)?.[1]
    if (!ruta) continue
    out[ruta] = { title: sacarTitulo(m[2]), description: sacarDescripcion(m[2]) }
  }
  return out
}

const seoJs = await leer('src/lib/seo.js')
const prerender = await leer('scripts/prerender-meta.mjs')
const indexHtml = await leer('index.html')

const deSeo = extraerPorSeccion(seoJs)
const dePrerender = extraerPorRuta(prerender)
const fallos = []

// ── Rutas internas: seo.js contra prerender-meta.mjs ───────────────────────
for (const [ruta, esperado] of Object.entries(deSeo)) {
  const real = dePrerender[ruta]
  if (!real) {
    // La portada no está en la tabla del prerender: sale de index.html, se mira abajo.
    if (ruta === '/') continue
    fallos.push(`${ruta}: está en seo.js pero NO en prerender-meta.mjs — Google no vería el cambio`)
    continue
  }
  for (const campo of ['title', 'description']) {
    if (esperado[campo] !== real[campo]) {
      fallos.push(
        [
          `${ruta} · ${campo}`,
          `     seo.js    : ${esperado[campo]}`,
          `     prerender : ${real[campo]}`,
        ].join('\n'),
      )
    }
  }
}

// ── Portada: el DEFAULT_SEO de seo.js contra index.html ────────────────────
const bloqueHome = seoJs.match(/const DEFAULT_SEO = \{[\s\S]*?\n\}/)?.[0] ?? ''
const tHome = sacarTitulo(bloqueHome)
const dHome = sacarDescripcion(bloqueHome)
const tIndex = indexHtml.match(/<title>([^<]*)<\/title>/)?.[1] ?? null
const dIndex = indexHtml.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? null

if (tHome && tHome !== tIndex) {
  fallos.push(['/ · title', `     seo.js     : ${tHome}`, `     index.html : ${tIndex}`].join('\n'))
}
if (dHome && dHome !== dIndex) {
  fallos.push(['/ · description', `     seo.js     : ${dHome}`, `     index.html : ${dIndex}`].join('\n'))
}

// ── Veredicto ──────────────────────────────────────────────────────────────
const n = Object.keys(deSeo).length

// UNA COMPROBACIÓN QUE NO COMPRUEBA NADA ES PEOR QUE NO TENERLA, porque tranquiliza sin
// motivo. Si el extractor se queda desfasado (otro formato, otro salto de línea), esto
// tiene que fallar en vez de felicitarse a sí mismo. La primera versión decía
// "0 rutas coinciden" y devolvía éxito.
if (n < 5) {
  console.error(`${ROJO}\nSolo se han encontrado ${n} rutas en seo.js, y hay bastantes más.${FIN}`)
  console.error('El extractor de este check está desfasado: arreglarlo antes de fiarse de él.\n')
  process.exit(1)
}

if (fallos.length > 0) {
  console.error(`${ROJO}\nLos textos que ve Google NO coinciden con los de seo.js:${FIN}\n`)
  for (const f of fallos) console.error('  · ' + f + '\n')
  console.error(
    'Google lee el HTML de `scripts/prerender-meta.mjs` y de `index.html`, no el que pone\n' +
      'JavaScript desde `seo.js`. Hay que cambiar los tres sitios o el cambio no existe.\n',
  )
  process.exit(1)
}

console.log(`${VERDE}SEO en sincronía: ${n} rutas cuadran entre seo.js, el prerender e index.html${FIN}`)
