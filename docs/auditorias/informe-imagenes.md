# Auditoría de calidad de imagen — Global Working Norge

Fecha: 2026-11-17. Medido con `sharp` sobre los ficheros reales (descargados a disco los remotos), no sobre las extensiones.
Convención de nitidez: **k = píxeles intrínsecos / píxeles CSS en el eje limitante del `object-cover`**. Retina nítida exige **k >= 2**. **k < 1** = se escala hacia arriba aunque el monitor sea 1x.
Anchos CSS: viewport 1440 y 1920 (contenedor `max-w-7xl` = 1216 útiles, columnas `lg:gap-16`, `.gw-bleed-*` suma `(vw-1280)/2 + 32` px) y móvil 390 (350 útiles).

Cifras: KB = 1024 bytes, redondeadas; "MB" aproximados.

## 0. Correcciones a lo que se asumía

| Se asumía | Realidad medida |
|---|---|
| 47 entradas en `images.js` | **33** (2 logos + 6 locales + 18 Supabase + 7 externas Squarespace/globalworking.net) |
| `img()` concatena un parámetro que el servidor ignora | **Ya no.** Hoy `img()` solo reescribe URLs de 6 imágenes a variantes locales; para el resto devuelve la URL tal cual. Y el servidor sí ignora el parámetro (ver sección 3). |
| 18 imágenes dependen de Supabase | Esas 18 son el catálogo. Lo que el sitio **pinta de verdad** viene de `publishedContent.js` y de `src/content/news/*.md`, que mandan sobre el catálogo: eran **28 ficheros distintos** en Supabase (15 del catálogo + 13 fuera del catálogo), de los que 3 del catálogo estaban muertos. |
| Las 6 variantes locales están bien | **Tres salían de costado** (giradas 90 grados). Ver hallazgo A. |

## A. Hallazgo crítico: variantes locales giradas 90 grados

`scripts/optimize-images.mjs` hace `sharp(src).resize().webp()` **sin `.rotate()`**. Las 7 fotos de móvil del repo traen EXIF `orientation=6` (4032x3024 que se muestran como 3024x4032 vertical). `sharp` descarta el EXIF al convertir y deja el píxel crudo girado.

Afectadas (ya commiteadas, en producción):

| Fichero servido | Dónde se ve | Estado |
|---|---|---|
| `alicante-promenade-{320,640,1440,1920}.webp` | mosaico del hero de la Home (`Hero.jsx:151`), `SpanskAlicantePage.jsx:105` (publishedContent apunta a `alicante-promenade-640.webp`) | de costado |
| `helse-health-team-{320,640,1440}.webp` | mosaico del hero de la Home (`Hero.jsx:142`) | de costado |
| `alicante-hero-sunset-{640,1024,1600}.webp` | solo fallback del teaser | de costado |

Corregido en `public/assets/media/`: nuevas variantes `*-v2-<ancho>.webp` con `.rotate()`, y `images.js` apunta a ellas. **El sufijo `-v2` es obligatorio**: `vercel.json` sirve `/assets/` con `immutable` un año; sobrescribir el mismo nombre dejaría el girado a quien ya lo vio.

**Riesgo vivo:** `npm run build` ejecuta `prebuild` -> `optimize-images.mjs`, que no tiene `.rotate()` y cuyos slugs siguen siendo los viejos. Cada build vuelve a escribir 10 ficheros viejos (girados, sin referencia) en `public/assets/media/`. No rompen nada porque ya nadie los referencia, pero viajan en el deploy. Parche P0 abajo.

## 1. Inventario del catálogo (33 entradas)

`fmt` = magic bytes. Dims = tamaño de **visualización** (EXIF aplicado). "Antes" = lo que servía.

