import { createElement } from 'react'

/**
 * TextLink — el enlace de texto con flecha.
 *
 * Es el enlace secundario de todo el sistema: donde un botón sería demasiado
 * peso, va este. No es el círculo naranja con flecha de las tarjetas de
 * empleo: ése es otro gesto y tiene su propia clase en `index.css`.
 *
 * Estaba escrito a mano en doce sitios, y cada copia había derivado en cuatro
 * ejes a la vez: el tamaño (`text-sm` en siete, `text-[0.9375rem]` en cinco),
 * el tinte al pasar el ratón (`hover:text-navy` en cinco, `primary-700` en
 * cinco, ninguno en dos), el tamaño de la flecha (15 px en diez, 16 en dos) y
 * si la flecha se desplazaba o no. Ninguna de esas diferencias quería decir
 * nada: son cuatro agentes eligiendo distinto a ciegas. Acá hay una sola voz.
 *
 * El tamaño es `text-sm` y no `text-body-sm` por una razón concreta: era el de
 * siete de los doce sitios, así que así hay cinco enlaces que cambian de
 * tamaño en vez de siete. Y `text-sm` trae su propio `line-height`, que es lo
 * que mantiene la altura compacta que el enlace tenía donde más se usa.
 *
 * Los dos `group-hover` son deliberados y hacen que el mismo componente valga
 * para los dos usos que tiene:
 *
 *  · suelto — lleva su propio `group`, así que se tiñe y la flecha avanza al
 *    pasar el ratón por encima de él;
 *  · dentro de una tarjeta que ya es `group` —el «Les mer» de una columna de
 *    servicio, por ejemplo— reacciona al pasar el ratón por la tarjeta
 *    entera, porque `group-hover:` busca un ancestro con `.group`.
 *
 * Por eso no hace falta ninguna prop para distinguirlos.
 *
 * `as="span"` es para cuando vive dentro de un `<a>`: un enlace no puede
 * contener otro enlace.
 */
export default function TextLink({
  as = 'a',
  className = '',
  children,
  ...rest
}) {
  return createElement(
    as,
    {
      className: 'group inline-flex items-center gap-2 font-ui text-sm font-semibold '
        + 'text-primary-600 transition-colors hover:text-primary-700 '
        + `group-hover:text-primary-700 ${className}`,
      ...rest,
    },
    children,
    <svg
      key="arrow"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>,
  )
}
