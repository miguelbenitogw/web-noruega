# Auditoría de maquetación — Global Working Norge

Fecha: 17 de noviembre de 2026
Alcance: 14 rutas + 10 artículos en `/nyheter/<slug>`, medidas en móvil (375x812),
tablet (768x1024) y escritorio (1440x900), recargando en cada cambio de viewport.

---

## Veredicto

**No hay «un problema serio de maquetación».** El sitio está bien construido y el
sistema «To kyster» se respeta con una disciplina que no es habitual. Lo que hay
son **tres cosas concretas**, dos de ellas invisibles en un escritorio —que es
desde donde se suele mirar una web— y por eso es fácil que incomoden sin que uno
sepa decir por qué:

1. **Contraste**: un color del sistema, `ink-soft`, no llegaba a AA en ningún
   fondo donde se usa. Afectaba a ~30 elementos por página (fechas, cargos,
   metadatos). **Arreglado.**
2. **Objetivos táctiles**: en móvil, los controles eran más finos que un dedo.
   El peor era el botón de menú (41x41) y los puntos del carrusel (10,6x10,6).
   **Arreglado.**
3. **Un hueco muerto de verdad**: 518 px de banda navy vacía en el bloque de
   contacto. **Arreglado.**

Lo demás que se suele achacar a «la maquetación» —scroll horizontal, texto que
se sale, jerarquía rota, dos naranjas en pantalla— **no pasa en ninguna ruta**.
Lo medí expresamente y lo dejo documentado abajo, porque un «no hay problema»
comprobado vale tanto como un arreglo.

---

## Problemas encontrados, por gravedad

### 1 · ALTA — `ink-soft` no llega a AA en ningún fondo donde se usa

El token `ink.soft` (`#6F7F95`) es el gris de los metadatos: fechas, cargos,
tiempos de lectura, «Rådgiver», «Etablert». Aparece en ~30 nodos por página.

| Fondo | Antes | Después | Exigido |
|---|---|---|---|
| blanco | **4,08:1** ✗ | **5,17:1** ✓ | 4,5:1 |
| `surface` `#F1F4F9` | **3,70:1** ✗ | **4,69:1** ✓ | 4,5:1 |

Nodos de texto por debajo del mínimo, **móvil**, antes → después:

| Ruta | Antes | Después |
|---|---|---|
| `/` | **33** | **5** |
| `/helse` | **36** | **4** |
| `/kontakt` | **5** | **2** |
| `/om-oss` | — | **2** |

Los que quedan son, en todas las rutas, únicamente los dos casos de color de
marca que dejo sin tocar a propósito (ver «Lo que no arreglé»).

**Arreglo**: `tailwind.config.js` — `ink.soft` pasa de `#6F7F95` a `#5E6E88`.
Mantiene el mismo tiro de azul de la familia; no es un color de marca, es el
gris del dato que acompaña.

---

### 2 · ALTA — Objetivos táctiles por debajo del mínimo en móvil

Medido a 375x812. El mínimo de referencia es 44x44 px; 24x24 es el suelo
exigible. Esto no se ve nunca desde un escritorio.

| Control | Fichero | Antes | Después |
|---|---|---|---|
| Botón de menú (hamburguesa) | `src/components/Navbar.jsx:231` | **41 x 41** | **44 x 44** |
| Puntos del carrusel de vídeo | `src/components/VideoCarousel.jsx:319-345` | **10,6 x 10,6** | **47 x 47** |
| Correo y teléfono de las fichas | `src/components/Kontakt.jsx:243-256` | alto **22,4** | alto **44,0** |
| Iconos sociales del pie | `src/components/Footer.jsx:61-69` | **42,5 x 42,5** | **44 x 44** |
| Enlaces de navegación del pie | `src/components/Footer.jsx:86-93` | alto **21,3** | alto **36,8** |
| Enlaces legales del pie | `src/components/Footer.jsx:118` | alto **21,3** | alto **34,0** |
| `TextLink` (primitiva, todo el sitio) | `src/components/ui/TextLink.jsx:45` | alto **21,3** | alto **34,0** |
| Migas de pan | `src/components/ui/PageHero.jsx:55,60` | alto **20,7** | alto **36,7** |
| «Tilbake til forsiden» | `src/components/PageEndNav.jsx:28` | alto **21,25** | alto **34,0** |

Controles por debajo de 44 px, **móvil**, antes → después:
`/` **13 → 6**, `/kontakt` **15 → 11** (los 4 de correo/teléfono ya son 44).

