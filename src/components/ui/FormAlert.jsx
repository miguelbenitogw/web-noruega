/**
 * FormAlert — el aviso que corona un formulario.
 *
 * Tres estados (envío fallido, demasiados intentos, campos sin rellenar) × dos
 * formularios = seis copias literales de la misma caja. Son los únicos sitios
 * de la web con colores de fuera de la marca, así que ahora salen de los
 * tokens `danger-*` y `warn-*` en vez de los `red-*` / `amber-*` de Tailwind.
 */

const TONES = {
  danger: 'text-danger-800 bg-danger-50 border-danger-300',
  warn:   'text-warn-900 bg-warn-50 border-warn-300',
}

export default function FormAlert({ tone = 'danger', children }) {
  return (
    <div
      className={`font-ui text-sm border rounded-panel px-4 py-3 ${TONES[tone] || TONES.danger}`}
      role="alert"
    >
      {children}
    </div>
  )
}
