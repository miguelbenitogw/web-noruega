import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { parseTourChapters } from './src/lib/talentTour.js'

// El resumen en texto de la omvisning de /talentportalen sale del HTML del
// propio recorrido. Importarlo con `?raw` metía sus 84 KB enteros (estilos,
// candidatos de ejemplo, animaciones) en el chunk de la página para usar dos
// docenas de frases. Este módulo virtual lo parsea en build y entrega solo los
// capítulos ya extraídos. El prerender usa el mismo parser, así que la página
// hidratada y el HTML estático leen exactamente lo mismo.
const TOUR_ID = 'virtual:talent-tour'
const TOUR_FILE = path.resolve('public/tutorial-talent-portal/index.html')

const talentTour = () => ({
  name: 'talent-tour',
  // Con `filter`, rolldown solo llama a estos hooks para el id virtual y no
  // para cada uno de los cientos de módulos del build.
  resolveId: {
    filter: { id: /^virtual:talent-tour$/ },
    handler: () => `\0${TOUR_ID}`,
  },
  load: {
    filter: { id: /^\0virtual:talent-tour$/ },
    handler() {
      this.addWatchFile(TOUR_FILE)
      return `export default ${JSON.stringify(parseTourChapters(readFileSync(TOUR_FILE, 'utf8')))}`
    },
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), talentTour()],
  build: {
    rollupOptions: {
      output: {
        // Vite 8 uses rolldown — manualChunks must be a FUNCTION, not an object.
        // Split heavy third-party libs into separate, long-cached vendor chunks.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('@phosphor-icons')) return 'vendor-icons'
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'vendor-react'
          return undefined
        },
      },
    },
  },
})
