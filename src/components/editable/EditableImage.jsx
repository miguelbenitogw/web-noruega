/**
 * EditableImage — ahora es un <img> y nada más.
 *
 * Tenía una capa de edición visual: escuchaba `gw-visual-edit-change`, pintaba
 * un overlay «Bytt bilde» al pasar por encima y disparaba un evento para que
 * el panel del admin abriera el campo. Al desconectar Supabase eso se cayó
 * entero, y lo que queda es la imagen.
 *
 * Se mantiene el nombre y la firma para no tocar de golpe las vistas que lo
 * usan. `path` sale como `data-content-path` para poder rastrear de dónde
 * viene la imagen.
 */
export default function EditableImage({ path, src, alt, className, ...props }) {
  // `wrapperClassName` solo servía para el overlay de edición.
  const { wrapperClassName: _wrapperClassName, ...rest } = props
  const decoding = rest.loading === 'eager' ? 'sync' : 'async'

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      decoding={decoding}
      data-content-path={path}
      {...rest}
    />
  )
}
