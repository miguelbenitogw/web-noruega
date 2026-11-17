import useContent from '../hooks/useContent'
import { IMAGES } from '../assets/images'
import RichText from './ui/RichText'
import EmailText from './ui/EmailText'

/**
 * Footer
 *
 * Cambios: el logotipo real en blanco en lugar del nombre escrito a mano
 * (la marca tiene un logo, usémoslo), encabezados de columna en caja normal
 * en lugar de versalitas tracked-out, y los azules de Tailwind por defecto
 * (`blue-200`, `blue-300`) sustituidos por los de la paleta de marca.
 */

const socialIcons = {
  LinkedIn: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  Instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  ),
  YouTube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.3v2c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.6 21.7 12 21.7 12 21.7s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-2C23.3 9.1 23 7 23 7zM9.7 15.5V8.4l8.1 3.6-8.1 3.5z"/>
    </svg>
  ),
}

export default function Footer() {
  const c = useContent('footer')
  const links = c.links || {}

  return (
    <footer className="bg-navy-deep text-white" aria-label="Nettstedets bunntekst">
      <div className="container-xl py-16 lg:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          <div className="sm:col-span-2 lg:col-span-4 lg:pr-10">
            <img
              src={IMAGES.logo}
              alt="Global Working Norge"
              className="h-9 w-auto mb-6"
              width="200"
              height="36"
              loading="lazy"
            />
            <RichText
              value={c.description}
              className="text-primary-200 text-body-sm leading-relaxed gw-measure-sm"
              tone="dark"
            />
            <div className="flex gap-2.5 mt-7">
              {(c.social || []).map((s) => (
                /* 40 px se quedaba en 42,5 reales y no llega al mínimo táctil
                   de 44. El círculo crece dos píxeles por lado: nadie lo nota
                   y el dedo sí. */
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-11 h-11 border border-white/20 rounded-pill flex items-center justify-center
                             text-white/80 hover:text-white hover:border-white/50 transition-colors duration-200"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {socialIcons[s.label]}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title} className="lg:col-span-2">
              <h3 className="font-heading font-semibold text-white text-body-sm mb-4">
                <span>{title}</span>
              </h3>
              {/* Los enlaces del pie medían 21,3 px de alto: la mitad de lo que
                  necesita un dedo. Ahora cada uno es `inline-block` con aire
                  propio, así que el área pulsable es la del enlace y no la de
                  su línea de texto. El `space-y` baja de 2.5 a 1 porque ese
                  aire ya lo pone el enlace: si no, el pie se estiraba. */}
              <ul className="space-y-1" role="list">
                {(items || []).map((item) => {
                  const isFunctionalLink = item.href.startsWith('mailto:') || item.href.startsWith('tel:')
                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="inline-block py-1.5 font-ui text-primary-200 text-[0.875rem] hover:text-white transition-colors duration-200"
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                      >
                        {isFunctionalLink ? <EmailText email={item.label} /> : item.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-7 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 font-ui text-primary-300 text-sm">
          <p>© {new Date().getFullYear()} {c.copyright}</p>
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
            {(c.bottomLinks || []).map((link) => (
              <a key={link.href} href={link.href} className="inline-block py-1.5 hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
