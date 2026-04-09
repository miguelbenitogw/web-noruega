# Enlaces inline en el admin

Guía corta para editores sobre los enlaces inline que acepta el texto enriquecido del admin.

## Formato permitido

Usá markdown inline con estas formas:

- `[texto](#ancla)`
- `[texto](/ruta)`
- `[texto](/ruta#ancla)`

### Ejemplos válidos

- `Leé más en [Proceso](#spansk-alicante-process)`
- `Volvé a [Archivo](/nyheter#nyheter-arkiv)`
- `Abrí [Contacto](/kontakt#phone)`

## Límites

- No se permiten links externos: `https://...`, `http://...`, `//...`
- No se permiten protocolos peligrosos: `javascript:`, `data:`, `vbscript:`
- Si el destino tiene espacios, saltos de línea o caracteres raros, se rechaza
- Los links de ruta sola (`/ruta`) quedan bloqueados en el preview del admin; el canvas está pensado para navegación interna
- Los links cross-page con ancla (`/ruta#ancla`) sólo se resaltan si la ruta coincide con la vista que está cargada en el preview; si no, no se finge la navegación

## Tips prácticos

- Usá ids reales del contenido: si el bloque destino no tiene `id`, el salto no va a encontrar nada
- Para anclas complejas, mantené el id simple: `spansk-alicante-process`, `nyheter-arkiv`, `contacto`
- Si el link no navega en preview, primero verificá que el `id` exista en la sección publicada
- Probá siempre en modo preview antes de publicar

## Checklist QA manual

1. Editar el texto inline
2. Guardar como draft
3. Publicar el cambio
4. Abrir el preview del admin
5. Clickear el link inline
6. Verificar que el canvas salte a la sección correcta
7. Si es `#ancla`, confirmar que el scroll apunta al bloque esperado
8. Si es `/ruta#ancla`, confirmar que el preview sólo hace scroll cuando la ruta coincide con la vista actual

## Criterio de aceptación

El contenido debe renderizar enlaces internos seguros sin abrir navegación externa desde el preview del admin, y no debe simular saltos cross-page cuando la ruta no coincide.
