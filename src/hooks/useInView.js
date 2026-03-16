import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for scroll-triggered animations.
 * Returns a ref and a boolean indicating if the element is visible.
 * Once visible, stays true (no re-triggering).
 */
export default function useInView(options = {}) {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

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
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px', ...options }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return [ref, isInView]
}
