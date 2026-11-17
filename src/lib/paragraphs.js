/**
 * Parte un texto de los datos en párrafos: una línea en blanco (con o sin
 * espacios dentro) separa párrafos, y cada uno se recorta. Así los espacios
 * sueltos que arrastra el dato —el último párrafo de «Vårt tilbud» empieza
 * con trece— nunca llegan a la pantalla.
 *
 * Vive fuera de los componentes porque lo usan dos (RichText y MarkdownText)
 * y un archivo de componentes que exporta funciones rompe el fast refresh.
 */
export const splitParagraphs = (value) =>
  String(value ?? '')
    .split(/\n[ \t]*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