Los que siguen contando están todos **por encima de 24 px** (el suelo exigible)
y por debajo de 44 (el ideal): son enlaces de texto corrido. Subirlos hasta 44
descuadraba el ritmo de las tarjetas donde viven; está explicado en el comentario
de `TextLink.jsx`. El `1x1` que aparece en la cuenta es el enlace «saltar al
contenido», que mide así a propósito hasta que recibe el foco.

---

### 3 · MEDIA — 518 px de banda navy vacía en el bloque de contacto

`KandidatKontakt` (en `/spansk-i-alicante` y `/spansk-i-alicante/livet-som-student`).
Columna izquierda: etiqueta + titular + una frase = **235 px**. Columna derecha:
el formulario = **752 px**. Con `items-start`, **518 px vacíos** debajo del texto:
el **69 %** de la altura de la fila. Es el mismo patrón que la foto vino a tapar
en «Vårt tilbud».

**Arreglo**: `src/components/KandidatKontakt.jsx:174` — `lg:sticky lg:top-28` en
la columna corta. No es una invención: es exactamente lo que ya hacía el bloque
de FAQ (`src/components/FAQ.jsx:105`) para este mismo problema.

Medido recorriendo la sección con el scroll, muestreando cada 150 px — porcentaje
del recorrido en el que el titular está en pantalla:

| | Antes | Después |
|---|---|---|
| Titular visible durante la sección | **57 %** | **100 %** |
| Posición del titular al final de la sección | **-581 px** (fuera) | **-63 px** |

---

### 4 · BAJA — Color fuera del sistema en dos sitios

- `src/components/editable/InlineRichText.jsx:4` — el párrafo por defecto era
  `text-gray-700`, un gris de Tailwind que el sistema prohíbe por escrito. No se
  veía porque **las 100 % de las llamadas lo pisan con `!text-ink-muted`** (medido:
  0 nodos computaban ese gris) — y ese `!` existe justamente porque competía con
  ellas. **Arreglado**: el defecto pasa a `text-ink-muted`. Cero cambio visual,
  pero el día que alguien escriba un párrafo sin pisarlo ya no le sale otra paleta.
- `src/components/VideoCarousel.jsx:341` — los puntos inactivos eran `bg-gray-300`
  / `bg-gray-400`. **Arreglado**: `bg-line` (el filete del sistema) y
  `primary-300` al pasar el ratón.

---

## Lo que medí y está BIEN (no lo toqué)

Esto es tan parte del informe como lo anterior:

| Comprobación | Resultado |
|---|---|
| **Scroll horizontal** (`scrollWidth` vs `clientWidth`) | **0 px** en las 14 rutas × 3 viewports. Ni uno. |
| **Dos CTA naranjas en la misma pantalla** | **0 choques** en todas las rutas. La regla dura del sistema se cumple. |
| **Dos `h1` en una página** | Nunca: exactamente **1** por ruta. |
| **Saltos de jerarquía** (h2→h4, etc.) | **Ninguno** en ninguna ruta. |
| **Texto cortado o desbordado de su caja** | **Ninguno**. |
| **Ritmo vertical** | Coherente: `py-20/28` estándar, `py-24/32` para el bloque de noticias — y ese cambio es **el mismo en todas las páginas**, o sea deliberado, no un descuido. |
| **Huecos de grid** | 13 rejillas con columnas desiguales; **12 son composición normal** (texto junto a imagen alta, con `items-center` repartiendo el aire). Solo una era un hueco muerto de verdad: la del punto 3. |
| **Medida de línea en móvil** | 0 párrafos por encima de 75 caracteres. |

Los elementos que «se salen» del viewport en el escritorio (3 en `/`) son las
imágenes con `gw-bleed-*`, que salen a propósito y van recortadas por el
`overflow-hidden` de su sección. No producen scroll.

---

## Lo que NO arreglé, y por qué

### Decisión del cliente — son colores de marca

**a) El texto blanco sobre el naranja de marca no llega a AA.**
Blanco sobre `cta` `#DB532E` = **3,97:1**, exigido 4,5:1. Afecta al botón
principal de cada página («Slik jobber vi», «Kontakt oss», «Send melding»).
No lo toco porque es **el naranja de la marca**. Si se quiere corregir, el cambio
es una línea en `tailwind.config.js`: `#CE4B28` da **4,51:1** y el desplazamiento
de color es casi imperceptible. También vale `cta-600` `#B9411F` (**5,47:1**),
que ya está en la paleta, pero se nota bastante más oscuro.