| # | Clave | fmt real | Dims | Bytes | Dónde se usa (fichero:línea) -> caja CSS lg | Atributos | Alt | Veredicto |
|---|---|---|---|---|---|---|---|---|
| 1 | logo | WEBP | 1000x262 | 10 KB | Navbar.jsx:166 (h-8/h-10 -> 122-153 px), Footer.jsx:45 (137 px) | w/h = 200x36 (ratio 5,56; real 3,82) | "Global Working Norge" (ok en logo) | SIN SALVAGUARDAS: w/h con ratio falso (salto de ancho al cargar). Nav eager, footer lazy: bien |
| 2 | logoColor | PNG | 1000x262 | 22 KB (webp: 17) | Navbar.jsx:166 (al hacer scroll) | idem | ok | FORMATO MALO menor (-5 KB) |
| 3 | teamHero | WEBP (var.) | 1600x1065 | 266 KB (orig. JPEG 3088x2056 3,0 MB) | Hero.jsx:123 caja 309x480 (+ OmOssPage retrato 4) | srcSet+sizes+w/h+eager+fetchpriority+preload: todo correcto | descriptivo | OK (k 4,3) |
| 4 | homeMetricsTeam | JPEG or=6 | 3024x4032 | 3,35 MB | solo fallback de `homeHealth.imageUrl` (siteContent.js:45); publishedContent lo pisa | - | - | SOBREDIMENSIONADA; ahora local |
| 5 | ceoPhoto | WEBP alpha | **300x400** | 17 KB | OmOssPage.jsx:48/54 retrato 286x357 (móvil 165x206) | sin w/h (aspect-[4/5] ok), lazy | "Pablo Santamarina" (solo nombre) | **INSUFICIENTE** k=1,05 |
| 6 | teamGroup | WEBP | 1920x1278 | 285 KB | OmOss.jsx:137 (576x460); RekrutteringPage.jsx:99 (publishedContent) | srcSet+sizes en OmOss; RekrutteringPage sin | "Global Working-teamet" ok; en Rekruttering: "rekrutteringsmodell" sobre una foto de grupo (no describe) | OK k=2,8 |
| 7 | contactMiriam | JPEG | 2056x3088 | **1,73 MB** | avatares 64 px (Kontakt.jsx:214, HomePage.jsx:264), 48 px (Livet:271, Helsenorsk:228), retrato OmOssPage.jsx:54 | w/h solo en 64 px; lazy ok | "Miriam Svendsen" ok | **SOBREDIMENSIONADA** 32x para 64 px |
| 8 | contactGro | JPEG | 1152x2048 | 707 KB | idem | idem | "Gro Anette" ok | **SOBREDIMENSIONADA** 18x |
| 9 | alicanteOffice | WEBP | 2560x1704 | 96 KB | Kontakt.jsx:265 (470x256), OmOssPage.jsx:231 (688/928x500) | sin w/h (alto CSS fijo: sin CLS), lazy ok | descriptivo | OK k>=2,8 |
| 10 | oficina | WEBP | 1024x768 | 143 KB | OmOss.jsx:150 (230x160) | w/h, lazy | descriptivo | OK |
| 11 | spanskAlicanteHeroSunset | WEBP (var.) | 1600x1200 **girada** | 118 KB | fallback de SpanskAlicanteTeaser.jsx:31 | - | - | **GIRADA** (corregida en v2) |
| 12 | spanskAlicanteBeachPalms | JPEG or=6 | 3024x4032 | 3,18 MB | solo fallback (Livet:46/228, SpanskAlicantePage:42); publishedContent lo pisa | - | - | SOBREDIMENSIONADA, efectivamente sin uso |
| 13 | spanskAlicantePromenade | WEBP (var.) | 1440x1080 **girada** | 152 KB | Hero.jsx:151 (148 px mosaico), SpanskAlicantePage.jsx:105 (688/928x520) | mosaico: lazy sin w/h, alt="" aria-hidden (correcto) | "Sosial hverdag og samtaler" ok | **GIRADA** (corregida en v2) |
| 14 | spanskAlicanteCityView | JPEG or=6 | 3024x4032 | **3,30 MB** | SpanskAlicantePage.jsx:296 (688/928x560) via `img(..,1400)` | w/h, lazy ok, sin srcSet | "Byliv og utsikt" ok | **SOBREDIMENSIONADA** k=4,4 -> servía 3,3 MB; ahora 276 KB |
| 15 | spanskAlicanteCastleArch | JPEG or=6 | 3024x4032 | **4,87 MB** | fallback SpanskAlicanteHvorforPage.jsx:43; publishedContent lo pisa | - | alt "Historisk arkitektur" sobre una foto de **estudiantes en una escalera** | sin uso real |
| 16 | enfermeria | WEBP | 2048x1365 | 148 KB | HelsenorskPage.jsx:46 hero (692/932x520, eager) | w/h, eager ok | "Helsenorsk undervisning i Alicante" | OK k=2,2-2,6 |
| 17 | helseHealthTeam | WEBP (var.) | 1440x1080 **girada** | 166 KB | Hero.jsx:142 mosaico (148 px) | lazy sin w/h, alt="" aria-hidden | - | **GIRADA** (corregida en v2) |
| 18 | helsesektor | WEBP con ext. .png | 1914x1240 | 1,59 MB | **ningún consumidor** | - | - | muerta |
| 19 | helseSituasjon | JPEG | 1536x1024 | 998 KB | HelsenorskPage:118 (688/928x520), HomePage:208, Helsesektor.jsx:93 (469x520) y hero `helseHero` | sin srcSet | **Home:208 alt "Global Working-teamet i møte med norske arbeidsgivere" sobre una foto de enfermera con anciana**; Helsenorsk:118 sí describe | INSUFICIENTE borderline (k 1,97/1,66), misma foto repetida en 4 sitios |
| 20 | rekruttering | WEBP (var.) | 1388x906 | 88 KB | GodeGrunner.jsx:32 (**1216x400**), HelsePage.jsx:235 (576x460) | GodeGrunner w/h, lazy | ok | **INSUFICIENTE** en GodeGrunner k=1,14 (el original ya mide 1388) |
| 21 | platformHero | WEBP (var.) | 1600x994 | 75 KB | fallback Nyheter.jsx:92 / NewsArticlePage.jsx:59; portada de "kandidatportal-lansert" (Squarespace) | ok | "plattformvisning" | OK |
| 22 | claseNoruego | WEBP | **1024x682** | 66 KB | HomePage.jsx:121 (584x300), **HelsenorskPage.jsx:188 a ancho completo** (1440-1920x460) | Home w/h; Helsenorsk sin | ok | **INSUFICIENTE**: k=0,71 @1440, 0,53 @1920 (se escala 1,4x-1,9x hacia arriba) |
| 23 | peopleHero | WEBP con ext. .jpg | 858x1144 | 84 KB | **ningún consumidor** | - | - | muerta |
| 24 | peopleTeam1 | = peopleHero (misma URL) | - | - | **ningún consumidor** | - | - | DUPLICADA + muerta |
| 25 | peopleTeam2 | WEBP con ext. .png | **858x1144** | 110 KB | CTABanner.jsx:32 (688/928x460, retrato vertical metido en caja horizontal) | lazy sin w/h | publishedContent: "Global Working-teamet i samarbeid"; la foto es **un solo hombre** | **INSUFICIENTE** k=1,25 @1440, 0,92 @1920 |
| 26 | peopleCTA | misma md5 que peopleHero (84 482 bytes) | - | - | **ningún consumidor** | - | - | DUPLICADA + muerta (3 claves, 2 ficheros, 1 contenido) |
| 27-32 | partner1, partner2, partnersRow1 (=partner1), partnersRow2 (=partner2), omOss1, omOss2 | WEBP con ext. .png (Squarespace) | 1764x246, 1762x150, 1924x1236 (2,76 MB), 860x912 (927 KB) | - | **ningún consumidor** | - | - | muertas, dependencia externa gratuita |
| 33 | empresas | WEBP | 1024x89 | 10 KB | **ningún consumidor** | - | - | muerta |

