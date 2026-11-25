import useInView from '../hooks/useInView'
import useCounter from '../hooks/useCounter'
import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import { IMAGES, img, srcSet } from '../assets/images'
import RuleGrid from './ui/RuleGrid'
import RichText from './ui/RichText'
import TrustMarks from './ui/TrustMarks'

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
            {/* La segunda línea iba sangrada `0.38em`: pensado como gesto,
                se leía como un espacio de más pegado a mano. Las dos líneas
                arrancan ahora en el mismo borde que la bajada y los botones,
                y el bloque entero queda alineado a una sola vertical. */}
            {/* Una sola frase, no dos bloques. Con un <span className="block"> por
                línea, el traductor de Chrome trataba cada trozo como frase aparte
                («¿Necesitas? ¿mano de obra?») y un lector de pantalla podía leerla
                cortada. El salto lo decide text-wrap: balance. */}
            <h1 className="text-display-lg font-semibold text-white">
              {[c.h1First, c.h1Highlight].filter(Boolean).join(' ')}
            </h1>

            <RichText
              value={c.description}
              className="mt-7 gw-measure text-body lg:text-body-lg text-primary-100 leading-[1.6]"
              tone="dark"
            />

            <div className="mt-9 flex flex-col sm:flex-row sm:flex-wrap gap-3.5">
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

            {/* Credenciales justo debajo de la acción: es lo que el comprador
                de una kommune necesita saber antes de pulsar. Un filete las
                separa de los botones para que no se lean como un tercer
                enlace. */}
            <TrustMarks tone="dark" className="mt-10 pt-7 border-t border-white/15 max-w-[40rem]" />
          </div>

          {/* ── La empresa, en una foto ──────────────────────────────────
              Antes era un mosaico de tres: el equipo de fiesta haciendo el
              pulgar arriba, una foto de banco de imagen y un paseo marítimo.
              Para un empleador público eso dice «agencia joven», no «empresa
              establecida». Ahora es UNA foto propia, en apaisado y entera:
              la plantilla delante de la sede de Albufereta, con su pie. El
              edificio y la cantidad de gente son la prueba; no hace falta
              repetirla en miniatura.
              Si cambiás `sizes`, cambiá también `imagesizes` en el preload
              de index.html y HOME_HERO_PRELOAD, o se bajan dos variantes. */}
          <figure className="lg:col-span-5 animate-settle">
            <img
              src={img(c.imageUrl || IMAGES.equipoSede, 1024)}
              srcSet={srcSet(c.imageUrl || IMAGES.equipoSede)}
              sizes="(max-width: 1023px) 100vw, 40vw"
              alt={c.imageAlt || 'Ansatte i Global Working foran hovedkontoret i Alicante'}
              className="gw-photo w-full aspect-[4/3] lg:aspect-[5/4] object-[40%_50%] !outline-white/10"
              loading="eager"
              fetchPriority="high"
              width={2048}
              height={1365}
              decoding="sync"
            />
            {c.imageCaption ? (
              <figcaption className="gw-caption gw-caption-dark">{c.imageCaption}</figcaption>
            ) : null}
          </figure>
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
