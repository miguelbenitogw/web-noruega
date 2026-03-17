import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for scroll-triggered animations.
 * Returns a ref and a boolean indicating if the element is visible.
 * Once visible, stays true (no re-triggering).
 */
export default function useInView(options = {}) {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)
  const threshold = options.threshold ?? 0.15
  const rootMargin = options.rootMargin ?? '0px 0px -60px 0px'
  const root = options.root ?? null

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin, root }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, root])

  return [ref, isInView]
}