## 2. Imágenes que pinta el sitio y no están en el catálogo (13 en Supabase + 1 en Squarespace)

Entran por `publishedContent.js` / `siteContent.js` / `src/content/news/*.md`. `-v` = variantes que ya existen en `public/assets/media/`.

| Fichero Supabase | fmt real | Dims | Bytes | Uso -> caja CSS | k @1440/@1920 | Veredicto |
|---|---|---|---|---|---|---|
| `2026/04/20/e0497e7e…trappebildet.png` | PNG (alpha opaco) | **682x675** | 975 KB | Hero **eager** de SpanskAlicanteHvorforPage.jsx:43 y LivetSomStudentPage.jsx:46 (692/932x520) | **0,99 / 0,73** | **INSUFICIENTE** + FORMATO MALO (PNG 952 KB -> 66 KB webp) |
| `2026/04/20/7ae916d9…elev-spansk-alicante.png` | PNG | 1080x1350 | 1,56 MB | Hero **eager** SpanskAlicantePage.jsx:42 (692/932x520) | 1,56 / 1,16 | **INSUFICIENTE** + FORMATO MALO (-> 79 KB); retrato vertical recortado a banda horizontal |
| `2026/04/20/f82a2917…spansk-alicante.jpg` | JPEG | 1080x1350 | 967 KB | SpanskAlicanteTeaser.jsx:31 (688/928x540). Alt: "Solnedgang ved stranden" sobre foto de grupo en un aula | 1,57 / 1,16 | **INSUFICIENTE**; ALT que no describe |
| `2026/05/06/cef58e85…image…052.jpg` | JPEG | 5712x4284 | 3,52 MB | Livet:85 (688/928x520) | 8,2 / 6,2 | **SOBREDIMENSIONADA** -> 101 KB |
| `2026/05/06/b1f5e99d…image…055.jpg` | JPEG | **1024x768** | 328 KB | Livet:150 **ancho completo** 1440-1920x460 | **0,71 / 0,53** | **INSUFICIENTE** (sin arreglo posible sin foto nueva) |
| `2026/05/06/8d3592ee…image…047.jpg` | **PNG** con ext. .jpg | 3088x2056 | **3,57 MB** | Livet:228 (1216x440) | 2,5 | **SOBREDIMENSIONADA** + FORMATO MALO -> 97 KB |
| `spansk-alicante/beach-collage.jpg` | JPEG | **8864x3281** (panorámica 2,7:1, 4 fotos de móvil pegadas) | **4,16 MB** | SpanskAlicantePage.jsx:199 (1440-1920x480) **y** Livet:188 (688/928x560: se ve ~45 % del collage) | 6,2 / 4,6 | **SOBREDIMENSIONADA** -> 234 KB; usarla en caja casi cuadrada recorta el collage |
| `spansk-alicante/testimonial-oliver.jpg` | JPEG | 993x1088 | 174 KB | SpanskAlicantePage.jsx:166 (368x420) | 2,6 | OK |
| `spansk-alicante/group-office.jpg` | **PNG** con ext. .jpg | 932x964 | 1,59 MB | SpanskAlicanteHvorforPage.jsx:118 (400x260); portada de la noticia "praktisk-norsk" a 896x440 | 2,3 / **1,04** | FORMATO MALO (-> 71 KB); en la noticia k=1,04 |
| `hvagjor/classroom-rekruttering.jpg` | **PNG** con ext. .jpg | 1536x1024 | 2,16 MB | HvaGjor.jsx:128 (1216x460) | 1,26 | **INSUFICIENTE** + FORMATO MALO (-> 54 KB) |
| `2026/04/17/9310b14e…bilde-sykepleier.jpg` | JPEG | 1536x1024 | 998 KB | (= helseSituasjon, fila 19) | 1,97 / 1,66 | -> 65 KB |
| `2026/04/21/62841656…sykepleier-hendergw.png` | PNG | 1536x1024 | **1,90 MB** | portada de "hvordan-lykkes", NewsArticlePage.jsx:183 **eager + fetchpriority high** (896x440) = LCP de esa ruta | 1,71 | FORMATO MALO (-> 32 KB) |
| `2026/05/26/5762bbc0…vaga.jpg` | JPEG | 1200x798 | 130 KB | portada de "vaga" (896x440 artículo, 689x400 destacada) | **1,34** / 1,74 | **INSUFICIENTE** (original corto) |
| `team-hero.jpg` | JPEG | 3088x2056 | 3,09 MB | `omOssTeam.members.3` (retrato 4:5 recortado de una foto de grupo); **og:image** de 2 noticias | - | ver sección 6 |
| `og-image.jpg` | JPEG | **512x512** | 15 KB | og:image / twitter:image / logo JSON-LD de **todas** las 24 páginas | - | tamaño equivocado (ideal 1200x630) |
| Squarespace `Screenshot…15.58.15.png` | WEBP con ext. .png | 1926x1196 | 2,16 MB | portada de la noticia "kandidatportal-lansert" | - | = platform-hero (mismo md5): ahora mapeada a la variante local |

