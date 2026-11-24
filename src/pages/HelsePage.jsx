import Helsesektor from '../components/Helsesektor'
import GodeGrunner from '../components/GodeGrunner'
import Nyheter from '../components/Nyheter'
import PageEndNav from '../components/PageEndNav'
import PageHero from '../components/ui/PageHero'
import RuleGrid from '../components/ui/RuleGrid'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import { IMAGES, img } from '../assets/images'
import RichText from '../components/ui/RichText'

export default function HelsePage() {
  const hero = useContent('helseHero')
  const phases = useContent('helsePhases')
  const partnership = useContent('helsePartnership')

  return (
    <>
      <PageHero
        current={hero.breadcrumb}
        title={hero.h1}
        titleId="helse-hero-heading"
        titleWidth="20ch"
        description={hero.description}
      />

      <Helsesektor />

      {/* ── Las tres fases ───────────────────────────────────────────────
          Aquí la numeración está justificada: es una secuencia real, no tres
          ventajas disfrazadas de pasos. Antes era una pila de tarjetas
          `rounded-2xl` con un círculo azul y `shadow-lg shadow-primary-200`
          colgando a la izquierda. Ahora es un libro de cuentas: el número
          vive en el margen y cada fase es una fila separada por un filete.
          La línea vertical punteada tampoco hace falta — el filete ya ordena. */}
      <section className="py-20 lg:py-28 bg-white border-t border-line" aria-labelledby="faser-heading">
        <div className="container-xl">
          {/* Mismo criterio que «Vårt tilbud» en la portada: las dos columnas
              de una cabecera arrancan en la misma línea. Con `items-end` la
              bajada quedaba 90 px por debajo de la etiqueta, colgando del pie
              del titular, y cada cabecera de la web se alineaba distinto. */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12 lg:mb-16">
            <div className="lg:col-span-7">
              <span className="gw-label text-primary-600">{phases.label}</span>
              <h2 id="faser-heading" className="mt-5 text-display-sm font-semibold text-navy">
                {phases.heading}
              </h2>
            </div>
            {phases.description ? (
              <div className="lg:col-span-5">
                <RichText
                  value={phases.description}
                  className="text-ink-muted text-body leading-[1.6]"
                />
              </div>
            ) : null}
          </div>

          <ol className="list-none border-t border-line">
            {(phases.phases || []).map((phase) => (
              <li
                key={phase.number}
                className="grid lg:grid-cols-12 gap-x-8 gap-y-3 py-9 lg:py-12 border-b border-line"
              >
                <div className="lg:col-span-3">
                  <span
                    aria-hidden="true"
                    className="font-ui text-[2.25rem] lg:text-[3rem] font-semibold tabular-nums leading-none tracking-[-0.045em] text-primary-200"
                  >
                    {phase.number}
                  </span>
                </div>

                <div className="lg:col-span-8 lg:col-start-5">
                  <h3
                    className="font-heading text-[1.25rem] lg:text-[1.4375rem] font-semibold text-navy leading-snug"
                  >
                    {phase.title}
                  </h3>

                  <div className="mt-4 gw-measure">
                    {/* Antes había un componente propio que partía por `\n\n` a mano:
                        la fase 01 trae dos párrafos. RichText ya lo hace y
                        con el mismo aire que el resto de la web. */}
                    <RichText value={phase.description} className="text-body text-ink-muted leading-[1.6]" />
                  </div>

                  {phase.formats && (
                    <RuleGrid
                      cols="sm3"
                      as="dl"
                      className="mt-7 rounded-panel border border-line overflow-hidden"
                    >
                      {phase.formats.map((f) => (
                        <RuleGrid.Cell key={f.label} className="px-5 py-4">
                          <dt className="font-ui text-body-sm font-semibold text-navy tabular-nums">
                            {f.duration}
                          </dt>
                          <dd className="mt-1 gw-meta leading-snug">
                            {f.label}
                          </dd>
                        </RuleGrid.Cell>
                      ))}
                    </RuleGrid>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Modelo de colaboración ───────────────────────────────────────
          Banda navy: es el punto de conversión de la página y el único sitio
          donde aparece el naranja. Antes tenía un cuadrado `bg-primary-100/60`
          y un círculo `bg-cta/10` flotando detrás de la foto, más un
          `shadow-xl`: decoración que no dice nada. */}
      <section className="bg-navy" aria-labelledby="helse-partnership-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-5 pt-20 lg:py-28">
              <span className="gw-label text-white">{partnership.label}</span>
              <h2 id="helse-partnership-heading" className="mt-5 text-display-sm font-semibold !text-white">
                {partnership.heading}
              </h2>
              {/* p1 y p2 son un mismo texto: el bloque lleva el estilo y los
                  dos lo heredan, con el aire de párrafo de `gw-stack` (antes
                  `mt-4` entre ellos, distinto del resto de la web). */}
              <div className="mt-6 gw-measure gw-stack text-body text-primary-100 leading-[1.6]">
                <RichText value={partnership.p1} tone="dark" />
                {partnership.p2 ? <RichText value={partnership.p2} tone="dark" /> : null}
              </div>

              <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
                <a
                  href="/kontakt"
                  onClick={() => trackEvent('cta_click', { location: 'helse_partnership', cta: 'kontakt_oss' })}
                  className="gw-btn gw-btn-ember"
                >
                  <span>{partnership.cta1}</span>
                </a>
                <a
                  href="/talentportalen"
                  onClick={() => trackEvent('cta_click', { location: 'helse_partnership', cta: 'se_portalen' })}
                  className="gw-btn gw-btn-ghost"
                >
                  <span>{partnership.cta2}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 pb-20 lg:py-28">
              <img
                src={img(partnership.imageUrl || IMAGES.rekruttering, 1200)}
                alt={partnership.imageAlt || 'Global Working rekrutteringsprosessen'}
                className="w-full h-[280px] sm:h-[380px] lg:h-[460px] object-cover rounded-panel"
                loading="lazy"
                width="720"
                height="460"
                decoding="async"
              />
            </div>

          </div>
        </div>
      </section>

      <GodeGrunner />
      <Nyheter />
      <PageEndNav current="/helse" />
    </>
  )
}
