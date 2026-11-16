import EditableText from '../editable/EditableText'
import PageHero from './PageHero'

/**
 * LegalDocument — personvern, vilkår y cookies.
 *
 * Las tres páginas legales eran el MISMO archivo copiado tres veces: setenta y
 * cinco líneas idénticas salvo la clave de contenido. Cualquier ajuste —el
 * ancho de la columna, el filete entre apartados, la numeración— había que
 * hacerlo tres veces y acordarse de las tres.
 *
 * No es una tarjeta flotando sobre `bg-surface`: es un documento. Fondo
 * blanco, cada apartado numerado en una columna de interfaz a la izquierda y
 * el texto a la medida de lectura a la derecha, con un filete por apartado.
 */
export default function LegalDocument({ contentKey, content }) {
  const blocks = content.blocks || []

  return (
    <>
      <PageHero
        current={content.breadcrumb}
        title={content.title}
        titlePath={`${contentKey}.title`}
        titleWidth="20ch"
        description={content.intro}
        descriptionPath={`${contentKey}.intro`}
      />

      <section className="bg-white py-16 lg:py-24">
        <div className="container-xl">
          <div className="mx-auto max-w-[62rem]">
            {blocks.map((block, index) => (
              <div
                key={`${block.heading}-${index}`}
                className="grid gap-x-10 gap-y-3 border-t border-line py-9 last:border-b lg:grid-cols-12 lg:py-11"
              >
                <div className="lg:col-span-2">
                  <span className="gw-step text-ink-soft">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="lg:col-span-10">
                  <EditableText
                    as="h2"
                    path={`${contentKey}.blocks.${index}.heading`}
                    value={block.heading}
                    className="font-heading text-[1.25rem] lg:text-[1.375rem] font-semibold text-navy"
                  />
                  <EditableText
                    as="p"
                    path={`${contentKey}.blocks.${index}.body`}
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
