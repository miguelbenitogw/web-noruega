import useContent from '../hooks/useContent'
import RuleGrid from './ui/RuleGrid'
import RichText from './ui/RichText'
import MarkdownText from './ui/MarkdownText'

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
            <span className="gw-label text-primary-600">{c.label}</span>
            <h2 id="rekruttering-heading" className="mt-5 text-display-sm font-semibold text-navy">
              {c.heading}
            </h2>
          </div>

          {c.badge && (
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="font-ui text-sm font-semibold text-ink-soft lg:text-right">{c.badge}</p>
            </div>
          )}
        </div>

        {/* ── Las cuatro etapas ───────────────────────────────────────────
            Un filete horizontal hace de línea de tiempo y cada etapa cuelga
            de él. En móvil la secuencia se apila y los filetes pasan a ser
            horizontales entre etapas: sigue leyéndose como un orden. */}
        {steps.length > 0 && (
          <RuleGrid cols="sm2-lg4" as="ol" className="mt-12 lg:mt-16 border-t border-line">
            {steps.map((step, i) => (
              <RuleGrid.Cell
                as="li"
                key={step.title || i}
                className="py-7 sm:px-7 lg:px-6 sm:first:pl-0 lg:first:pl-0 lg:last:pr-0"
              >
                <span className="gw-step block text-primary-600" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <h3 className="mt-3 font-heading text-body font-semibold text-navy leading-snug">
                  {step.title}
                </h3>

                {step.description && (
                  <RichText
                    value={step.description}
                    className="mt-2.5 text-body-sm text-ink-muted leading-relaxed"
                  />
                )}
              </RuleGrid.Cell>
            ))}
          </RuleGrid>
        )}

        {/* ── El detalle ──────────────────────────────────────────────────
            Texto largo en serif: una sola columna a medida de lectura. El
            filete de la izquierda lo ata a la secuencia de arriba sin
            convertirlo en otra tarjeta. */}
        {body.length > 0 && (
          <div className="mt-14 lg:mt-20 lg:pl-8 lg:border-l lg:border-line">
            {/* `gw-stack` también afuera: p1, p2 y p3 son campos distintos
                pero un solo texto, así que entre ellos va el mismo aire que
                entre párrafos de un mismo campo. Antes el último <p> de cada
                campo llevaba `mb-0` y el siguiente campo quedaba pegado. */}
            <div className="gw-stack gw-measure text-body text-ink-muted leading-[1.7]">
              {body.map((key) => (
                <MarkdownText key={key} value={c[key]} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
