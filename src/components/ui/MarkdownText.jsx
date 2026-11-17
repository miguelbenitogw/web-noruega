import { InlineLinks } from './RichText'
import { splitParagraphs } from '../../lib/paragraphs'

/**
 * MarkdownText — los bloques largos que traen `## Título`, `### Subtítulo` y
 * listas con `- ` (Rekruttering, Spansk i Alicante y su «hvorfor»).
 *
 * Es el markdown mínimo que de verdad aparece en los datos, nada más. Va en
 * su propio archivo y no dentro de RichText porque esas tres páginas se cargan
 * bajo demanda: así el parser no viaja en el chunk compartido que baja toda
 * visita.
 *
 * Igual que RichText, el contenedor es `.gw-stack` y lleva todo el estilo:
 * párrafos, títulos y listas comparten color, medida e interlineado, y el aire
 * entre bloques es siempre una línea. Los títulos se separan un poco más
 * (`!mt-8` / `!mt-6`) porque abren apartado; el primero no, para que el bloque
 * no arranque con un hueco.
 */
export default function MarkdownText({ value, className = '', tone = 'light', ...rest }) {
  const blocks = []

  splitParagraphs(value).forEach((paragraph, p) => {
    let list = []
    let text = []
    const key = (kind) => `${p}-${kind}${blocks.length}`
    const flushText = () => {
      if (!text.length) return
      blocks.push(<p key={key('p')}><InlineLinks text={text.join('\n')} tone={tone} /></p>)
      text = []
    }
    const flushList = () => {
      if (!list.length) return
      blocks.push(
        <ul key={key('u')} className="list-disc pl-5 space-y-1">
          {list.map((item, i) => <li key={i}><InlineLinks text={item} tone={tone} /></li>)}
        </ul>,
      )
      list = []
    }

    paragraph.split('\n').map((line) => line.trim()).forEach((line) => {
      const heading = line.match(/^(#{2,3}) (.*)$/)
      if (heading) {
        flushText()
        flushList()
        const Heading = heading[1] === '##' ? 'h2' : 'h3'
        const size = Heading === 'h2' ? 'text-xl !mt-8' : 'text-lg !mt-6'
        blocks.push(
          <Heading key={key('h')} className={`font-heading font-semibold text-navy leading-snug first:!mt-0 ${size}`}>
            <InlineLinks text={heading[2]} tone={tone} />
          </Heading>,
        )
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        flushText()
        list.push(line.slice(2))
      } else {
        flushList()
        text.push(line)
      }
    })
    flushText()
    flushList()
  })

  return (
    <div className={`gw-stack ${className}`.trim()} {...rest}>
      {blocks}
    </div>
  )
}
