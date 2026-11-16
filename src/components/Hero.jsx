import useInView from '../hooks/useInView'
import useCounter from '../hooks/useCounter'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import { IMAGES, img, srcSet } from '../assets/images'
import EditableText from './editable/EditableText'
import EditableImage from './editable/EditableImage'

/**
 * Hero — «To kyster»
 *
 * El hero anterior era el patrón por defecto: foto a sangre, velo navy,
 * titular centrado con una palabra en naranja, cuatro tarjetas de cristal y
 * un ratoncito animado. Todo eso aparece igual en cualquier landing generada.
 *
 * Este parte de lo que el negocio ES: un puente entre dos sitios. A la
 * izquierda la pregunta del empleador noruego, a la derecha las dos orillas
 * en imágenes — el trabajo en Noruega y la vida en Alicante.
 *
 * El acento naranja no vive en el titular, vive en el único botón que importa.
 */

function Stat({ stat, active, index }) {
  const animatedValue = useCounter(stat.value, active && stat.animate, 1800)
  const display = stat.animate ? animatedValue : stat.value


  return (
    <div
      className="px-5 py-6 lg:px-8 lg:py-8 border-white/15
                 [&:nth-child(even)]:border-l [&:nth-child(n+3)]:border-t
                 lg:[&:nth-child(n+2)]:border-l lg:[&:nth-child(n+3)]:border-t-0"
    >
      <EditableText
        as="div"
        path={`hero.stats.${index}.value`}
        value={display}
        className="font-heading text-[1.75rem] lg:text-[2.25rem] font-semibold text-white tabular-nums tracking-[-0.03em] leading-none"
        inputClassName="font-heading text-2xl font-semibold"
      />
      <EditableText
        as="div"
        path={`hero.stats.${index}.label`}
        value={stat.label}
        className="mt-2 text-[0.9375rem] text-primary-200 leading-snug"
      />
    </div>
  )
}

export default function Hero() {
  const [statsRef, statsVisible] = useInView({ threshold: 0.3 })
  const c = useContent('hero')
  const stats = c.stats || []

  return (
    <section
      className="relative bg-navy overflow-hidden"
      aria-label="Hovedseksjon – Global Working Norge"
    >
      {/* Campo de color: un solo degradado muy contenido, de navy a navy
          profundo. Sin halos radiales ni manchas decorativas. */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-navy via-navy to-navy-deep"
        aria-hidden="true"
      />

      <div className="container-xl relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-32 pb-16 lg:pt-44 lg:pb-24">

          {/* ── Columna de texto ─────────────────────────────────────── */}
          <div className="lg:col-span-7 animate-riseIn">
            <h1 className="text-display-lg font-semibold text-white">
              <EditableText as="span" path="hero.h1First" value={c.h1First} className="block" />
              <EditableText
                as="span"
                path="hero.h1Highlight"
                value={c.h1Highlight}
                className="block lg:pl-[0.38em]"
              />
            </h1>

            <EditableText
              as="p"
              path="hero.description"
              value={c.description}
              multiline
              className="mt-7 gw-measure text-body lg:text-[1.1875rem] text-primary-100 leading-[1.6]"
              inputClassName="min-h-[160px]"
            />

            <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
              <a
                href="/vr-rekrutteringsmodell"
                onClick={() => trackEvent('cta_click', { location: 'hero', cta: 'slik_jobber_vi' })}
                className="gw-btn gw-btn-ember"
              >
                <EditableText as="span" path="hero.cta1" value={c.cta1} className="inline" />
              </a>
              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'hero', cta: 'kontakt_oss' })}
                className="gw-btn gw-btn-ghost"
              >
                <EditableText as="span" path="hero.cta2" value={c.cta2} className="inline" />
              </a>
            </div>
          </div>

          {/* ── Las dos orillas ──────────────────────────────────────────
              La imagen grande es la editable desde el admin. Las dos
              pequeñas son de marca, no de contenido: la vida en Alicante y
              el trabajo en Noruega. En móvil queda solo la principal. */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-12 gap-3">
              {/* width/height van en 3:2, la proporción real de team-hero
                  (3088x2056). Antes declaraba 1200x1500 (4:5), que no coincidía
                  con nada: hoy no salta porque la altura la fija el CSS, pero en
                  cuanto esa altura desaparezca el salto sería enorme.
                  Si cambiás `sizes`, cambiá también `imagesizes` en el preload
                  de index.html, o el navegador se baja dos variantes distintas. */}
              <div className="col-span-12 sm:col-span-8 animate-settle">
                <div className="rounded-panel overflow-hidden bg-primary-800">
                  <EditableImage
                    path="hero.imageUrl"
                    src={img(c.imageUrl || IMAGES.teamHero, 1200)}
                    srcSet={srcSet(c.imageUrl || IMAGES.teamHero, [640, 1024, 1200])}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    alt={c.imageAlt || 'Global Working Norge – rekruttering av fagfolk'}
                    className="w-full h-[280px] sm:h-[420px] lg:h-[480px] object-cover object-center"
                    loading="eager"
                    fetchPriority="high"
                    width={1200}
                    height={800}
                  />
                </div>
              </div>

              <div
                className="hidden sm:flex sm:col-span-4 flex-col gap-3 animate-settle [animation-delay:140ms]"
                aria-hidden="true"
              >
                <div className="rounded-panel overflow-hidden bg-primary-800 flex-1">
                  <img
                    src={IMAGES.helseHealthTeam}
                    alt=""
                    className="w-full h-full min-h-[120px] object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="rounded-panel overflow-hidden bg-primary-800 flex-1">
                  <img
                    src={IMAGES.spanskAlicantePromenade}
                    alt=""
                    className="w-full h-full min-h-[120px] object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tira de datos ────────────────────────────────────────────────
          Antes eran cuatro tarjetas de cristal flotando. Ahora es una tira
          con filetes: los números se comparan entre sí, que es para lo que
          están. */}
      {stats.length > 0 && (
        <div className="relative border-t border-white/15 bg-navy-deep">
          <div className="container-xl">
            <div
              ref={statsRef}
              className="grid grid-cols-2 lg:grid-cols-4"
            >
              {stats.map((stat, i) => (
                <Stat
                  key={`${stat.label}-${i}`}
                  stat={stat}
                  active={statsVisible}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
