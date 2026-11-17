import useInView from '../hooks/useInView'
import useCounter from '../hooks/useCounter'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import { IMAGES, img, srcSet } from '../assets/images'
import RuleGrid from './ui/RuleGrid'
import RichText from './ui/RichText'

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

function Stat({ stat, active }) {
  const animatedValue = useCounter(stat.value, active && stat.animate, 1800)
  const display = stat.animate ? animatedValue : stat.value


  return (
    <RuleGrid.Cell className="px-5 py-6 lg:px-8 lg:py-8">
      <div
        className="font-heading text-[1.75rem] lg:text-[2.25rem] font-semibold text-white tabular-nums tracking-[-0.03em] leading-none"
      >
        {display}
      </div>
      <div className="mt-2 text-body-sm text-primary-200 leading-snug">{stat.label}</div>
    </RuleGrid.Cell>
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
              <span className="block">{c.h1First}</span>
              <span className="block lg:pl-[0.38em]">{c.h1Highlight}</span>
            </h1>

            <RichText
              value={c.description}
              className="mt-7 gw-measure text-body lg:text-body-lg text-primary-100 leading-[1.6]"
              tone="dark"
            />

            <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
              <a
                href="/vr-rekrutteringsmodell"
                onClick={() => trackEvent('cta_click', { location: 'hero', cta: 'slik_jobber_vi' })}
                className="gw-btn gw-btn-ember"
              >
                <span>{c.cta1}</span>
              </a>
              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'hero', cta: 'kontakt_oss' })}
                className="gw-btn gw-btn-ghost"
              >
                <span>{c.cta2}</span>
              </a>
            </div>
          </div>

          {/* ── Las dos orillas ──────────────────────────────────────────
              La imagen grande sale del contenido (`hero.imageUrl`). Las dos
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
                  <img
                    src={img(c.imageUrl || IMAGES.teamHero, 1200)}
                    srcSet={srcSet(c.imageUrl || IMAGES.teamHero, [640, 1024, 1200])}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    alt={c.imageAlt || 'Global Working Norge – rekruttering av fagfolk'}
                    className="w-full h-[280px] sm:h-[420px] lg:h-[480px] object-cover object-center"
                    loading="eager"
                    fetchPriority="high"
                    width={1200}
                    height={800}
                    decoding="sync"
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
          {/* El observador vive en el contenedor y no en la rejilla: envuelve
              exactamente lo mismo —la tira de datos es su único hijo— y así no
              hay que pasarle una `ref` a un componente del sistema. */}
          <div className="container-xl" ref={statsRef}>
            <RuleGrid cols="base2-lg4" tone="dark">
              {stats.map((stat, i) => (
                <Stat
                  key={`${stat.label}-${i}`}
                  stat={stat}
                  active={statsVisible}
                />
              ))}
            </RuleGrid>
          </div>
        </div>
      )}
    </section>
  )
}