Otras imágenes:
- `spansk-i-alicante-logo.webp` (importada en `SpanskAlicanteTeaser.jsx:3`): **4500x4500**, 159 KB, pintada a **40x40 px** (`h-10`): 112x más píxeles de los pintados. Dentro de `src/assets/`, no era mía. Creé `public/assets/media/spansk-i-alicante-logo-160.webp` (160x160, 9,5 KB); parche P8.
- Carrusel de vídeos (`VideoCarousel.jsx:269`): miniaturas `i.ytimg.com/vi/<id>/oardefault.jpg` 720x1280, 89-125 KB, tarjeta de 190-260 px de ancho (k 2,8-3,8). Ok. Sin `width`/`height` pero absolutas en caja fija: sin CLS. Dependencia de YouTube, esperable.
- `src/assets/` contiene los `.webp` que genera `convertToWebP` (también sin `.rotate()`: los de fotos de móvil están girados) y originales que no importa nadie (`hero.png`, `vite.svg`, `react.svg`...). Vite no los empaqueta mientras nadie los importe.

## 3. El helper `img()`

Lectura de `src/assets/images.js`:
- Para una de las URLs registradas (por **nombre de archivo**) devuelve la variante local más pequeña con ancho >= pedido. Para cualquier otra URL, **la devuelve igual**: no añade parámetros.

