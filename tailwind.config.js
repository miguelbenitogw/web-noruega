/** @type {import('tailwindcss').Config} */

/**
 * Sistema de diseño — Global Working Norge
 *
 * Concepto: «To kyster». La marca vive entre dos orillas (Alicante ↔ Noruega),
 * y la paleta lo refleja: un azul profundo nórdico como campo dominante y un
 * único acento cálido — el naranja de marca — reservado para la acción
 * principal. Nada más compite con él.
 *
 * Reglas del sistema:
 *  · `cta` (ember) se usa UNA vez por pantalla. Si aparece dos veces, una sobra.
 *  · `surface` y `frost` son grises fríos, nunca el slate-50 por defecto.
 *  · `ink` está entintado de navy: el negro puro no existe en esta marca.
 *  · Los filetes (`line`) separan; las sombras casi no se usan.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul de marca — Global Working Blue / Navy
        primary: {
          DEFAULT: '#1E73BE',
          50:  '#EFF4FB',
          100: '#DCE8F6',
          200: '#BCD3EC',
          300: '#8FB6E0',
          400: '#5E96D2',
          500: '#3B82F6',
          600: '#1E73BE', // Global Working Blue
          700: '#15559E',
          800: '#0A3A82',
          900: '#062A6A', // Global Working Navy
        },
        // Acento cálido — una sola aparición por pantalla
        cta: {
          DEFAULT: '#DB532E', // Global Working Orange
          500: '#E8714F',
          600: '#B9411F',
        },
        navy: {
          DEFAULT: '#062A6A',
          deep: '#041E4D', // fondo de pie de página y bandas profundas
        },
        // Estados de validación. Son los ÚNICOS colores no-marca de la
        // pantalla, y hasta ahora se escribían como `red-*` / `amber-*` de
        // Tailwind directamente en los formularios: el sistema no tenía dónde
        // decir «esto está mal». Los valores son los mismos de Tailwind, así
        // que nada cambia de aspecto; lo que cambia es que ahora se pueden
        // reteñir desde acá sin recorrer los dos formularios.
        // Solo los tonos que la interfaz usa de verdad: una paleta completa
        // de once pasos para tres avisos sería inventario muerto.
        danger: {
          50:  '#FEF2F2', // fondo de aviso y del campo en error
          300: '#FCA5A5', // filete del aviso
          500: '#EF4444', // borde del campo en error
          600: '#DC2626', // borde del campo en error, con foco
          700: '#B91C1C', // texto de la nota bajo el campo
          800: '#991B1B', // texto del aviso
        },
        warn: {
          50:  '#FFFBEB',
          300: '#FCD34D',
          900: '#78350F',
        },
        // Neutros fríos
        surface: '#F1F4F9', // fondo de sección alterno
        frost:   '#E7EDF6', // panel plano, sustituye a la tarjeta con sombra
        line:    '#D8E1EE', // filete
        ink: {
          DEFAULT: '#0E1A2B', // tinta entintada de navy
          muted:   '#4A5A70', // texto secundario
          // Metadatos. Era #6F7F95 y no llegaba a AA en NINGÚN fondo donde se
          // usa de verdad: 4,08:1 sobre blanco y 3,70:1 sobre `surface`, con
          // 4,5:1 exigido. Y no es un color de marca que haya que respetar: es
          // el gris de la fecha y el cargo, el dato que acompaña. Se entinta
          // dos pasos más oscuro manteniendo el mismo tiro de azul —sigue
          // leyéndose como el tono apagado de la familia, no como otro color—
          // y pasa en los dos fondos: 5,17:1 y 4,69:1.
          soft:    '#5E6E88', // metadatos
        },
      },
      fontFamily: {
        // Display geométrico de marca
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        // Serif editorial para texto de lectura
        body: ['Newsreader', 'Georgia', 'serif'],
        // Interfaz: botones, navegación, etiquetas, datos
        ui: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // ── Escala de cuerpo e interfaz ───────────────────────────────────
        // Ninguna lleva line-height a propósito: hay sitios que acompañan con
        // su propio `leading-*` y un valor aquí se los pisaría.
        //
        // `body` ya existía porque estaba escrito como `text-[1.0625rem]` por
        // media web. Los otros tres tenían exactamente el mismo problema y
        // seguían sueltos: 22 `text-[1.1875rem]`, 34 `text-[0.9375rem]` y 31
        // `text-[0.8125rem]` repartidos por casi todos los archivos.
        'body-lg': '1.1875rem', // bajada de hero y entradilla
        body:      '1.0625rem', // cuerpo de lectura
        'body-sm': '0.9375rem', // interfaz: campos, botones, listas de filete
        'body-xs': '0.8125rem', // metadatos, roles, migas de pan

        // Escala de display con tracking ya calibrado
        'display-sm': ['clamp(2rem, 4vw, 2.75rem)',   { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display':    ['clamp(2.5rem, 5.5vw, 4rem)',  { lineHeight: '1.04', letterSpacing: '-0.032em' }],
        'display-lg': ['clamp(2.75rem, 5.2vw, 4.5rem)', { lineHeight: '1.0', letterSpacing: '-0.04em' }],
      },
      maxWidth: {
        '8xl': '88rem',
        'measure': '38rem',    // ~66 caracteres en serif
        'measure-sm': '30rem', // deck corto
      },
      borderRadius: {
        // Dos radios, no cinco. Pastilla para acción, caja suave para superficie.
        'pill': '999px',
        'panel': '14px',
      },
      transitionTimingFunction: {
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        riseIn: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        settle: {
          from: { opacity: '0', transform: 'translateY(26px) scale(0.985)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        riseIn: 'riseIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        settle: 'settle 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
