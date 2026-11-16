import { useState } from 'react'
import useContent from '../hooks/useContent'
import EditableText from './editable/EditableText'
import InlineRichText from './editable/InlineRichText'

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

function AccordionItem({ faq, index, basePath, isOpen, onToggle }) {
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
          <EditableText
            as="span"
            path={`${basePath}.${index}.q`}
            value={faq.q}
            className={`font-heading text-body font-semibold leading-snug transition-colors ${
              isOpen ? 'text-primary-600' : 'text-navy group-hover:text-primary-600'
            }`}
          />
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
        <InlineEditableParagraph
          as="p"
          path={`${basePath}.${index}.a`}
          value={faq.a}
          className="pb-6 pr-8 gw-measure !text-ink-muted text-[0.9375rem] !leading-[1.7]"
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
            <EditableText
              as="span"
              path="faq.label"
              value={c.label}
              className="gw-label text-primary-600"
            />
            <EditableText
              as="h2"
              id="faq-heading"
              path="faq.heading"
              value={c.heading}
              className="mt-5 text-display-sm font-semibold text-navy"
            />
            <InlineEditableParagraph
              as="p"
              path="faq.description"
              value={c.description}
              className="mt-6 !text-ink-muted !leading-[1.65]"
            />
            <a
              href="/kontakt"
              className="group mt-8 inline-flex items-center gap-2 font-ui text-[0.9375rem] font-semibold text-primary-600 transition-colors hover:text-navy"
            >
              <EditableText as="span" path="faq.ctaText" value={c.ctaText} className="inline" />
              <svg
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="lg:col-span-7 lg:col-start-6 border-t border-line">
            {(c.items || []).map((faq, i) => (
              <AccordionItem
                key={faq.q || i}
                faq={faq}
                index={i}
                basePath="faq.items"
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
