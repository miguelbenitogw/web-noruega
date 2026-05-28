import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Custom hook for scroll-triggered animations.
 * Returns a ref and a boolean indicating if the element is visible.
 * Once visible, stays true (no re-triggering).
 *
 * Key behaviour: uses useLayoutEffect + a synchronous getBoundingClientRect check
 * so elements already in the viewport on initial mount are marked visible BEFORE
 * the browser paints — eliminating the "opacity-0 flash" on above-fold content.
 * Elements below the fold still animate in on scroll via IntersectionObserver.
 */
export default function useInView(options = {}) {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)
  const threshold = options.threshold ?? 0.15
  const rootMargin = options.rootMargin ?? '0px 0px -60px 0px'
  const root = options.root ?? null

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    // Synchronous viewport check: if the element is already visible on mount,
    // set isInView immediately so the browser never paints the hidden state.
    const rect = el.getBoundingClientRect()
    const viewportH = window.innerHeight
    if (rect.top < viewportH - 60 && rect.bottom > 0) {
      setIsInView(true)
      return
    }

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
