import useInView from '../hooks/useInView'

const variants = {
  fadeUp:    { hidden: 'opacity-0 translate-y-8', visible: 'opacity-100 translate-y-0' },
  fadeDown:  { hidden: 'opacity-0 -translate-y-8', visible: 'opacity-100 translate-y-0' },
  fadeLeft:  { hidden: 'opacity-0 translate-x-8', visible: 'opacity-100 translate-x-0' },
  fadeRight: { hidden: 'opacity-0 -translate-x-8', visible: 'opacity-100 translate-x-0' },
  fade:      { hidden: 'opacity-0', visible: 'opacity-100' },
  scale:     { hidden: 'opacity-0 scale-95', visible: 'opacity-100 scale-100' },
}

/**
 * Wrapper that animates children into view on scroll.
 * @param {'fadeUp'|'fadeDown'|'fadeLeft'|'fadeRight'|'fade'|'scale'} variant
 * @param {number} delay - delay in ms (applied as transition-delay)
 */
export default function AnimateIn({ children, variant = 'fadeUp', delay = 0, className = '', as: asTag = 'div' }) {
  const [ref, isInView] = useInView()
  const v = variants[variant] || variants.fadeUp
  const Component = asTag

  return (
    <Component
      ref={ref}
      className={`transition-all duration-700 ease-out ${isInView ? v.visible : v.hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  )
}
