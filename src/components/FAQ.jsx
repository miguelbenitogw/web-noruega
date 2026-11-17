import { useState } from 'react'
import useContent from '../hooks/useContent'
import TextLink from './ui/TextLink'
import RichText from './ui/RichText'

/**
 * FAQ
 *
 * Antes cada pregunta era una tarjeta redondeada con borde, tinte azul al
 * abrirse, `shadow-sm` y un círculo gris con un chevron que giraba. Seis
 * tarjetas apiladas con esquinas de 16 px es el acordeón de cualquier plantilla.
 *
 * Ahora es una lista con filetes: las preguntas son pares entre sí, el filete
 * las separa y el signo + / − dice el estado sin pintar la fila.
 *
 * El panel se oculta con `hidden` en vez de `max-h-60`: la respuesta larga ya
 * no se corta a media línea.
 */

function AccordionItem({ faq, index, isOpen, onToggle }) {
  const buttonId = `faq-q-${index}`
  const panelId = `faq-a-${index}`

  return (
    <div className="border-b border-line">
      <h3>
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="group w-full flex items-start justify-between gap-5 py-5 text-left cursor-pointer"
        >
          <span
            className={`font-heading text-body font-semibold leading-snug transition-colors ${
              isOpen ? 'text-primary-600' : 'text-navy group-hover:text-primary-600'
            }`}
          >
            {faq.q}
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 mt-1 text-primary-600 transition-colors"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round"
            >
              <path d="M5 12h14" />
              {!isOpen && <path d="M12 5v14" />}
            </svg>
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
      >
        <RichText
          value={faq.a}
          className="pb-6 pr-8 gw-measure text-ink-muted text-body-sm leading-[1.7]"
        />
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)
  const c = useContent('faq')

  return (
    <section className="py-20 lg:py-28 bg-white" aria-labelledby="faq-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <span className="gw-label text-primary-600">{c.label}</span>
            <h2 id="faq-heading" className="mt-5 text-display-sm font-semibold text-navy">{c.heading}</h2>
            <RichText value={c.description} className="mt-6 text-body text-ink-muted leading-[1.65]" />
            <TextLink href="/kontakt" className="mt-8">
              <span>{c.ctaText}</span>
            </TextLink>
          </div>

          <div className="lg:col-span-7 lg:col-start-6 border-t border-line">
            {(c.items || []).map((faq, i) => (
              <AccordionItem
                key={faq.q || i}
                faq={faq}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
