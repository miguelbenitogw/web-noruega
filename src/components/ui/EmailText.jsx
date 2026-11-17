/**
 * EmailText — una dirección de correo que puede partirse sin romperse.
 *
 * Los correos del equipo («miriam.svendsen@globalworking.net») no tienen
 * espacios, así que el navegador no encuentra dónde cortar y la línea se sale
 * de su caja: en el pie medía 274 px en una columna de 187, y en las fichas de
 * /kontakt 256 en 186. Pasaba en tres sitios, con tres arreglos a medias
 * (`break-words` dentro de un flex no hace nada, porque el texto es un ítem
 * flex con `min-width: auto`).
 *
 * El `<wbr>` después de la arroba es el corte bueno: nombre en una línea,
 * dominio en la otra. `overflow-wrap:anywhere` queda de red por si una mitad
 * sola tampoco cabe, y `min-w-0` deja que el span encoja dentro de un flex.
 * Solo es presentación: el texto que se copia sigue siendo el correo entero.
 */
export default function EmailText({ email = '' }) {
  const at = email.indexOf('@')
  if (at < 0) return email

  return (
    <span className="min-w-0 [overflow-wrap:anywhere]">
      {email.slice(0, at + 1)}
      <wbr />
      {email.slice(at + 1)}
    </span>
  )
}
