import { IMAGES, img } from '../assets/images'
import useContent from '../hooks/useContent'
import TextLink from './ui/TextLink'
import RichText from './ui/RichText'

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
        <img
          src={img(c.imageUrl || IMAGES.rekruttering, 1600)}
          alt={c.imageAlt || 'Global Working samarbeid med norske kommuner'}
          className="w-full h-[240px] sm:h-[320px] lg:h-[400px] object-cover object-center rounded-panel"
          loading="lazy"
          width="1280"
          height="400"
          decoding="async"
        />

        <div className="mt-12 lg:mt-16 grid lg:grid-cols-12 gap-10 lg:gap-16">

          <div className="lg:col-span-5">
            <span className="gw-label text-primary-600">{c.label}</span>
            <h2 id="gode-grunner-heading" className="mt-5 text-display-sm font-semibold text-navy">
              {c.heading}
            </h2>
            <RichText
              value={c.description}
              className="mt-6 gw-measure text-ink-muted text-body leading-[1.65]"
            />
            <TextLink href={c.articleLink} className="mt-8">
              <span>{c.articleLinkLabel}</span>
            </TextLink>
          </div>

          {testimonials.length > 0 && (
            <div className="lg:col-span-6 lg:col-start-7 border-t border-line">
              {testimonials.map((t, i) => (
                <blockquote key={`${t.author}-${i}`} className="py-7 border-b border-line">
                  <p className="gw-measure text-ink text-body leading-[1.7]">
                    {t.quote ? `«${t.quote}»` : ''}
                  </p>
                  <footer className="mt-3 block font-ui text-[0.875rem] text-ink-soft">{t.author}</footer>
                </blockquote>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