Prueba contra Supabase (`team-hero.jpg`, ETag `208e9b7f…`):

| Petición | HTTP | Bytes |
|---|---|---|
| `/object/public/content-media/team-hero.jpg` | 200 | 3 087 947 |
| `…?width=400` | 200 | **3 087 947** |
| `…?width=1200` | 200 | **3 087 947** |
| `…?width=400&quality=60` | 200 | **3 087 947** |
| `/render/image/public/…?width=400` | **403** | `{"error":"FeatureNotEnabled","message":"feature not enabled for this tenant"}` |

Cabeceras: `Cache-Control: private, no-cache`, `CF-Cache-Status: DYNAMIC`.
Conclusión: **cualquier URL de Supabase que no pase por la tabla de `images.js` sirve el original completo, sin redimensionar y sin caché compartida**. Es lo que ocurría con 27 de las 28 imágenes vivas antes de este cambio (solo `team-hero.jpg` coincidía por nombre con la tabla vieja).

## 4. Peso de imágenes por ruta (cliente, primera visita, escritorio)

"Con images.js" = solo el fichero que edité. "Con parches" = además P1-P6 aplicados (los consumos crudos siguen apuntando a Supabase hasta entonces).

| Ruta | Antes | Con images.js | Con parches |
|---|---|---|---|
| /livet-som-student | 14,7 MB | 2,9 MB | 0,5 MB |
| /spansk-i-alicante | 8,9 MB | 4,8 MB (collage crudo 4,2 MB + testimonial crudo) | 0,8 MB |
| /om-oss | 5,9 MB | 5,7 MB (retratos crudos) | 0,4 MB |
| / (Home, sin contar el hero) | 3,5 MB | 2,6 MB (avatares crudos) | 0,1 MB |
| /helsenorsk | 1,2 MB (+2,5 MB si salen los avatares) | 0,14 MB | 0,14 MB |

## 5. Qué cambié

Solo `src/assets/images.js` y `public/`:

1. `src/assets/images.js`
   - Eliminado `SB`: **cero URLs de Supabase en el fichero**. Las 18 entradas remotas pasan a variantes locales.
   - 26 ficheros de Supabase y 1 de Squarespace mapeados por nombre en `CRITICAL_SOURCES` -> `img()`/`srcSet()` los resuelven sin tocar `publishedContent.js` ni los `.md`.
   - Borradas 11 entradas muertas (helsesektor, peopleHero, peopleTeam1, peopleCTA, partner1/2, omOss1/2, partnersRow1/2, empresas). Catálogo: 33 -> 22. Verificado con `rg`: sin consumidores.
   - Slugs `alicante-hero-sunset`, `alicante-promenade`, `helse-health-team` -> `-v2`, con `LEGACY_SLUGS` para que los nombres viejos que aún cita `publishedContent.js` (`alicante-promenade-640.webp`) redirijan a la v2.
2. `public/assets/media/` (el directorio pasa de ≈1,4 MB a 7,3 MB)
   - 77 ficheros (29 fotos; 76 WebP q74 effort 6 y 1 copia sin tocar de pablo-ceo), **con `.rotate()` y sin escalar hacia arriba**, generadas desde los originales en `src/assets/` o desde lo descargado de Supabase.
   - Borradas las 10 variantes viejas giradas; añadidas las 10 `-v2`.
   - `og-default.jpg` (1200x630, 180 KB, recorte de team-hero), `og-vaga.jpg`, `og-sykepleier-hendergw.jpg`, `og-sykepleier-bilde.jpg`, `og-group-office.jpg` (JPEG 1200x630, 45-117 KB) y `logo-512.jpg` (copia del logo cuadrado).
   - `spansk-i-alicante-logo-160.webp`.
3. Verificación: `npm test` -> exit 0; `npm run build` -> exit 0, "Articles: 10", "verificados en 24 archivos". Comprobado que todas las rutas de `images.js` existen en disco y que `img()` resuelve a fichero existente para las 36 URLs vivas (salvo `og-image.jpg`, que no es de `img()`).
   - `npm run build` toca `public/sitemap.xml` (lastmod) y regenera 10 ficheros viejos sin `-v2`; **los revertí/borré**. Tras cada build reaparecen hasta aplicar P0.

## 6. Parches para componentes (aplicar tú)

Todos con `img`/`srcSet` ya importados salvo donde se indica.

