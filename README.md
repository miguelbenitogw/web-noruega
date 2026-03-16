# Global Working Norge - Web

Landing de captación para reclutamiento y formación lingüística.

## Requisitos

- Node.js 20+
- npm 10+

## Configuración

1. Instala dependencias:
   - `npm install`
2. Crea `.env` a partir de `.env.example` y completa claves reales:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`
   - `VITE_GA_MEASUREMENT_ID`

## Scripts

- `npm run dev` - desarrollo
- `npm run lint` - calidad de código
- `npm run build` - build producción
- `npm run preview` - previsualización build

## Operativa mínima antes de publicar

- Build y lint en verde.
- Formulario de contacto enviando correos reales.
- Consentimiento de cookies activo antes de analítica.
- Enlaces de navegación y footer sin placeholders.
- `robots.txt` y `sitemap.xml` coherentes con dominio final.
