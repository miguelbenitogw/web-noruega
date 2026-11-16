import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'

/**
 * PageEndNav — el pie de página de cada interna.
 *
 * Antes: un cuadrado blanco con el icono de volver, siete pastillas
 * `rounded-xl` con `hover:shadow-sm` y un botón azul con sombra. Tres radios
 * distintos y cuatro superficies para lo que es, en el fondo, una lista de
 * enlaces.
 *
 * Ahora es una banda con un filete arriba: a la izquierda la vuelta, en el
 * medio las secciones como enlaces de texto que se subrayan al pasar, y a la
 * derecha el único botón. La jerarquía la da el peso, no la caja.
 */
export default function PageEndNav({ current }) {
  const nav = useContent('pageEndNav')
  const otherSections = (nav.sections || []).filter(s => s.href !== current)

  return (
    <section className="py-14 lg:py-16 bg-surface border-t border-line">
      <div className="container-xl">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex flex-col gap-7 lg:gap-6">
            <a
              href="/"
              className="group inline-flex items-center gap-2.5 self-start font-ui text-sm font-semibold text-ink hover:text-primary-600 transition-colors"
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {nav.backLabel}
            </a>

            <ul className="flex flex-wrap gap-x-7 gap-y-3" role="list">
              {otherSections.map(s => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    onClick={() => trackEvent('cta_click', { location: 'page_end_nav', cta: s.href })}
                    className="font-ui text-[0.9375rem] text-ink-muted border-b border-transparent pb-0.5
                               hover:text-navy hover:border-navy transition-colors"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/kontakt"
            onClick={() => trackEvent('cta_click', { location: 'page_end_nav', cta: 'kontakt' })}
            className="gw-btn gw-btn-ink self-start shrink-0 lg:self-auto"
          >
            {nav.contactLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
