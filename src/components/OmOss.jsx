import { IMAGES, img, srcSet } from '../assets/images'
import useContent from '../hooks/useContent'
import EditableText from './editable/EditableText'
import InlineRichText from './editable/InlineRichText'
import RuleGrid from './ui/RuleGrid'
import TextLink from './ui/TextLink'

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
            <EditableText
              as="span"
              path="omOssComp.label"
              value={c.label}
              className="gw-label text-primary-600"
            />
            <EditableText
              as="h2"
              id="om-oss-heading"
              path="omOssComp.heading"
              value={c.heading}
              className="mt-5 text-display-sm font-semibold text-navy"
            />

            <InlineEditableParagraph
              as="p"
              path="omOssComp.p1"
              value={c.p1}
              className="mt-6 !text-ink-muted text-body !leading-[1.65]"
            />
            <InlineEditableParagraph
              as="p"
              path="omOssComp.p2"
              value={c.p2}
              className="mt-4 !text-ink-muted !leading-[1.65]"
            />

            {/* Pull quote: filete y aire, no tarjeta. La voz del CEO no
                necesita una caja azul para sonar distinta. */}
            {c.blockquote && (
              <blockquote className="mt-9 border-l border-primary-200 pl-6">
                <EditableText
                  as="p"
                  path="omOssComp.blockquote.text"
                  value={c.blockquote.text}
                  className="text-body lg:text-[1.125rem] text-navy leading-[1.6]"
                />
                <footer className="mt-4 font-ui text-sm text-ink-soft">
                  <EditableText
                    as="span"
                    path="omOssComp.blockquote.author"
                    value={c.blockquote.author}
                    className="inline"
                  />
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
                {(c.stats || []).map((s, i) => (
                  <RuleGrid.Cell
                    key={s.label}
                    className="py-6 pr-4 pl-4 first:pl-0 sm:pl-6"
                  >
                    <EditableText
                      as="div"
                      path={`omOssComp.stats.${i}.value`}
                      value={s.value}
                      className="font-heading text-[1.75rem] lg:text-[2rem] font-semibold text-navy tabular-nums tracking-[-0.03em] leading-none"
                    />
                    <EditableText
                      as="div"
                      path={`omOssComp.stats.${i}.label`}
                      value={s.label}
                      className="mt-2 gw-meta leading-snug"
                    />
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
                <EditableText
                  as="div"
                  path="omOssComp.locationLabel"
                  value={c.locationLabel}
                  className="font-heading text-2xl lg:text-[1.75rem] font-semibold text-navy leading-none"
                />
                <EditableText
                  as="div"
                  path="omOssComp.locationSub"
                  value={c.locationSub}
                  className="mt-2 gw-meta leading-snug"
                />
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
                <EditableText
                  as="h3"
                  path={`omOssComp.values.${i}.title`}
                  value={v.title}
                  className="mt-4 font-heading text-body-lg font-semibold text-navy leading-snug"
                />
                <InlineEditableParagraph
                  as="p"
                  path={`omOssComp.values.${i}.desc`}
                  value={v.desc}
                  className="mt-3 !text-ink-muted text-body-sm !leading-relaxed"
                />
              </RuleGrid.Cell>
            ))}
          </RuleGrid>
        )}
      </div>
    </section>
  )
}
