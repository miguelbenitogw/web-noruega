import { useEffect, useState } from 'react'

/**
 * Animated counter: counts from 0 to `end` when `active` is true.
 * Supports numeric strings like "500+" or "50+" — extracts the number.
 */
export default function useCounter(end, active, duration = 1800) {
  const num = parseInt(String(end).replace(/[^0-9]/g, ''), 10)
  const suffix = String(end).replace(/[0-9]/g, '')
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active || isNaN(num)) return

    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo for a nice deceleration.
      // Snap to 1 at the end: 1 - 2^-10 is 0.999, so without this the counter
      // stops just short of the target (e.g. "2500+" would render as "2498+").
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = Math.round(eased * num)

      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [active, num, duration])

  return active ? `${count}${suffix}` : `0${suffix}`
}
