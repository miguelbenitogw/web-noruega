import { IMAGES, img, srcSet } from '../assets/images'
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
        {/* La banda es ahora el equipo delante de la sede. Con 400 px de alto
            el recorte panorámico cortaba las cabezas de la fila de pie; con
            460 y el foco al 66 % vertical entra el grupo entero y el edificio
            queda de fondo. El pie la convierte en prueba: es nuestra gente. */}
        <figure>
          <img
            src={img(c.imageUrl || IMAGES.equipoSede, 1440)}
            srcSet={srcSet(c.imageUrl || IMAGES.equipoSede)}
            sizes="(min-width: 1280px) 1216px, 100vw"
            alt={c.imageAlt || 'Ansatte i Global Working foran hovedkontoret i Alicante'}
            className="gw-photo w-full h-[260px] sm:h-[340px] lg:h-[460px] object-[50%_66%]"
            loading="lazy"
            width="1280"
            height="460"
            decoding="async"
          />
          <figcaption className="gw-caption">Teamet foran hovedkontoret vårt i Alicante.</figcaption>
        </figure>

        <div className="mt-12 lg:mt-16 grid lg:grid-cols-12 gap-10 lg:gap-16">

          <div className="lg:col-span-5">
            <span className="gw-label text-primary-600">{c.label}</span>
            <h2 id="gode-grunner-heading" className="mt-5 text-display-sm font-semibold text-navy">
              {c.heading}
            </h2>
            <RichText
              value={c.description}
              className="mt-6 gw-measure gw-lede"
            />
            <TextLink href={c.articleLink} className="mt-8">
              <span>{c.articleLinkLabel}</span>
            </TextLink>
          </div>

          {testimonials.length > 0 && (
            <div className="lg:col-span-6 lg:col-start-7 border-t border-line">
              {testimonials.map((t, i) => (
                // Las citas de los kommuner son la prueba más fuerte de la
                // página: pasan a cuerpo de entradilla y la firma sube a navy
                // semibold, porque el nombre del kommune ES el dato.
                <blockquote key={`${t.author}-${i}`} className="py-8 border-b border-line">
                  <p className="gw-measure text-ink text-body-lg leading-[1.5]">
                    {t.quote ? `«${t.quote}»` : ''}
                  </p>
                  <footer className="mt-4 block font-ui text-body-xs font-semibold text-navy">{t.author}</footer>
                </blockquote>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
