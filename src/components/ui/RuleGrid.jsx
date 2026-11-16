import { createContext, createElement, useContext } from 'react'

/**
 * RuleGrid — la rejilla con filetes.
 *
 * Es el gesto más repetido del sistema: varias celdas pares entre sí,
 * separadas por una línea de un píxel en vez de por sombras o tarjetas. El
 * problema es que el patrón de filetes DEPENDE del número de columnas, y el
 * número de columnas cambia por breakpoint, así que la receta se escribía a
 * mano en cada sitio:
 *
 *   [&:nth-child(even)]:border-l [&:nth-child(n+3)]:border-t
 *   lg:[&:nth-child(n+2)]:border-l lg:[&:nth-child(n+3)]:border-t-0
 *
 * Eso estaba copiado en ocho archivos, y en dos de ellos con las clases en
 * otro orden —lo que hacía imposible ver de un vistazo si eran iguales (lo
 * eran)—.
 *
 * ¿Por qué un componente y no una clase CSS? Porque `nth-child` no acepta
 * variables: el selector tiene que saber cuántas columnas hay. Una clase
 * `.gw-rule-grid` tendría que elegir un número de columnas para siempre. Acá
 * la escalera de columnas se declara UNA vez y de ella salen las dos cosas que
 * tienen que concordar: el `grid-cols-*` del contenedor y los `nth-child` de
 * las celdas. Si no concuerdan aparecen filetes colgando, que es exactamente
 * el bug que este componente hace imposible.
 *
 * Las clases son literales a propósito: Tailwind lee el código fuente para
 * decidir qué CSS generar, así que una clase construida con plantillas
 * (`grid-cols-${n}`) no se genera nunca. De ahí la tabla.
 *
 *   <RuleGrid cols="sm2-lg4" as="ol" className="mt-12">
 *     {items.map(item => (
 *       <RuleGrid.Cell key={item.id} as="li" className="py-7 sm:px-7">…</RuleGrid.Cell>
 *     ))}
 *   </RuleGrid>
 *
 * El filete de ARRIBA de la rejilla no vive acá: unas veces va en el propio
 * contenedor (`border-t border-line`) y otras en una banda que lo envuelve y
 * cruza toda la pantalla. Se pasa por `className`, como estaba.
 */

/* Cada escalera declara las columnas por breakpoint y los filetes que le
   corresponden. Las variantes con dos columnas asumen que la rejilla tiene
   como máximo dos filas, y las de tres, una sola: es lo que hay en la web y
   lo que había antes clase por clase. */
const LADDERS = {
  // 2 columnas desde móvil, 4 en lg. Tiras de datos (hero, helsesektor).
  'base2-lg4': {
    grid: 'grid grid-cols-2 lg:grid-cols-4',
    cell: '[&:nth-child(even)]:border-l [&:nth-child(n+3)]:border-t '
        + 'lg:[&:nth-child(n+2)]:border-l lg:[&:nth-child(n+3)]:border-t-0',
  },
  // Apiladas en móvil, 2 en sm, 4 en lg. Columnas de servicio y de etapas.
  'sm2-lg4': {
    grid: 'grid sm:grid-cols-2 lg:grid-cols-4',
    cell: '[&:nth-child(n+2)]:border-t sm:[&:nth-child(2)]:border-t-0 '
        + '[&:nth-child(even)]:sm:border-l [&:nth-child(n+3)]:sm:border-t '
        + 'lg:[&:nth-child(n+2)]:border-l lg:[&:nth-child(n+3)]:border-t-0',
  },
  // Apiladas en móvil, 2 en sm.
  'sm2': {
    grid: 'grid sm:grid-cols-2',
    cell: '[&:nth-child(n+2)]:border-t sm:[&:nth-child(2)]:border-t-0 '
        + '[&:nth-child(even)]:sm:border-l',
  },
  // Apiladas en móvil, 2 en md. Dos noticias, que necesitan más ancho.
  'md2': {
    grid: 'grid md:grid-cols-2',
    cell: '[&:nth-child(n+2)]:border-t md:[&:nth-child(n+2)]:border-t-0 '
        + 'md:[&:nth-child(n+2)]:border-l',
  },
  // Apiladas en móvil, 3 en sm.
  'sm3': {
    grid: 'grid sm:grid-cols-3',
    cell: '[&:nth-child(n+2)]:border-t sm:[&:nth-child(n+2)]:border-t-0 '
        + 'sm:[&:nth-child(n+2)]:border-l',
  },
  // 3 columnas desde móvil, en una sola fila. Tira de datos corta.
  'base3': {
    grid: 'grid grid-cols-3',
    cell: '[&:nth-child(n+2)]:border-l',
  },
}

const TONES = {
  light: 'border-line',
  dark: 'border-white/15',
}

const RuleGridContext = createContext(null)

const join = (...values) => values.filter(Boolean).join(' ')

export default function RuleGrid({
  cols,
  tone = 'light',
  as = 'div',
  className = '',
  children,
  ...rest
}) {
  const ladder = LADDERS[cols]

  // Una escalera inexistente es un error de programación, pero no vale un
  // `throw`: la app no tiene error boundary, así que tirar acá apagaría la
  // página entera. Se avisa y se degrada a una pila sin filetes, que al menos
  // se lee.
  if (!ladder && import.meta.env.DEV) {
    console.error(
      `RuleGrid: escalera de columnas desconocida "${cols}". `
      + `Las que hay: ${Object.keys(LADDERS).join(', ')}.`,
    )
  }

  return (
    <RuleGridContext.Provider
      value={{ cell: ladder?.cell || '', tone: TONES[tone] || TONES.light }}
    >
      {createElement(
        as,
        { className: join(ladder?.grid, className), ...rest },
        children,
      )}
    </RuleGridContext.Provider>
  )
}

/**
 * Celda de la rejilla. Coge los filetes del contenedor por contexto —y no por
 * `cloneElement`— porque las celdas casi nunca son hijas directas: suelen
 * venir envueltas en su propio componente (`<Stat>`, `<ServiceColumn>`…).
 *
 * El relleno y el color del texto siguen siendo cosa del sitio que la usa: lo
 * único que aporta la celda es el filete que la separa de sus pares.
 */
function Cell({ as = 'div', className = '', children, ...rest }) {
  const context = useContext(RuleGridContext)

  if (!context && import.meta.env.DEV) {
    console.error('RuleGrid.Cell tiene que estar dentro de un <RuleGrid>.')
  }

  return createElement(
    as,
    { className: join(context?.tone, context?.cell, className), ...rest },
    children,
  )
}

RuleGrid.Cell = Cell
