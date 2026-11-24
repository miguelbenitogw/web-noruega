import Talentportalen from '../components/Talentportalen'
import PageEndNav from '../components/PageEndNav'
import PageHero from '../components/ui/PageHero'
import RuleGrid from '../components/ui/RuleGrid'
import useContent from '../hooks/useContent'
import RichText from '../components/ui/RichText'
// Capítulos y narración del recorrido, extraídos en build del HTML del propio
// iframe (ver el plugin `talent-tour` en vite.config.js): lo que dice la
// omvisning es lo que dice el resumen, sin una segunda copia a mano.
import TOUR_CHAPTERS from 'virtual:talent-tour'

/**
 * Talentportalen
 *
 * El hero y la «Omvisning» (el recorrido real del portal en un iframe) ya
 * estaban rediseñados. Lo que seguía debajo era el kit por defecto: cuatro
 * tarjetas centradas con `hover:shadow-lg`, un icono genérico dentro de un
 * cuadrado azul y el número del paso en un 5xl casi transparente de adorno; y
 * después cuatro beneficios en tarjetas blancas con su palomita.
 *
 * El 01–04 acá es un orden real —son instrucciones, se hacen una detrás de
 * otra—, así que el número pasa a ser el ancla de cada fila en vez de
 * decoración, y los iconos genéricos se van: no aportaban nada que el título
 * no dijera ya.
 */
export default function TalentportalenPage() {
  const hero = useContent('talentportalenHero')
  const stepsSection = useContent('talentportalenSteps')
  const benefitsSection = useContent('talentportalenBenefits')

  return (
    <>
      <PageHero
        current={hero.breadcrumb}
        title={hero.h1}
        titleId="talentportalen-hero-heading"
        titleWidth="18ch"
        description={hero.description}
      />

      {/* Omvisning — el recorrido interactivo del portal.
          Es una página autocontenida en /public, así que entra en un iframe
          del mismo origen. Si esto deja de cargar, revisá `X-Frame-Options`
          y `frame-src` en vercel.json: tienen que permitir 'self'. */}
      <section className="bg-navy-deep pb-16 lg:pb-24" aria-labelledby="omvisning-heading">
        <div className="container-xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6">
            <div>
              <span className="gw-label text-white">Omvisning</span>
              <h2 id="omvisning-heading" className="mt-4 font-heading text-2xl font-semibold text-white">
                Se Talent Portal i praksis
              </h2>
            </div>
            <a
              href="/tutorial-talent-portal/index.html"
              target="_blank"
              rel="noopener"
              className="shrink-0 inline-flex items-center gap-2 font-ui text-sm font-semibold text-primary-200 hover:text-white transition-colors"
            >
              Åpne i fullskjerm
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>

          <div className="rounded-panel overflow-hidden border border-white/15 bg-navy">
            <iframe
              src="/tutorial-talent-portal/index.html"
              title="Produktomvisning av Talent Portal"
              loading="lazy"
              className="block w-full h-[560px] sm:h-[620px] lg:h-[720px] border-0"
            />
          </div>

          {/* La omvisning en texto. El iframe se anima solo y quien no lo
              mira entero —o un buscador, que no lo mira nunca— se quedaba sin
              saber qué hace el portal. Mismos títulos y narración que el
              recorrido (ver src/lib/talentTour.js). Filetes y no tarjetas:
              son capítulos de una misma secuencia. */}
          {TOUR_CHAPTERS.length > 0 && (
            <ol className="mt-10 lg:mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 border-t border-white/15">
              {TOUR_CHAPTERS.map((chapter) => (
                <li key={chapter.number} className="py-7 border-b border-white/15">
                  <h3 className="font-heading text-body-lg font-semibold text-white leading-snug">
                    {chapter.title}
                  </h3>
                  <dl className="mt-4 space-y-3">
                    {chapter.steps.map((step) => (
                      <div key={step.t}>
                        <dt className="font-ui text-body-sm font-semibold text-primary-100">{step.t}</dt>
                        <dd className="mt-0.5 text-body-sm text-primary-200 leading-relaxed">{step.d}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <Talentportalen />

      {/* ── Paso a paso ───────────────────────────────────────────────────
          Cuatro instrucciones que se hacen una detrás de otra. El número deja
          de ser un 5xl de adorno detrás del icono y pasa a ser el ancla de la
          fila: el ojo salta 01 → 02 → 03 → 04 por los filetes. */}
      <section className="py-20 lg:py-28 bg-white" aria-labelledby="how-it-works-heading">
        <div className="container-xl">
          <div className="max-w-2xl">
            <span className="gw-label text-primary-600">{stepsSection.label}</span>
            <h2 id="how-it-works-heading" className="mt-5 text-display-sm font-semibold text-navy">
              {stepsSection.heading}
            </h2>
          </div>

          <RuleGrid cols="sm2" as="ol" className="mt-12 lg:mt-16 border-t border-line">
            {(stepsSection.steps || []).map((step, i) => (
              <RuleGrid.Cell
                as="li"
                key={step.number || i}
                className="flex gap-5 py-7 sm:px-8 sm:odd:pl-0"
              >
                <span className="gw-step shrink-0 pt-1 text-primary-600" aria-hidden="true">
                  {step.number || String(i + 1).padStart(2, '0')}
                </span>

                <div>
                  <h3 className="font-heading text-body font-semibold text-navy leading-snug">
                    {step.title}
                  </h3>
                  <RichText
                    value={step.desc}
                    className="mt-2 text-body-sm text-ink-muted leading-relaxed"
                  />
                </div>
              </RuleGrid.Cell>
            ))}
          </RuleGrid>
        </div>
      </section>

      {/* ── Por qué el portal ─────────────────────────────────────────────
          Cuatro afirmaciones sueltas. No son pasos ni merecen tarjeta: son
          cuatro líneas de una misma lista, y el filete ya las separa. El
          título se va a la izquierda para que la lista arranque siempre en
          el mismo punto del ojo. */}
      <section className="py-20 lg:py-28 bg-surface" aria-labelledby="benefits-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            {/* Cinco columnas y no cuatro: «kandidatportalen» es una sola
                palabra de 400 px en display-sm y la columna de 4/12 medía
                385 a 1440, así que el titular se salía de su caja. */}
            <div className="lg:col-span-5">
              <span className="gw-label text-primary-600">{benefitsSection.label}</span>
              <h2 id="benefits-heading" className="mt-5 text-display-sm font-semibold text-navy">
                {benefitsSection.heading}
              </h2>
            </div>

            <ul className="lg:col-span-7 lg:col-start-6 border-t border-line" role="list">
              {(benefitsSection.items || []).map((benefit, i) => (
                <li key={i} className="flex items-start gap-4 py-5 border-b border-line">
                  <svg
                    width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                    className="shrink-0 mt-1.5 text-primary-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-body text-navy leading-[1.6]">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PageEndNav current="/talentportalen" />
    </>
  )
}