**P0 — scripts/optimize-images.mjs (crítico: sin esto el prebuild vuelve a girar fotos)**
```
L51  { slug: 'alicante-hero-sunset', source: ...
  -> { slug: 'alicante-hero-sunset-v2', source: ...
L67  { slug: 'helse-health-team', source: ...
  -> { slug: 'helse-health-team-v2', source: ...
L69  slug: 'alicante-promenade',
  -> slug: 'alicante-promenade-v2',
L124-125  const info = await sharp(sourcePath)
              .resize({ width, withoutEnlargement: true })
  -> const info = await sharp(sourcePath)
              .rotate()
              .resize({ width, withoutEnlargement: true })
L156-157  const info = await sharp(inputPath)
              .webp({ quality: 80, effort: 6 })
  -> const info = await sharp(inputPath)
              .rotate()
              .webp({ quality: 80, effort: 6 })
```
Los `*-v2-*.webp` ya están en `public/`; con el parche el script los reconoce como `cached`.

**P1 — avatares (1,73 MB y 707 KB para 48-64 px)**
```
src/components/Kontakt.jsx:214
  src={resolveContactPhoto(contact)}
-> src={img(resolveContactPhoto(contact), 192)}

src/pages/HomePage.jsx:264
  src={resolveContactPhoto(c)}
-> src={img(resolveContactPhoto(c), 192)}

src/pages/LivetSomStudentPage.jsx:271
  src={contact.imageUrl}
-> src={img(contact.imageUrl, 192)}

src/pages/HelsenorskPage.jsx:228
  src={contact.imageUrl}
-> src={img(contact.imageUrl, 192)}
```

**P2 — retratos de Om oss (Miriam 1,73 MB, Gro 707 KB, team-hero 3 MB en caja 286x357)**
```
src/pages/OmOssPage.jsx:54
  src={portrait}
-> src={img(portrait, 640)}
   width={640}
   height={800}
```
(`ceoPhoto` mide 300x400: se queda así hasta tener una foto mejor; con `img()` no cambia.)

**P3 — Spansk i Alicante: testimonial y collage panorámico**
```
src/pages/SpanskAlicantePage.jsx:166
  src={page.testimonialImageUrl}
-> src={img(page.testimonialImageUrl, 993)}

src/pages/SpanskAlicantePage.jsx:199
  src={page.beachCollageUrl}
-> src={img(page.beachCollageUrl, 2560)}
   srcSet={srcSet(page.beachCollageUrl, [1024, 1920, 2560])}
   sizes="100vw"
```

**P4 — foto lateral de "Hvorfor Spansk i Alicante"**
```
src/pages/SpanskAlicanteHvorforPage.jsx:118
  src={vision.sidebarImageUrl}
-> src={img(vision.sidebarImageUrl, 932)}
```

**P5 — HvaGjor (PNG de 2,16 MB)**
```
src/components/HvaGjor.jsx  (añadir al bloque de imports)
+ import { img } from '../assets/images'
src/components/HvaGjor.jsx:128
  src={c.sectionImageUrl}
-> src={img(c.sectionImageUrl, 1536)}
```

**P6 — logos con ancho/alto falsos (salto de layout al cargar)**
```
src/components/Navbar.jsx:170-171
  width="200"
  height="36"
-> width="1000"
   height="262"

src/components/Footer.jsx:48-49
  width="200"
  height="36"
-> width="1000"
   height="262"
```

**P7 — alts que no describen la foto**
```
src/data/publishedContent.js  homeHealth.imageAlt  (la foto es una enfermera con una anciana)
  "Global Working-teamet i møte med norske arbeidsgivere"
-> "Sykepleier i samtale med eldre pasient på sykehjem"

spanskAlicanteTeaser.imageAlt   (la foto es un grupo de estudiantes en un aula)
  "Solnedgang ved stranden i Alicante"
-> "Studenter samlet i klasserommet til Global Working i Alicante"

spanskAlicanteVision.imageAlt   (la foto es un grupo sentado en una escalera)
  "Historisk arkitektur og stemning i Alicante"
-> "Studenter fra Global Working samlet i en trapp i Alicante"

spanskAlicantePage.heroImageAlt (una persona sentada en una playa vacía, sin palmeras)
  "Strand og palmer i Alicante"
-> "Student som sitter alene på stranden i Alicante"

livetSomStudent.samtaleImageAlt (collage de playas y grupos)
  "Samtaleassistenter i Alicante"
-> "Studenter på stranden og i sosiale aktiviteter i Alicante"

ctaBanner.imageAlt             (un solo hombre, no un equipo)
  "Global Working-teamet i samarbeid"
-> "Portrett av en mann som ser til siden"   (o cambiar la foto)

rekrutteringCollab.imageAlt    (foto de grupo en el patio)
  "Global Working rekrutteringsmodell"
-> "Global Working-teamet samlet utenfor kontoret i Alicante"
```
(Texto noruego redactado por mí a partir de lo que se ve en la foto: que lo revise quien sepa nb-NO.)

