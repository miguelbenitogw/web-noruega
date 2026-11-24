/**
 * staticHtml — el mismo texto que pinta React, pero como cadena HTML.
 *
 * Lo usa scripts/prerender-meta.mjs para escribir el cuerpo de cada ruta en
 * dist/. GPTBot, ClaudeBot y PerplexityBot no ejecutan JavaScript: lo que no
 * esté en el HTML servido, para ellos no existe. Hasta ahora el prerender
 * escribía un resumen (los primeros 800 caracteres de cada artículo, sin
 * titulares) y las páginas de servicio solo un párrafo escrito a mano.
 *
 * Cada función de acá es el espejo de un componente, con las MISMAS reglas de
 * parseo, para que el HTML estático y la página hidratada digan lo mismo:
 *   · richTextToHtml      ↔ src/components/ui/RichText.jsx
 *   · markdownTextToHtml  ↔ src/components/ui/MarkdownText.jsx
 *   · articleToHtml       ↔ src/components/MarkdownArticle.jsx
 * Si cambia la sintaxis que entiende uno de esos componentes, hay que cambiar
 * su espejo acá; si no, el crawler leería otra cosa que el visitante.
 *
 * Solo marcado semántico, sin clases: este HTML lo reemplaza React al hidratar,
 * así que el sistema visual no pasa por acá.
 */
import { parseInlineLinkTokens } from '../utils/inlineLinkParser.js'
import { splitParagraphs } from './paragraphs.js'

export const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

/**
 * Enlaces `[texto](url)` dentro de una línea. El parser es el mismo de la web,
 * así que un destino que la web rechaza (javascript:, //otro-sitio) acá
 * también queda como texto plano.
 */
export const inlineToHtml = (text, { allowExternal = false } = {}) =>
  parseInlineLinkTokens(String(text ?? ''), { allowExternal })
    .map((token) => {
      if (token.type !== 'link') return escapeHtml(token.value)
      const external = token.href.startsWith('https://')
      const rel = external ? ' rel="noopener noreferrer"' : ''
      return `<a href="${escapeHtml(token.href)}"${rel}>${escapeHtml(token.value)}</a>`
    })
    .join('')

// RichText: un salto simple es <br>, una línea en blanco es párrafo nuevo.
const linesToHtml = (paragraph) =>
  String(paragraph).split('\n').map((line) => inlineToHtml(line.trim())).join('<br>')

/** Espejo de <RichText />: un <p> por párrafo. */
export const richTextToHtml = (value) =>
  splitParagraphs(value).map((p) => `<p>${linesToHtml(p)}</p>`).join('')

/** Espejo de <MarkdownText />: párrafos, `- listas` y `##`/`###`. */
export const markdownTextToHtml = (value) => {
  const out = []
  for (const paragraph of splitParagraphs(value)) {
    let list = []
    let text = []
    const flushText = () => {
      if (text.length) out.push(`<p>${text.map((l) => inlineToHtml(l)).join('<br>')}</p>`)
      text = []
    }
    const flushList = () => {
      if (list.length) out.push(`<ul>${list.map((i) => `<li>${inlineToHtml(i)}</li>`).join('')}</ul>`)
      list = []
    }
    for (const line of paragraph.split('\n').map((l) => l.trim())) {
      const heading = line.match(/^(#{2,3}) (.*)$/)
      if (heading) {
        flushText()
        flushList()
        const tag = heading[1] === '##' ? 'h2' : 'h3'
        out.push(`<${tag}>${inlineToHtml(heading[2])}</${tag}>`)
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        flushText()
        list.push(line.slice(2))
      } else {
        flushList()
        text.push(line)
      }
    }
    flushText()
    flushList()
  }
  return out.join('')
}

// Mismos ids que MarkdownArticle: el índice «Hopp til seksjon» de la web
// enlaza a `#motivasjon-som-driver-lring` y similares, y un enlace profundo
// que llega al HTML estático tiene que encontrar el mismo ancla.
const slugifyHeading = (value) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')

const ORDERED_ITEM_RE = /^\d{1,2}[.)]\s+/

/**
 * Espejo de <MarkdownArticle />: el cuerpo ENTERO del artículo, con sus
 * ## y ### como <h2>/<h3>. Antes el prerender aplanaba todo a un párrafo y lo
 * cortaba en 800 caracteres: el crawler leía un 20–30 % del texto y una sola
 * H2, «Les mer». Enlaces externos permitidos, como en la web (citas de NRK).
 */
export const articleToHtml = (markdown) => {
  const out = []
  const seen = new Map()
  const headingId = (text) => {
    const base = slugifyHeading(text) || 'seksjon'
    const n = seen.get(base) || 0
    seen.set(base, n + 1)
    return n === 0 ? base : `${base}-${n}`
  }
  const inline = (text) => inlineToHtml(text, { allowExternal: true })
  let paragraph = []
  let quote = []
  let list = []
  let listKind = null

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim()
    paragraph = []
    if (text) out.push(`<p>${inline(text)}</p>`)
  }
  const flushQuote = () => {
    const text = quote.join(' ').trim()
    quote = []
    if (text) out.push(`<blockquote><p>${inline(text)}</p></blockquote>`)
  }
  const flushList = () => {
    if (list.length) {
      const tag = listKind === 'ordered' ? 'ol' : 'ul'
      out.push(`<${tag}>${list.map((i) => `<li>${inline(i)}</li>`).join('')}</${tag}>`)
    }
    list = []
    listKind = null
  }
  const flushAll = () => { flushList(); flushQuote(); flushParagraph() }

  for (const raw of String(markdown ?? '').split('\n')) {
    const line = raw.trim()
    if (!line) { flushAll(); continue }
    const h = line.match(/^(#{2,3})\s+(.*)$/)
    if (h) {
      flushAll()
      const tag = h[1] === '##' ? 'h2' : 'h3'
      out.push(`<${tag} id="${headingId(h[2])}">${inline(h[2])}</${tag}>`)
      continue
    }
    if (line.startsWith('> ')) {
      flushList()
      flushParagraph()
      quote.push(line.replace(/^>\s+/, ''))
      continue
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      flushQuote()
      flushParagraph()
      if (listKind === 'ordered') flushList()
      listKind = 'bullet'
      list.push(line.slice(2).trim())
      continue
    }
    if (ORDERED_ITEM_RE.test(line)) {
      flushQuote()
      flushParagraph()
      if (listKind === 'bullet') flushList()
      listKind = 'ordered'
      list.push(line.replace(ORDERED_ITEM_RE, '').trim())
      continue
    }
    flushList()
    flushQuote()
    paragraph.push(line)
  }
  flushAll()
  return out.join('')
}
