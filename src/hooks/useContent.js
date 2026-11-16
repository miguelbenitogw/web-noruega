import defaultContent from '../data/siteContent'
import publishedContent from '../data/publishedContent'
import { deepMergeContent } from '../lib/contentMappers.js'

/**
 * Contenido del sitio — todo estático, sin red.
 *
 * Antes esto montaba cuatro capas: los valores por defecto de siteContent.js,
 * un snapshot global que se pedía a Supabase, una capa por página y unos
 * overrides en localStorage del editor visual. Cada visita hacía dos fetch y
 * repintaba cuando llegaban.
 *
 * Al desconectar Supabase, el snapshot publicado se bajó a
 * `src/data/publishedContent.js`, y la capa por página se descartó porque la
 * tabla `content_pages` estaba vacía: nunca llegó a usarse.
 *
 * El merge se hace UNA vez al cargar el módulo, con la misma función que usaba
 * la web, así que el resultado es idéntico a lo que servía producción.
 *
 * Para cambiar un texto: `publishedContent.js` si ya existe ahí, y si no,
 * `siteContent.js`.
 */
const content = deepMergeContent(defaultContent, publishedContent)

export default function useContent(section) {
  if (section) return content[section] ?? defaultContent[section] ?? {}
  return content
}

export { content as siteContent }
