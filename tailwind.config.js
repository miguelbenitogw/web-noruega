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
        // Neutros fríos
        surface: '#F1F4F9', // fondo de sección alterno
        frost:   '#E7EDF6', // panel plano, sustituye a la tarjeta con sombra
        line:    '#D8E1EE', // filete
        ink: {
          DEFAULT: '#0E1A2B', // tinta entintada de navy
          muted:   '#4A5A70', // texto secundario
          soft:    '#6F7F95', // metadatos
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
        // Cuerpo de lectura. Sin line-height a propósito: hay sitios que
        // acompañan con su propio `leading-*` y un valor aquí se los pisaría.
        // Estaba escrito como `text-[1.0625rem]` por media web.
        body: '1.0625rem',

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
