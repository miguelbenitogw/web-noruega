/**
 * El recorrido del portal, en texto.
 *
 * La «Omvisning» de /talentportalen es un iframe que se anima solo: títulos de
 * capítulo y narración viven dentro del <script> de
 * public/tutorial-talent-portal/index.html, en el diccionario `DICT.nb`. Para
 * un buscador o un LLM eso es invisible, y la página quedaba en un párrafo.
 *
 * No se reescribe nada: esto LEE ese diccionario y devuelve los capítulos con
 * su narración tal cual. Si alguien cambia un texto del recorrido, cambia el
 * resumen; si cambia la forma del diccionario, `parseTourChapters` devuelve
 * [] y el prerender revienta en vez de publicar un resumen vacío.
 *
 * Se dejan fuera los capítulos de entrada y de cierre («Innlogging», «Kom i
 * gang»): hablan de quién recibe acceso y cómo pedirlo, y esas condiciones las
 * tiene que confirmar el cliente antes de publicarse como texto de la página.
 */
const EXCLUDED_CHAPTERS = new Set([1, 9])

// Las cadenas del diccionario van entre comillas simples; `\'` es una comilla
// escapada dentro del texto.
const unquote = (s) => s.replace(/\\'/g, "'")

export function parseTourChapters(html) {
  const source = String(html ?? '')
  const start = source.indexOf('nb:{')
  const end = source.indexOf('\nen:{', start)
  if (start === -1 || end === -1) return []
  const dict = source.slice(start, end)

  const titles = {}
  for (const m of dict.matchAll(/\bch(\d+):'((?:[^'\\]|\\.)*)'/g)) titles[Number(m[1])] = unquote(m[2])

  const captions = {}
  for (const m of dict.matchAll(/'cap\.c(\d+)([a-z])\.(t|d)':'((?:[^'\\]|\\.)*)'/g)) {
    const ch = Number(m[1])
    const key = m[2]
    captions[ch] ??= {}
    captions[ch][key] ??= {}
    captions[ch][key][m[3]] = unquote(m[4])
  }

  return Object.keys(titles)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((n) => !EXCLUDED_CHAPTERS.has(n))
    .map((n) => ({
      number: n,
      title: titles[n],
      steps: Object.keys(captions[n] || {})
        .sort()
        .map((k) => captions[n][k])
        .filter((step) => step.t && step.d),
    }))
    .filter((chapter) => chapter.title && chapter.steps.length > 0)
}
