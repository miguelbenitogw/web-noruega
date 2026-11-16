import useContent from '../hooks/useContent'
import EditableText from '../components/editable/EditableText'

/**
 * PersonvernPage — página legal.
 *
 * Antes: una tarjeta blanca con `rounded-2xl` y `shadow-sm` flotando sobre
 * `bg-surface`, con los bloques apilados a todo el ancho de 56rem. Texto legal
 * dentro de una tarjeta de producto.
 *
 * Ahora es un documento: fondo blanco, cada apartado numerado en una columna
 * de interfaz a la izquierda y el texto a la medida de lectura a la derecha,
 * con un filete por apartado. Es la misma estructura en las tres legales.
 */
export default function PersonvernPage() {
  const c = useContent('legalPersonvern')
  const blocks = c.blocks || []

  return (
    <>
      <section className="bg-navy pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container-xl">
          <nav className="font-ui text-primary-300 text-sm mb-7" aria-label="Brødsmuler">
            <a href="/" className="hover:text-white transition-colors">Hjem</a>
            <span className="mx-2 text-primary-400" aria-hidden="true">/</span>
            <span className="text-white">{c.breadcrumb}</span>
          </nav>
          <EditableText
            as="h1"
            path="legalPersonvern.title"
            value={c.title}
            className="text-display font-semibold !text-white max-w-[20ch]"
          />
          <EditableText
            as="p"
            path="legalPersonvern.intro"
            value={c.intro}
            multiline
            className="mt-6 gw-measure text-body lg:text-[1.1875rem] text-primary-100 leading-[1.6]"
          />
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="container-xl">
          <div className="mx-auto max-w-[62rem]">
            {blocks.map((block, index) => (
              <div
                key={`${block.heading}-${index}`}
                className="grid gap-x-10 gap-y-3 border-t border-line py-9 last:border-b lg:grid-cols-12 lg:py-11"
              >
                <div className="lg:col-span-2">
                  <span className="font-ui text-[0.8125rem] font-semibold tabular-nums text-ink-soft">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="lg:col-span-10">
                  <EditableText
                    as="h2"
                    path={`legalPersonvern.blocks.${index}.heading`}
                    value={block.heading}
                    className="font-heading text-[1.25rem] lg:text-[1.375rem] font-semibold text-navy"
                  />
                  <EditableText
                    as="p"
                    path={`legalPersonvern.blocks.${index}.body`}
                    value={block.body}
                    multiline
                    className="mt-3.5 max-w-measure text-body leading-[1.75] text-ink"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
