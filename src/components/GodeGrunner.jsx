import { IMAGES, img } from '../assets/images'
import useContent from '../hooks/useContent'
import EditableText from './editable/EditableText'
import EditableImage from './editable/EditableImage'
import TextLink from './ui/TextLink'

/**
 * GodeGrunner — por qué trabajar con nosotros.
 *
 * Antes: imagen en `rounded-3xl shadow-2xl` con un degradado encima, dos
 * columnas y nada más. Y los tres testimonios de kommuner noruegas —Åmot,
 * Kautokeino, Trondheim— estaban en el contenido SIN pintarse. Para un
 * responsable de personal que duda, la frase de otro kommune vale más que
 * cualquier adjetivo nuestro: es la prueba de que el candidato se queda y de
 * que el noruego era de verdad.
 *
 * La imagen pasa a banda ancha arriba (corta el ritmo de columnas de la
 * página) y debajo la cabecera convive con los testimonios en lista.
 */
export default function GodeGrunner() {
  const c = useContent('godeGrunner')
  const testimonials = c.testimonials || []

  return (
    <section
      className="py-20 lg:py-28 bg-surface border-t border-line"
      aria-labelledby="gode-grunner-heading"
    >
      <div className="container-xl">
        <EditableImage
          path="godeGrunner.imageUrl"
          src={img(c.imageUrl || IMAGES.rekruttering, 1600)}
          alt={c.imageAlt || 'Global Working samarbeid med norske kommuner'}
          className="w-full h-[240px] sm:h-[320px] lg:h-[400px] object-cover object-center rounded-panel"
          loading="lazy"
          width="1280"
          height="400"
        />

        <div className="mt-12 lg:mt-16 grid lg:grid-cols-12 gap-10 lg:gap-16">

          <div className="lg:col-span-5">
            <EditableText
              as="span"
              path="godeGrunner.label"
              value={c.label}
              className="gw-label text-primary-600"
            />
            <EditableText
              id="gode-grunner-heading"
              as="h2"
              path="godeGrunner.heading"
              value={c.heading}
              className="mt-5 text-display-sm font-semibold text-navy"
            />
            <EditableText
              as="p"
              path="godeGrunner.description"
              value={c.description}
              multiline
              className="mt-6 gw-measure text-ink-muted text-body leading-[1.65]"
            />
            <TextLink href={c.articleLink} className="mt-8">
              <EditableText
                as="span"
                path="godeGrunner.articleLinkLabel"
                value={c.articleLinkLabel}
                className="inline"
              />
            </TextLink>
          </div>

          {testimonials.length > 0 && (
            <div className="lg:col-span-6 lg:col-start-7 border-t border-line">
              {testimonials.map((t, i) => (
                <blockquote key={`${t.author}-${i}`} className="py-7 border-b border-line">
                  <EditableText
                    as="p"
                    path={`godeGrunner.testimonials.${i}.quote`}
                    value={t.quote ? `«${t.quote}»` : ''}
                    className="gw-measure text-ink text-body leading-[1.7]"
                  />
                  <EditableText
                    as="footer"
                    path={`godeGrunner.testimonials.${i}.author`}
                    value={t.author}
                    className="mt-3 block font-ui text-[0.875rem] text-ink-soft"
                  />
                </blockquote>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