**P8 — logo Spansk i Alicante (4500x4500 para 40 px)**
```
src/components/SpanskAlicanteTeaser.jsx:3
  import spanskAlicanteLogo from '../assets/alicante/spansk-i-alicante-logo.webp'
-> const spanskAlicanteLogo = '/assets/media/spansk-i-alicante-logo-160.webp'

src/components/SpanskAlicanteTeaser.jsx:40-44   (añadir)
   width={40}
   height={40}
```

**P9 — OG / redes (todas las 24 páginas apuntan a un cuadrado de 512x512 en Supabase)**
```
src/lib/seo.js:6  y  scripts/prerender-meta.mjs:9   (deben cambiar los dos a la vez: check-seo-sync los compara)
  const DEFAULT_IMAGE = 'https://hahqimviirkkzkvmusga.supabase.co/storage/v1/object/public/content-media/og-image.jpg'
-> const DEFAULT_IMAGE = 'https://globalworking.no/assets/media/og-default.jpg'

src/lib/seo.js:28  y  scripts/prerender-meta.mjs:35  (el logo del JSON-LD no debe ser la imagen social)
  logo: { '@type': 'ImageObject', '@id': LOGO_ID, url: DEFAULT_IMAGE },
-> logo: { '@type': 'ImageObject', '@id': LOGO_ID, url: 'https://globalworking.no/assets/media/logo-512.jpg' },

index.html:19-21
  <meta property="og:image" content="https://hahqimviirkkzkvmusga.supabase.co/storage/v1/object/public/content-media/og-image.jpg" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />
-> <meta property="og:image" content="https://globalworking.no/assets/media/og-default.jpg" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />

index.html:27
  <meta name="twitter:image" content="…/og-image.jpg" />
-> <meta name="twitter:image" content="https://globalworking.no/assets/media/og-default.jpg" />

src/content/news/2026-05-26-pablo-intervju.md:8  y  2026-05-06-rekrutteringspartner.md:8   (3 MB de og:image)
  coverImage: ".../content-media/team-hero.jpg"
-> coverImage: "https://globalworking.no/assets/media/og-default.jpg"
```
Efecto secundario: `coverImage` también es la portada en la página. Si no se quiere el recorte 1200x630 dentro del artículo, dejar el `.md` y añadir un campo `ogImage` al prerender (más trabajo). Equivalentes ya generados para las otras portadas: `og-vaga.jpg`, `og-sykepleier-hendergw.jpg`, `og-sykepleier-bilde.jpg`, `og-group-office.jpg`.
Tras P9, **`vercel.json:47` puede perder `https://hahqimviirkkzkvmusga.supabase.co`, `https://images.squarespace-cdn.com` y `https://globalworking.net` de `img-src`** (solo después de aplicar P1-P5, P9 y comprobar con `rg hahqimviirkkzkvmusga dist`).

**P10 (opcional, ahorra 70-200 KB por imagen en móvil)** — `srcSet` en las imágenes anchas que hoy usan un único `img(..., 1400)` (sirve la de 1440 también a un móvil de 390 px). Añadir, dentro de cada `<img>`/`<EditableImage>`:
```
LivetSomStudentPage.jsx:85   srcSet={srcSet(page.undervisningImageUrl || IMAGES.spanskAlicantePromenade, [640, 1024, 1440])}  sizes="(max-width: 1024px) 100vw, 50vw"
LivetSomStudentPage.jsx:228  srcSet={srcSet(page.fellesskapImageUrl || IMAGES.spanskAlicanteBeachPalms, [640, 1024, 1440, 1920])}  sizes="(max-width: 1280px) 100vw, 1216px"
SpanskAlicantePage.jsx:296   srcSet={srcSet(page.cityImageUrl || IMAGES.spanskAlicanteCityView, [640, 1024, 1440])}  sizes="(max-width: 1024px) 100vw, 50vw"
HomePage.jsx:208             srcSet={srcSet(hHealth.imageUrl || IMAGES.homeMetricsTeam, [640, 1024, 1536])}  sizes="(max-width: 1024px) 100vw, 50vw"
```
(`HomePage.jsx` y `LivetSomStudentPage.jsx` además necesitan `srcSet` en el import de `'../assets/images'`.)

