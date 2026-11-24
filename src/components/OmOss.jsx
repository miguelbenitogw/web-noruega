import { IMAGES, img, srcSet } from '../assets/images'
import useContent from '../hooks/useContent'
import RuleGrid from './ui/RuleGrid'
import TextLink from './ui/TextLink'
import RichText from './ui/RichText'

/**
 * OmOss — «Hvem er Global Working?»
 *
 * Antes: collage de tres imágenes con `shadow-lg`, `group-hover:scale-110` y
 * velo navy encima, una cita dentro de una tarjeta azul redondeada, y tres
 * valores en tarjetas con el MISMO icono repetido y `hover:shadow-md`. El kit
 * por defecto completo.
 *
 * Ahora: una imagen del equipo que se ve, la sede como dato con filete, la
 * cita como pull quote editorial, y los tres valores como columnas numeradas
 * separadas por filetes — son pares entre sí y el filete lo dice mejor que
 * una sombra.
 */

export default function OmOss() {
  const c = useContent('omOssComp')

  return (
    <section
      id="om-oss"
      className="scroll-mt-28 py-20 lg:py-28 bg-white"
      aria-labelledby="om-oss-heading"
    >
      <div className="container-xl">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ── Relato ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-6">
            <span className="gw-label text-primary-600">{c.label}</span>
            <h2 id="om-oss-heading" className="mt-5 text-display-sm font-semibold text-navy">{c.heading}</h2>

            {/* p1 y p2 son un mismo texto: el segundo iba sin `text-body` (un
                punto más chico) y con `mt-4`. Ahora el bloque lleva el estilo
                y los dos párrafos lo heredan. */}
            <div className="mt-6 gw-stack text-body text-ink-muted leading-[1.6]">
              <RichText value={c.p1} />
              <RichText value={c.p2} />
            </div>

            {/* Pull quote: filete y aire, no tarjeta. La voz del CEO no
                necesita una caja azul para sonar distinta. */}
            {c.blockquote && (
              <blockquote className="mt-9 border-l border-primary-200 pl-6">
                <p className="text-body lg:text-[1.125rem] text-navy leading-[1.6]">{c.blockquote.text}</p>
                <footer className="mt-4 font-ui text-sm text-ink-soft">
                  <span>{c.blockquote.author}</span>
                </footer>
                <TextLink href="/nyheter/pablo-intervju" className="mt-4">
                  Les hele intervjuet med Pablo her
                </TextLink>
              </blockquote>
            )}

            {/* Tira de datos: se comparan entre sí, así que van en una fila
                con filetes, no en tres bloques sueltos con `flex-wrap`. */}
            {(c.stats || []).length > 0 && (
              <RuleGrid cols="base3" className="mt-10 border-t border-line">
                {(c.stats || []).map((s) => (
                  <RuleGrid.Cell
                    key={s.label}
                    className="py-6 pr-4 pl-4 first:pl-0 sm:pl-6"
                  >
                    <div
                      className="font-heading text-[1.75rem] lg:text-[2rem] font-semibold text-navy tabular-nums tracking-[-0.03em] leading-none"
                    >
                      {s.value}
                    </div>
                    <div className="mt-2 gw-meta leading-snug">{s.label}</div>
                  </RuleGrid.Cell>
                ))}
              </RuleGrid>
            )}
          </div>

          {/* ── El equipo y la sede ────────────────────────────────────── */}
          <div className="lg:col-span-6">
            <img
              src={img(c.teamImageUrl || IMAGES.teamGroup, 1200)}
              srcSet={srcSet(c.teamImageUrl || IMAGES.teamGroup, [400, 800, 1200])}
              sizes="(max-width: 1024px) 100vw, 50vw"
              alt={c.teamImageAlt || 'Global Working-teamet'}
              className="w-full h-[320px] lg:h-[460px] object-cover rounded-panel"
              loading="lazy"
              decoding="async"
              width={1200}
              height={800}
            />

            <div className="mt-3 grid grid-cols-12 gap-3">
              <img
                src={img(c.officeImageUrl || IMAGES.oficina, 800)}
                alt={c.officeImageAlt || 'Global Working-kontor'}
                className="col-span-5 w-full h-[130px] lg:h-[160px] object-cover rounded-panel"
                loading="lazy"
                decoding="async"
                width={400}
                height={160}
              />

              <div className="col-span-7 flex flex-col justify-center border-l border-line pl-5">
                <div className="font-heading text-2xl lg:text-[1.75rem] font-semibold text-navy leading-none">
                  {c.locationLabel}
                </div>
                <div className="mt-2 gw-meta leading-snug">{c.locationSub}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tres maneras de trabajar ──────────────────────────────────
            Columnas numeradas. Antes eran tres tarjetas con el mismo icono
            de capas repetido: un icono que se repite no informa, decora. */}
        {(c.values || []).length > 0 && (
          <RuleGrid cols="sm3" className="mt-20 lg:mt-28 border-t border-line">
            {(c.values || []).map((v, i) => (
              <RuleGrid.Cell
                key={v.title}
                className="py-8 sm:px-7 sm:py-9 sm:first:pl-0"
              >
                <span className="gw-step text-primary-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-heading text-body-lg font-semibold text-navy leading-snug">
                  {v.title}
                </h3>
                <RichText
                  value={v.desc}
                  className="mt-3 text-ink-muted text-body-sm leading-relaxed"
                />
              </RuleGrid.Cell>
            ))}
          </RuleGrid>
        )}
      </div>
    </section>
  )
}
