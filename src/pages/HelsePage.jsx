import Helsesektor from '../components/Helsesektor'
import GodeGrunner from '../components/GodeGrunner'
import Nyheter from '../components/Nyheter'
import PageEndNav from '../components/PageEndNav'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import EditableText from '../components/editable/EditableText'
import EditableImage from '../components/editable/EditableImage'
import InlineRichText from '../components/editable/InlineRichText'
import { IMAGES, img } from '../assets/images'

function InlineEditableParagraph({
  path,
  value,
  className,
  linkClassName,
  as = 'p',
  ...rest
}) {
  return (
    <InlineRichText
      as={as}
      value={value}
      className={className}
      linkClassName={linkClassName}
      data-content-path={path}
      {...rest}
    />
  )
}

/**
 * Descripción de una fase.
 *
 * El texto de la fase 01 son dos párrafos de verdad, así que se parten. El
 * serif pide línea corta: el contenedor de arriba le pone `.gw-measure`.
 */
function PhaseDescription({ index, description }) {
  const paragraphs = (description || '').split('\n\n').filter(Boolean)

  if (paragraphs.length <= 1) {
    return (
      <InlineEditableParagraph
        as="p"
        path={`helsePhases.phases.${index}.description`}
        value={description}
        className="!text-ink-muted text-body leading-[1.7]"
      />
    )
  }

  return (
    <div data-content-path={`helsePhases.phases.${index}.description`}>
      {paragraphs.map((para, pi) => (
        <p key={pi} className="text-ink-muted text-body leading-[1.7] mb-4 last:mb-0">
          {para}
        </p>
      ))}
    </div>
  )
}

export default function HelsePage() {
  const hero = useContent('helseHero')
  const phases = useContent('helsePhases')
  const partnership = useContent('helsePartnership')

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────
          Navy plano, sin velo ni mancha radial. El deck lleva medida de
          lectura: el serif a ancho completo sobre navy no se lee. */}
      <section className="bg-navy pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container-xl">
          <nav className="font-ui text-sm text-primary-200 mb-7" aria-label="Brødsmuler">
            <a href="/" className="transition-colors hover:text-white">Hjem</a>
            <span className="mx-2 text-primary-200/60">/</span>
            <span className="text-white">{hero.breadcrumb}</span>
          </nav>
          <EditableText
            as="h1"
            path="helseHero.h1"
            value={hero.h1}
            className="text-display-sm sm:text-display font-semibold !text-white max-w-[20ch] break-words"
          />
          <InlineEditableParagraph
            as="p"
            path="helseHero.description"
            value={hero.description}
            className="mt-7 gw-measure !text-primary-100 text-body lg:text-[1.1875rem] leading-[1.6]"
            linkClassName="!text-white underline decoration-primary-400 underline-offset-4 transition-colors hover:!decoration-white"
          />
        </div>
      </section>

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
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12 lg:mb-16">
            <div className="lg:col-span-7">
              <EditableText
                as="span"
                path="helsePhases.label"
                value={phases.label}
                className="gw-label text-primary-600"
              />
              <EditableText
                as="h2"
                id="faser-heading"
                path="helsePhases.heading"
                value={phases.heading}
                className="mt-5 text-display-sm font-semibold text-navy"
              />
            </div>
            {phases.description ? (
              <div className="lg:col-span-5">
                <InlineEditableParagraph
                  as="p"
                  path="helsePhases.description"
                  value={phases.description}
                  className="!text-ink-muted text-body leading-[1.65]"
                />
              </div>
            ) : null}
          </div>

          <ol className="list-none border-t border-line">
            {(phases.phases || []).map((phase, i) => (
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
                  <EditableText
                    as="h3"
                    path={`helsePhases.phases.${i}.title`}
                    value={phase.title}
                    className="font-heading text-[1.25rem] lg:text-[1.4375rem] font-semibold text-navy leading-snug"
                  />

                  <div className="mt-4 gw-measure">
                    <PhaseDescription index={i} description={phase.description} />
                  </div>

                  {phase.formats && (
                    <dl className="mt-7 grid sm:grid-cols-3 rounded-panel border border-line overflow-hidden">
                      {phase.formats.map((f) => (
                        <div
                          key={f.label}
                          className="px-5 py-4 border-line
                                     [&:not(:first-child)]:border-t
                                     sm:[&:not(:first-child)]:border-t-0
                                     sm:[&:not(:first-child)]:border-l"
                        >
                          <dt className="font-ui text-[0.9375rem] font-semibold text-navy tabular-nums">
                            {f.duration}
                          </dt>
                          <dd className="mt-1 font-ui text-[0.8125rem] text-ink-soft leading-snug">
                            {f.label}
                          </dd>
                        </div>
                      ))}
                    </dl>
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
              <EditableText
                as="span"
                path="helsePartnership.label"
                value={partnership.label}
                className="gw-label text-white"
              />
              <EditableText
                as="h2"
                id="helse-partnership-heading"
                path="helsePartnership.heading"
                value={partnership.heading}
                className="mt-5 text-display-sm font-semibold !text-white"
              />
              <InlineEditableParagraph
                as="p"
                path="helsePartnership.p1"
                value={partnership.p1}
                className="mt-6 gw-measure !text-primary-100 text-body leading-[1.65]"
                linkClassName="!text-white underline decoration-primary-400 underline-offset-4 transition-colors hover:!decoration-white"
              />
              {partnership.p2 ? (
                <InlineEditableParagraph
                  as="p"
                  path="helsePartnership.p2"
                  value={partnership.p2}
                  className="mt-4 gw-measure !text-primary-100 text-body leading-[1.65]"
                  linkClassName="!text-white underline decoration-primary-400 underline-offset-4 transition-colors hover:!decoration-white"
                />
              ) : null}

              <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
                <a
                  href="/kontakt"
                  onClick={() => trackEvent('cta_click', { location: 'helse_partnership', cta: 'kontakt_oss' })}
                  className="gw-btn gw-btn-ember"
                >
                  <EditableText as="span" path="helsePartnership.cta1" value={partnership.cta1} className="inline" />
                </a>
                <a
                  href="/talentportalen"
                  onClick={() => trackEvent('cta_click', { location: 'helse_partnership', cta: 'se_portalen' })}
                  className="gw-btn gw-btn-ghost"
                >
                  <EditableText as="span" path="helsePartnership.cta2" value={partnership.cta2} className="inline" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 pb-20 lg:py-28">
              <EditableImage
                path="helsePartnership.imageUrl"
                src={img(partnership.imageUrl || IMAGES.rekruttering, 1200)}
                alt={partnership.imageAlt || 'Global Working rekrutteringsprosessen'}
                className="w-full h-[280px] sm:h-[380px] lg:h-[460px] object-cover rounded-panel"
                loading="lazy"
                width="720"
                height="460"
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
