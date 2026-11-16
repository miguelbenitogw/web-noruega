/**
 * FormField — el campo de formulario del sistema.
 *
 * Estaba duplicado literalmente —las tres constantes, la nota de error y el
 * componente— en `Kontakt.jsx` y `KandidatKontakt.jsx`. El comentario que
 * acompañaba a la copia decía que la duplicación era a propósito «porque
 * extraer un componente compartido toca archivos que están en manos de
 * otros». Ya no lo están.
 *
 * Interfaz en Poppins: un campo en serif se lee peor y se opera peor.
 *
 * Los estados de error usan los tokens `danger-*` de la paleta, no los
 * `red-*` de Tailwind: son los mismos valores, pero ahora el sistema tiene
 * dónde decir «esto está mal».
 */

const FIELD_CLASS =
  'w-full font-ui text-body-sm text-ink bg-white rounded-panel border px-4 py-3 '
  + 'placeholder:text-ink-soft/80 outline-none transition-colors'
const FIELD_OK = 'border-line focus:border-primary-600'
const FIELD_ERROR = 'border-danger-500 bg-danger-50/50 focus:border-danger-600'

/* El error se dice con palabras, no solo con un borde rojo: un borde de color
   no le llega a quien no distingue ese color ni a quien usa un lector. */
function FieldNote({ id, children }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 font-ui text-body-xs text-danger-700">
      <svg
        width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" className="shrink-0 mt-[3px]"
      >
        <path d="M12 8v5M12 17h.01" />
        <circle cx="12" cy="12" r="9" strokeWidth="1.75" />
      </svg>
      {children}
    </p>
  )
}

export default function FormField({
  id, name, label, type = 'text', rows,
  required = false, autoComplete, value, onChange, placeholder, error,
}) {
  const errorId = `${id}-error`
  const shared = {
    id,
    name,
    value,
    onChange,
    placeholder,
    required,
    'aria-required': required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: `${FIELD_CLASS} ${error ? FIELD_ERROR : FIELD_OK}${rows ? ' resize-y min-h-[120px]' : ''}`,
  }

  return (
    <div>
      <label htmlFor={id} className="block font-ui text-body-xs font-semibold text-navy mb-2">
        {label}
      </label>
      {rows
        ? <textarea rows={rows} {...shared} />
        : <input type={type} autoComplete={autoComplete} {...shared} />}
      {error && <FieldNote id={errorId}>{error}</FieldNote>}
    </div>
  )
}
