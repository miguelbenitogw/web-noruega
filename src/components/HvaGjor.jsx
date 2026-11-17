import { GraduationCap, ShieldCheck, UsersThree } from '@phosphor-icons/react'
import { img } from '../assets/images'
import useContent from '../hooks/useContent'
import RichText from './ui/RichText'

const serviceIcons = [
  <UsersThree key="i1" size={24} weight="regular" aria-hidden="true" />,
  <GraduationCap key="i2" size={24} weight="regular" aria-hidden="true" />,
  <ShieldCheck key="i3" size={24} weight="regular" aria-hidden="true" />,
]

/**
 * HvaGjor — qué hace Global Working.
 *
 * Antes: dos manchas radiales de 600 px con `blur-3xl`, cabecera centrada,
 * tres tarjetas `rounded-[2rem]` con `shadow-sm hover:shadow-2xl`, un número
 * gigante en `text-primary-50` que no se leía, un icono naranja por tarjeta
 * (tres naranjas en una pantalla) y un botón con `shadow-xl` y `active:scale-95`.
 * Todo eso viene de fábrica en cualquier landing generada.
 *
 * Ahora es un bloque editorial asimétrico: a la izquierda la cabecera y la
 * única acción, a la derecha los tres servicios como filas separadas por
 * filetes. La jerarquía la da el tono y el filete, no la altura.
 */
export default function HvaGjor() {
  const c = useContent('hvaGjor')

  return (
    <section
      id="hvagjor"
      className="scroll-mt-28 py-20 lg:py-28 bg-white"
      aria-labelledby="hvagjor-heading"
    >
      <div className="container-xl">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">

          <div className="lg:col-span-5">
            <span className="gw-label text-primary-600">{c.label}</span>
            <h2 id="hvagjor-heading" className="mt-5 text-display-sm font-semibold text-navy">{c.heading}</h2>
            <RichText
              value={c.description}
              className="mt-6 gw-measure text-ink-muted text-body leading-[1.65]"
            />

            <a href="/kontakt" className="gw-btn gw-btn-ember mt-9">
              <span>{c.ctaLabel}</span>
              <svg
                width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>

            {c.ctaNote && (
              <p className="mt-4 font-ui text-[0.875rem] text-ink-soft">{c.ctaNote}</p>
            )}
          </div>

          <div className="lg:col-span-6 lg:col-start-7 border-t border-line">
            {(c.services || []).map((s, i) => (
              <div key={s.title} className="flex gap-5 py-8 border-b border-line">
                <span className="text-primary-600 shrink-0 mt-1" aria-hidden="true">
                  {serviceIcons[i] || serviceIcons[0]}
                </span>
                <div className="min-w-0">
                  <h3 className="font-heading text-body-lg font-semibold text-navy leading-snug">
                    {s.title}
                  </h3>
                  <RichText
                    value={s.description}
                    className="mt-2.5 gw-measure text-ink-muted text-body leading-[1.65]"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>

        {c.sectionImageUrl && (
          <img
            src={img(c.sectionImageUrl, 1536)}
            alt={c.sectionImageAlt || ''}
            className="mt-16 lg:mt-20 w-full h-[260px] sm:h-[360px] lg:h-[460px] object-cover rounded-panel"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    </section>
  )
}
