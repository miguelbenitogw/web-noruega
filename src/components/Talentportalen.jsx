import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import EditableText from './editable/EditableText'
import RuleGrid from './ui/RuleGrid'

/**
 * Talentportalen — qué es el portal y qué se hace dentro.
 *
 * Antes esta sección era media pantalla de maqueta falsa: una ventana de
 * navegador dibujada con tres puntitos de semáforo, una URL que ya no es la
 * del portal (`...lovable.app`), una barra de progreso al 76 % que no mide
 * nada y cuatro cajitas de datos inventados en cuatro colores distintos.
 *
 * Dos razones para quitarla. La primera: arriba, en la sección «Omvisning»,
 * el empleador ya puede recorrer el portal DE VERDAD en un iframe; una
 * maqueta de mentira justo debajo de la cosa real resta credibilidad. La
 * segunda: datos inventados en una página que vende confianza.
 *
 * Queda lo que el lector necesita: qué es, qué puede hacer, y entrar.
 */

const benefitIcons = [
  <svg key="b1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
  </svg>,
  <svg key="b2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>,
  <svg key="b3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>,
  <svg key="b4" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>,
]

export default function Talentportalen() {
  const c = useContent('talentportalenComp')
  const benefits = c.benefits || []

  return (
    <section
      id="talentportalen"
      className="scroll-mt-28 py-20 lg:py-28 bg-surface"
      aria-labelledby="talentportalen-heading"
    >
      <div className="container-xl">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* ── Qué es y cómo se entra ───────────────────────────────────
              La acción principal de toda la página es entrar al portal, así
              que el naranja vive acá y en ningún otro sitio de la pantalla. */}
          <div className="lg:col-span-5">
            <EditableText
              as="span"
              path="talentportalenComp.label"
              value={c.label}
              className="gw-label text-primary-600"
            />
            <EditableText
              as="h2"
              id="talentportalen-heading"
              path="talentportalenComp.heading"
              value={c.heading}
              className="mt-5 text-display-sm font-semibold text-navy"
            />
            <EditableText
              as="p"
              path="talentportalenComp.description"
              value={c.description}
              multiline
              className="mt-6 gw-measure text-body text-ink-muted leading-[1.7]"
            />

            <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
              <a
                href={c.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('cta_click', { location: 'talentportalen', cta: 'logg_inn' })}
                className="gw-btn gw-btn-ember"
              >
                <EditableText
                  as="span"
                  path="talentportalenComp.ctaLogin"
                  value={c.ctaLogin}
                  className="inline"
                />
              </a>
              <a
                href="/kontakt"
                onClick={() => trackEvent('cta_click', { location: 'talentportalen', cta: 'kontakt_oss' })}
                className="gw-btn gw-btn-line"
              >
                <EditableText
                  as="span"
                  path="talentportalenComp.ctaContact"
                  value={c.ctaContact}
                  className="inline"
                />
              </a>
            </div>
          </div>

          {/* ── Qué se puede hacer dentro ────────────────────────────────
              Cuatro capacidades en paralelo —no una secuencia, así que acá
              no hay números—, separadas por filetes en vez de por cuatro
              tarjetas iguales con sombra. */}
          {benefits.length > 0 && (
            <RuleGrid
              cols="sm2"
              as="ul"
              role="list"
              className="lg:col-span-6 lg:col-start-7 border-t border-line"
            >
              {benefits.map((b, i) => (
                <RuleGrid.Cell
                  as="li"
                  key={b.title || i}
                  className="py-7 sm:px-7 sm:odd:pl-0"
                >
                  <span className="block text-primary-600" aria-hidden="true">
                    {benefitIcons[i] || benefitIcons[0]}
                  </span>
                  <EditableText
                    as="h3"
                    path={`talentportalenComp.benefits.${i}.title`}
                    value={b.title}
                    className="mt-4 font-heading text-body font-semibold text-navy leading-snug"
                  />
                  <EditableText
                    as="p"
                    path={`talentportalenComp.benefits.${i}.desc`}
                    value={b.desc}
                    multiline
                    className="mt-2 text-body-sm text-ink-muted leading-relaxed"
                  />
                </RuleGrid.Cell>
              ))}
            </RuleGrid>
          )}

        </div>
      </div>
    </section>
  )
}