**b) La etiqueta azul sobre fondo `surface` se queda a un pelo.**
`primary-600` `#1E73BE` sobre `#F1F4F9` = **4,48:1**, exigido 4,5:1. Un fallo del
0,5 %. Afecta a `.gw-label text-primary-600` (2-3 por página). Sobre blanco sí
pasa (4,94:1). La salida limpia es usar `primary-700` en las etiquetas que caen
sobre fondo teñido (**6,74:1**), pero eso oscurece el azul de las etiquetas en
media web y es una decisión de aspecto, no un arreglo.

### Decisión de diseño — el arreglo es de una línea, pero re-fluye todo el sitio

**c) `max-w-measure` no entrega la medida que promete.**
El comentario de `tailwind.config.js` dice «~66 caracteres en serif». Medido
contando los caracteres reales de la primera línea (no por métricas de fuente,
que mienten cuando la webfont no está disponible en canvas):

| Ancho | Caracteres en la primera línea |
|---|---|
| **38rem = 646 px (actual)** | **hasta 93** |
| 34rem = 578 px | 79 |
| 33rem = 561 px | 76 |
| 32rem = 544 px | 62 |

O sea: el token promete 66 y entrega hasta 93. Es el hallazgo tipográfico más
sólido del informe. **No lo cambié** porque bajar `measure` re-fluye el cuerpo de
texto de todas las páginas —un 21 % más estrecho— y algunos párrafos caen a 62
caracteres: eso ya es una decisión de aspecto de quien manda en el diseño, no una
corrección de maquetación. Si se quiere, es una línea: `measure: '33rem'`.

### Fuera de mi alcance

**d) El fondo del `<body>` es `#F8FAFC`.**
Está como estilo en línea en `index.html:193` (y en el loader, línea 207). Es
slate-50, el gris que `tailwind.config.js` prohíbe con todas las letras. Se ve al
hacer overscroll y mientras carga. **No puedo tocar `index.html`**: no está entre
los ficheros que tengo permitidos.

**e) El prerender no inyecta cuerpo.** Conocido y anotado en la memoria del
proyecto. Vive en `scripts/`, fuera de alcance.

**f) `gw-bleed-*` se pasa ~5 px del viewport.** El cálculo usa `100vw`, que
incluye la barra de desplazamiento, mientras que `clientWidth` no. Recortado por
`overflow-hidden`, scroll horizontal 0. Inofensivo; tocarlo tiene más riesgo que
premio.

---

## Ficheros tocados

| Fichero | Línea | Qué |
|---|---|---|
| `tailwind.config.js` | 74-83 | `ink.soft` `#6F7F95` → `#5E6E88` (contraste AA) |
| `src/components/Navbar.jsx` | 226-232 | Hamburguesa `p-2 -mr-2` → `p-2.5 -mr-2.5` (44x44) |
| `src/components/VideoCarousel.jsx` | 319-345 | Puntos: área pulsable 44x44 con el punto como `<span>`; `bg-gray-*` → `bg-line` |
| `src/components/Kontakt.jsx` | 243-256 | Correo y teléfono a `min-h-[44px]` |
| `src/components/Footer.jsx` | 61, 86-93, 118 | Iconos a `w-11 h-11`; enlaces con aire propio; `space-y-2.5` → `space-y-1` |
| `src/components/ui/TextLink.jsx` | 36-45 | `py-1.5` en la primitiva + el porqué documentado |
| `src/components/ui/PageHero.jsx` | 52-61 | Migas con `inline-block py-1` |
| `src/components/PageEndNav.jsx` | 28 | `py-1.5` en el enlace de vuelta |
| `src/components/KandidatKontakt.jsx` | 174 | `lg:sticky lg:top-28` (los 518 px) |
| `src/components/editable/InlineRichText.jsx` | 4-12 | Defecto `text-gray-700` → `text-ink-muted` |
| `.claude/launch.json` | nuevo | Configuración del servidor de desarrollo |

Sin commit ni push: todo queda en el árbol de trabajo.

## Comprobaciones finales

- `npm test` — pasa (anclas 2/60, 13 checks del parser de enlaces, SEO en sincronía 13 rutas).
- `npm run build` — pasa. «Articles: 10», «Cuerpo estático y @graph verificados en 24 archivos».
- Vuelto a medir las 14 rutas tras los arreglos: scroll horizontal sigue en 0,
  desbordes en 0, `h1` en 1, saltos de jerarquía 0, choques de naranja 0.
