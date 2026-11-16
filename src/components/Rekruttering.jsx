import useContent from '../hooks/useContent'
import EditableText from './editable/EditableText'

/**
 * Rekruttering — el modelo, como secuencia.
 *
 * Antes: un panel redondeado con sombra que contenía OTRO panel redondeado con
 * sombra, y dentro los tres párrafos. Caja dentro de caja no es jerarquía, es
 * relleno. Y los cuatro pasos del modelo (`rekrutteringComp.steps`) no se
 * pintaban en ninguna parte: el proceso real estaba escondido dentro del texto
 * largo.
 *
 * Ahora la página dice primero CUÁL es la secuencia —cuatro etapas numeradas
 * sobre un filete, que es lo que un responsable de personal necesita ver de un
 * vistazo— y después deja leer el detalle en una sola columna a medida de
 * lectura. La numeración 01–04 está acá porque el modelo ES un orden, no para
 * decorar.
 */

const BODY_FIELDS = ['p1', 'p2', 'p3']

export default function Rekruttering() {
  const c = useContent('rekrutteringComp')
  const steps = c.steps || []
  const body = BODY_FIELDS.filter((key) => typeof c[key] === 'string' && c[key].trim() !== '')

  return (
    <section
      id="rekruttering"
      className="scroll-mt-28 py-20 lg:py-28 bg-white"
      aria-labelledby="rekruttering-heading"
    >
      <div className="container-xl">
        {/* ── Cabecera ────────────────────────────────────────────────────
            El sello («modelo estructurado desde 2014») deja de ser una
            pastilla de color y pasa a ser un dato al final de la línea: es
            una fecha, no un botón. */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-7">
            <EditableText
              as="span"
              path="rekrutteringComp.label"
              value={c.label}
              className="gw-label text-primary-600"
            />
            <EditableText
              id="rekruttering-heading"
              as="h2"
              path="rekrutteringComp.heading"
              value={c.heading}
              className="mt-5 text-display-sm font-semibold text-navy"
            />
          </div>

          {c.badge && (
            <div className="lg:col-span-4 lg:col-start-9">
              <EditableText
                as="p"
                path="rekrutteringComp.badge"
                value={c.badge}
                className="font-ui text-sm font-semibold text-ink-soft lg:text-right"
              />
            </div>
          )}
        </div>

        {/* ── Las cuatro etapas ───────────────────────────────────────────
            Un filete horizontal hace de línea de tiempo y cada etapa cuelga
            de él. En móvil la secuencia se apila y los filetes pasan a ser
            horizontales entre etapas: sigue leyéndose como un orden. */}
        {steps.length > 0 && (
          <ol className="mt-12 lg:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 border-t border-line">
            {steps.map((step, i) => (
              <li
                key={step.title || i}
                className="py-7 sm:px-7 lg:px-6 sm:first:pl-0 lg:first:pl-0 lg:last:pr-0
                           border-line
                           [&:nth-child(n+2)]:border-t
                           sm:[&:nth-child(2)]:border-t-0
                           [&:nth-child(even)]:sm:border-l
                           [&:nth-child(n+3)]:sm:border-t
                           lg:[&:nth-child(n+2)]:border-l
                           lg:[&:nth-child(n+3)]:border-t-0"
              >
                <span
                  className="block font-ui text-[0.8125rem] font-semibold tabular-nums text-primary-600"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <EditableText
                  as="h3"
                  path={`rekrutteringComp.steps.${i}.title`}
                  value={step.title}
                  className="mt-3 font-heading text-body font-semibold text-navy leading-snug"
                />

                {step.description && (
                  <EditableText
                    as="p"
                    path={`rekrutteringComp.steps.${i}.description`}
                    value={step.description}
                    multiline
                    className="mt-2.5 text-[0.9375rem] text-ink-muted leading-relaxed"
                  />
                )}
              </li>
            ))}
          </ol>
        )}

        {/* ── El detalle ──────────────────────────────────────────────────
            Texto largo en serif: una sola columna a medida de lectura. El
            filete de la izquierda lo ata a la secuencia de arriba sin
            convertirlo en otra tarjeta. */}
        {body.length > 0 && (
          <div className="mt-14 lg:mt-20 lg:pl-8 lg:border-l lg:border-line">
            <div className="gw-measure text-body text-ink-muted leading-[1.7]">
              {body.map((key) => (
                <EditableText
                  key={key}
                  as="div"
                  path={`rekrutteringComp.${key}`}
                  value={c[key]}
                  multiline
                  richText
                  inputClassName="min-h-[120px]"
                  className="[&>h2:first-child]:mt-0 [&>p:last-child]:mb-0"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