## 7. Lo que NO se arregla con código (hay que sustituir la foto)

Ninguno de estos números cambia con lo hecho; el píxel que no existe no se inventa:

| Foto | Tamaño | Dónde | k @1440 |
|---|---|---|---|
| `trappebildet.png` | 682x675 | hero de 2 páginas | 0,99 |
| `b1f5e99d…055.jpg` | 1024x768 | Livet, banda a ancho completo | 0,71 |
| `clase-noruego.webp` | 1024x682 | Helsenorsk, banda a ancho completo | 0,71 |
| `people-team` | 858x1144 | CTABanner, caja horizontal | 1,25 |
| `rekruttering` | 1388x906 | GodeGrunner 1216 px | 1,14 |
| `pablo-ceo.webp` | 300x400 | retrato de la dirección | 1,05 |
| `vaga.jpg` | 1200x798 | portada artículo | 1,34 |
| `elev-spansk-alicante` / `spansk-alicante.jpg` | 1080x1350 vertical | hero/teaser horizontales | 1,16-1,57 |
Mitigación sin foto nueva: encajar las bandas a ancho completo (Livet:150, Helsenorsk:188) dentro de `container-xl` con `max-w-[1216px]`: k sube de 0,53 a 0,84 como máximo en 1920 (sigue siendo <1: no lo arregla, solo lo disimula).

## 8. Veredicto

**¿Aguanta la etiqueta de "profesional"? No.**
- Técnicamente (corregido ahora): de 28 ficheros en vivo, 11 pesaban más de 1 MB (28 MB entre las 11; la ruta Livet, 14,7 MB por visita), 3 variantes se servían de costado en el hero de la Home, 4 PNG se hacían pasar por `.jpg` y los avatares de 64 px descargaban 1,73 MB.
- Por contenido (no se arregla con código): 8 fotos están por debajo de k=2 en escritorio y 3 por debajo de k=1 a 1440 px (visiblemente escaladas hacia arriba), el hero de dos páginas es una imagen de 682 px, el catálogo mezcla stock correcto (enfermería, fiordo, manos) con fotos de móvil sin edición (arco del castillo, palmeras, promenade, collage de 4 capturas), y 7 alts no describen la imagen (uno afirma "equipo con empleadores noruegos" sobre una enfermera con una anciana).
- Lo que hay que pagar: una sesión de fotos o stock con licencia, mínimo 2560 px de ancho para bandas completas.

**Riesgo real de que las imágenes vivan en un Supabase "ya no usado":**
1. Hoy: 200 OK. Pero `private, no-cache` (revalida siempre), sin transformaciones (`?width=` ignorado, `/render/image` 403), y tamaños 3-5 MB.
2. **Los originales de 13 fotos solo existen allí** (no están en el repo): `trappebildet`, `elev-spansk-alicante`, `spansk-alicante.jpg`, `image…047/052/055`, `beach-collage`, `testimonial-oliver`, `group-office`, `classroom-rekruttering`, `sykepleier-hendergw`, `vaga`, `bilde-sykepleier`. Ya están descargadas a `C:\Users\PC\AppData\Local\Temp\claude\2f4ec2b2101f0f22\67329f2d-8f68-4e01-8339-f169ca9563f5\scratchpad\dl\` (temporal: **cópialas a un sitio permanente antes de tocar el proyecto**). Las variantes en `public/` están commiteables, pero las mayores se acotaron a 1920-2560 px.
3. Con el cambio de hoy, el sitio deja de depender de Supabase para pintar fotos, pero **siguen en Supabase el og:image de 24 páginas** (`og-image.jpg`, más 2 `team-hero.jpg` de 3 MB y 4 portadas) y todos los consumos crudos hasta aplicar P1-P5. Si el bucket se borra, se pausa o se corta por cuota de egress, el sitio no se rompe visualmente por las imágenes del cuerpo (ya locales vía `img()`), pero sí las previsualizaciones sociales y 9 `<img>` crudos (avatares, retratos, collage, testimonial, sidebar, HvaGjor).
4. No pude verificar el plan ni la cuota de Supabase; si es Free, el egress mensual es pequeño frente a 14,7 MB por visita a una sola ruta. Verificar en el dashboard.
5. Quitar Supabase de `vercel.json` CSP sin haber hecho P9 rompe los OG de golpe (y ninguna prueba lo detecta).
