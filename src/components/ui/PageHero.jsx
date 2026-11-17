import RichText from './RichText'

/**
 * PageHero — la cabecera navy de las páginas internas.
 *
 * Es la banda que abre trece páginas: migas de pan, titular y bajada sobre
 * navy sólido, y en cuatro de ellas una foto que sale por el borde derecho de
 * la pantalla. Estaba copiada trece veces, y las copias habían derivado en
 * cosas que no significan nada —las migas en `text-sm` o en
 * `text-[0.8125rem]`, el separador en `primary-400`, `primary-300/70` o
 * `primary-200/60`, la bajada a `mt-6` o a `mt-7`— porque cada agente
 * escribió la suya sin ver las otras. Acá hay una sola.
 *
 * Es un componente y no una clase CSS porque lo que se repite es estructura:
 * `<section>` → `<div>` → `<nav>` + `<h1>` + bajada, con una retícula de doce
 * columnas cuando hay foto y sin ella cuando no.
 *
 * Props:
 *  · `trail`      — niveles intermedios de la miga, sin «Hjem» (siempre está)
 *                   ni la página actual. Ej.: Spansk i Alicante → helsenorsk.
 *  · `current`    — la etiqueta de la página en la que estás.
 *  · `title`      — el `<h1>`. `titleId` sirve de `aria-labelledby` de la
 *                   sección, igual que antes.
 *  · `titleWidth` — '18ch' o '20ch', la medida que ya tenía cada titular.
 *  · `description` — la bajada. Admite enlaces en línea y párrafos; el tinte
 *                   de esos enlaces sobre navy es siempre el mismo, así que
 *                   vive acá y no en cada página.
 *  · `media`      — la foto del hero. Si viene, la banda pasa a dos columnas.
 *  · `children`   — lo que cuelgue debajo de la bajada (botones, un segundo
 *                   párrafo). Solo lo usa Spansk i Alicante.
 */

/* Literales a propósito: Tailwind lee el código fuente, así que una clase
   armada con plantilla (`max-w-[${n}]`) no se generaría nunca. */
const TITLE_WIDTHS = {
  '18ch': 'max-w-[18ch]',
  '20ch': 'max-w-[20ch]',
}

const DESCRIPTION_CLASS = 'mt-6 gw-measure text-body lg:text-body-lg leading-[1.6]'

const join = (...values) => values.filter(Boolean).join(' ')

function Breadcrumb({ trail, current }) {
  return (
    <nav className="mb-7" aria-label="Brødsmuler">
      {/* Las migas eran enlaces de 20,7 px de alto: por debajo incluso del
          mínimo de 24 px, y son lo primero que se toca para volver atrás. Con
          `inline-block py-1` suben a 36,7 sin mover el texto de sitio, porque
          el `items-center` de la fila reparte el aire nuevo arriba y abajo. */}
      <ol className="flex flex-wrap items-center gap-2 font-ui text-sm text-primary-300">
        <li>
          <a href="/" className="inline-block py-1 transition-colors hover:text-white">Hjem</a>
        </li>

        {trail.map((step) => (
          <Separator key={step.href}>
            <a href={step.href} className="inline-block py-1 transition-colors hover:text-white">{step.label}</a>
          </Separator>
        ))}

        <Separator>
          <span className="text-white" aria-current="page">{current}</span>
        </Separator>
      </ol>
    </nav>
  )
}

/* La barra y el nivel que introduce. Van juntos porque uno no aparece sin el
   otro: separar la barra en su propio `<li>` suelto era lo que hacía que cada
   copia la tiñera de un color distinto. */
function Separator({ children }) {
  return (
    <>
      <li className="text-primary-400" aria-hidden="true">/</li>
      <li>{children}</li>
    </>
  )
}

export default function PageHero({
  trail = [],
  current,
  title,
  titleId,
  titleWidth,
  description,
  media,
  children,
}) {
  const body = (
    <>
      <Breadcrumb trail={trail} current={current} />

      <h1
        id={titleId}
        className={join(
          media ? 'text-display-sm sm:text-display' : 'text-display',
          'font-semibold !text-white break-words',
          TITLE_WIDTHS[titleWidth],
        )}
      >
        {title}
      </h1>

      {/* Antes había dos ramas (texto plano o con enlaces) que pintaban la
          bajada con distinto `whitespace` según la página. Ahora es una. */}
      <RichText
        value={description}
        className={join(DESCRIPTION_CLASS, 'text-primary-100')}
        tone="dark"
      />

      {children}
    </>
  )

  if (!media) {
    return (
      <section
        className="bg-navy pt-32 pb-16 lg:pt-40 lg:pb-20"
        aria-labelledby={titleId}
      >
        <div className="container-xl">{body}</div>
      </section>
    )
  }

  return (
    <section className="bg-navy overflow-hidden" aria-labelledby={titleId}>
      <div className="container-xl">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-32 pb-16 lg:pt-40 lg:pb-20">
          <div className="lg:col-span-6 animate-riseIn">{body}</div>
          <div className="lg:col-span-6 animate-settle gw-bleed-r">{media}</div>
        </div>
      </div>
    </section>
  )
}
