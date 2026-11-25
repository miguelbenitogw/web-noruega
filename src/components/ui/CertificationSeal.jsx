/**
 * Sello de certificación ISO 9001 de TÜV NORD, siempre junto al nombre de la
 * empresa certificada.
 *
 * Las reglas de uso de TÜV NORD CERT (procedimiento E03VA01, en el Nextcloud de
 * Global Working) piden que en la web la marca aparezca «siempre asociada con
 * el nombre de la empresa certificada (el que figura en su certificado) de
 * manera que forme con aquel un solo conjunto gráfico». Por eso el sello no se
 * exporta suelto: este componente es la única forma de ponerlo.
 *
 * Ojo con el nombre: el certificado es de Global Working Recruitment S.L. (la
 * empresa española), no de Global Working Norway AS. Tampoco se puede usar el
 * logo de la organización ISO: ISO escribe la norma pero no certifica, y no
 * deja a las empresas certificadas usar su logo.
 *
 * Datos del certificado CERT_9001_NOR.pdf: nº 4410015510134, válido del
 * 06/02/2025 al 07/01/2028. Al renovarse hay que actualizar número y fecha
 * aquí, en src/lib/seo.js, en scripts/prerender-meta.mjs y en public/llms.txt.
 *
 * El sello no se modifica (regla de TÜV NORD): solo se elige la variante
 * oficial según el fondo. La blanca para fondos oscuros, la normal para claros.
 */
const SEALS = {
  white: {
    src: '/assets/media/tuv-nord-iso9001-white-160.webp',
    srcSet: '/assets/media/tuv-nord-iso9001-white-160.webp 160w, /assets/media/tuv-nord-iso9001-white-320.webp 320w',
  },
  regular: {
    src: '/assets/media/tuv-nord-iso9001-regular-160.webp',
    srcSet: '/assets/media/tuv-nord-iso9001-regular-160.webp 160w, /assets/media/tuv-nord-iso9001-regular-320.webp 284w',
  },
}

const TONES = {
  dark: { seal: 'white', name: 'text-white', meta: 'text-primary-200' },
  light: { seal: 'regular', name: 'text-navy', meta: 'text-ink-soft' },
}

export default function CertificationSeal({ tone = 'dark', className = '' }) {
  const t = TONES[tone] || TONES.dark
  const s = SEALS[t.seal]

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <img
        src={s.src}
        srcSet={s.srcSet}
        sizes="64px"
        width={64}
        height={64}
        alt="TÜV NORD CERT – ISO 9001"
        className="w-16 h-16 shrink-0"
        loading="lazy"
        decoding="async"
      />
      <p className="font-ui text-body-xs leading-snug">
        <span className={`block font-semibold ${t.name}`}>Global Working Recruitment S.L.</span>
        <span className={`block ${t.meta}`}>ISO 9001:2015-sertifisert av TÜV NORD CERT</span>
        <span className={`block ${t.meta} tabular-nums`}>Sertifikat nr. 4410015510134</span>
      </p>
    </div>
  )
}
