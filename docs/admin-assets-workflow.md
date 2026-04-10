# Admin assets workflow (T3 UI)

## Que deja listo T3

- Bucket Supabase `content-media`.
- Tabla `public.content_assets` para metadata de imagenes.
- Tabla `public.content_asset_usages` para trazabilidad de donde se usa cada asset.
- UI admin para:
  - subir assets con metadata minima
  - navegar libreria con busqueda, filtros y paginacion
  - editar metadata (`alt`, `caption`, `usage`)
  - archivar assets
  - reutilizar assets desde un picker integrado en el editor de contenido
- Policies RLS para que:
  - publico lea solo metadata `active`
  - `admin` / `editor` en `content_editors` gestionen metadata y objetos del bucket

## Flujo operativo T3

1. Subir imagen al bucket `content-media`.
2. Crear/actualizar fila en `content_assets` con:
   - `bucket`
   - `storage_path`
   - `mime_type`, `size_bytes`, `width`, `height`
   - `alt`, `caption`, `usage_type`
   - `status`
3. Registrar consumos en `content_asset_usages` cuando una pagina, noticia o bloque usa la imagen.
4. Consumir en frontend unicamente assets `active`.

### UI disponible en admin

#### 1. `AssetUploader`

- permite elegir archivo
- acepta `alt` opcional
- acepta `usage` opcional
- muestra feedback de estado/progreso/success/error

#### 2. `AssetLibraryPanel`

- busqueda por texto (`alt`, `caption`, `storage_path`, `usage`)
- filtros por `usage` y `status`
- paginacion simple (`page`, `pageSize`)
- edicion inline de metadata (`alt`, `caption`, `usage`)
- archivado soft-delete

#### 3. `AssetPicker`

- abre libreria reutilizable
- permite seleccionar existente o subir uno nuevo
- devuelve `{ assetId, asset }`
- hoy se integra de forma minima en `ContentEntityManager` para `coverImage`

#### 4. Integracion de contenido

- `coverImage` sigue existiendo como URL legacy
- T3 agrega `coverImageAssetId` en la capa UI/admin
- para no ampliar scope del servicio CMS base, el valor se persiste dentro de `content/metadata`
- el preview admin prioriza el asset asociado **solo si** el asset trae una URL resolvible; si no, cae a `coverImage`

## Nota importante

La migracion crea el bucket como **privado** para no romper la regla de "lectura publica solo assets activos" por bypass directo de URL del storage.

Si en una etapa posterior se decide servir imagenes con URL publica/CDN, hay que definir explicitamente una estrategia de publicacion:

- **Opcion A - bucket privado + signed URLs/proxy**  
  Mas seguro, respeta estado `active`/`inactive`, pero agrega logica backend.

- **Opcion B - bucket publico**  
  Mas simple y rapido, pero cualquier URL conocida queda accesible aunque la fila se marque `inactive`.

## Contrato tecnico del servicio T2/T3

El servicio frontend para admin queda pensado alrededor de estas operaciones:

- `uploadAsset(file, metadata)`
  - valida MIME (`image/jpeg`, `image/png`, `image/webp`)
  - valida tamano maximo de 8 MB
  - sanea `alt`, `caption` y `usage`
  - sube primero al bucket y luego crea la fila en `content_assets`
- `listAssets({ search, usageType, status, page, pageSize })`
  - pagina resultados
  - permite filtro por texto, `usage_type` y `status`
- `getAssetById(id)`
  - recupera metadata puntual para edicion o preview
- `updateAssetMeta(id, patch)`
  - modifica solo metadata editable (`alt`, `caption`, `usage_type`, dimensiones y `status` no archivado)
- `archiveAsset(id)`
  - mueve el asset a estado `archived` sin borrar el objeto del storage

## Limitacion conocida de T3

- El bucket sigue siendo privado.
- Si `public_url` viene vacio, la UI puede administrar el asset pero no renderizar preview real del binario.
- Resolver eso bien requiere signed URLs/proxy/CDN y queda para T4 o una etapa posterior.

## Notas utiles

- La UI puede asumir respuestas normalizadas en camelCase (`storagePath`, `mimeType`, `usageType`, etc.).
- El archivado es **soft-delete**. Si despues hace falta borrar binario real, conviene diseñarlo como accion separada y explicita.
