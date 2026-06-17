import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import AnimateIn from './AnimateIn'
import useContent from '../hooks/useContent'
import { trackEvent } from '../lib/analytics'
import EditableText from './editable/EditableText'

// Provider URL builders. Keeps the carousel agnostic of the video host so we can
// switch YouTube → Vimeo later by flipping `homeVideos.provider` — no rewrite.
// NB: youtube.com (not -nocookie) is used because the CSP frame-src in
// vercel.json only whitelists youtube.com. i.ytimg.com is whitelisted in img-src.
const PROVIDERS = {
  youtube: {
    embed: (id) =>
      `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    // oardefault = original aspect ratio (720x1280 for Shorts) → no crop on the
    // vertical 9:16 card. hqdefault would be 4:3 and crop badly.
    thumb: (id) => `https://i.ytimg.com/vi/${id}/oardefault.jpg`,
    watch: (id) => `https://www.youtube.com/watch?v=${id}`,
  },
  vimeo: {
    embed: (id) =>
      `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0`,
    thumb: () => null, // Vimeo thumbnails need an API call → rely on custom poster
    watch: (id) => `https://vimeo.com/${id}`,
  },
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Shortest circular distance from `cur` to `i` so a 3-item ring resolves to
// offsets -1 / 0 / +1 (centre + one peek on each side).
const circularOffset = (i, cur, n) => {
  let o = i - cur
  if (o > n / 2) o -= n
  if (o < -n / 2) o += n
  return o
}

const PlayIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const ChevronIcon = ({ dir = 'right', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
  </svg>
)

// Accessible lightbox: locks scroll, traps initial focus, ESC/backdrop close,
// arrow-key navigation. Animates in from center (scale + fade), reduced-motion safe.
function VideoLightbox({ items, index, provider, onClose, onNavigate }) {
  const closeRef = useRef(null)
  const [shown, setShown] = useState(false)
  const builder = PROVIDERS[provider] || PROVIDERS.youtube
  const video = items[index]
  const hasMultiple = items.length > 1

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const raf = window.requestAnimationFrame(() => setShown(true))

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && hasMultiple) onNavigate(1)
      else if (e.key === 'ArrowLeft' && hasMultiple) onNavigate(-1)
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [onClose, onNavigate, hasMultiple])

  if (!video) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title || 'Video'}
      onClick={onClose}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-opacity duration-200 ease-out motion-reduce:transition-none ${shown ? 'opacity-100' : 'opacity-0'}`}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Lukk video"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate(-1) }}
            aria-label="Forrige video"
            className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 sm:flex"
          >
            <ChevronIcon dir="left" size={24} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate(1) }}
            aria-label="Neste video"
            className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 sm:flex"
          >
            <ChevronIcon dir="right" size={24} />
          </button>
        </>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col items-center transition duration-300 ease-out motion-reduce:transition-none ${shown ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="relative aspect-[9/16] h-[82vh] max-h-[82vh] w-auto max-w-[92vw] overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
          <iframe
            key={video.id}
            src={builder.embed(video.id)}
            title={video.title || 'Video'}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
          />
        </div>
        {video.title && (
          <p className="mt-4 text-center font-heading text-sm font-semibold text-white/90">
            {video.title}
            {hasMultiple && <span className="ml-2 text-white/50">{index + 1} / {items.length}</span>}
          </p>
        )}
      </div>
    </div>
  )
}

export default function VideoCarousel() {
  const c = useContent('homeVideos')
  const items = Array.isArray(c.items) ? c.items.filter((it) => it && it.id) : []
  const provider = c.provider || 'youtube'
  const watchLabel = c.watchLabel || 'Se video'
  const builder = PROVIDERS[provider] || PROVIDERS.youtube
  const n = items.length

  const [current, setCurrent] = useState(0)
  const [activeIndex, setActiveIndex] = useState(null)
  const [stageW, setStageW] = useState(0)
  const [ready, setReady] = useState(false)
  const stageRef = useRef(null)
  const touchX = useRef(null)
  const headingId = useId()

  useLayoutEffect(() => {
    const measure = () => stageRef.current && setStageW(stageRef.current.clientWidth)
    measure()
    // Enable the slide transition only AFTER the first measured paint. Otherwise
    // the cards are born mid-transition (from the stageW=0 fallback geometry) and
    // the animation never settles. Snap into place first, animate on rotate.
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const go = useCallback((dir) => setCurrent((cur) => (cur + dir + n) % n), [n])
  const navigate = useCallback((dir) => setActiveIndex((cur) => (cur === null ? cur : (cur + dir + n) % n)), [n])

  const handlePlay = (index) => {
    trackEvent('video_play', { location: 'home_videos', id: items[index]?.id, provider })
    setActiveIndex(index)
  }

  const onTouchStart = (e) => { touchX.current = e.touches[0]?.clientX ?? null }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
    touchX.current = null
  }

  if (n === 0) return null

  // Responsive coverflow geometry, derived from the measured stage width.
  const cardW = Math.max(190, Math.min(260, Math.round((stageW || 320) * 0.6)))
  const cardH = Math.round((cardW * 16) / 9)
  const slot = Math.round(cardW * 0.64) // distance between adjacent card centres
  const reduce = prefersReducedMotion()

  return (
    <section className="overflow-hidden py-24 lg:py-32 bg-gradient-to-b from-white to-surface" aria-labelledby={headingId}>
      <div className="container-xl">
        <AnimateIn className="mb-12 max-w-2xl">
          <EditableText
            as="span"
            path="homeVideos.label"
            value={c.label}
            className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-primary-600"
          />
          <EditableText
            as="h2"
            path="homeVideos.heading"
            value={c.heading}
            id={headingId}
            className="mb-5 font-heading text-3xl font-bold leading-tight text-ink lg:text-4xl xl:text-5xl"
          />
          <EditableText
            as="p"
            path="homeVideos.description"
            value={c.description}
            multiline
            className="text-lg leading-relaxed text-gray-600"
          />
        </AnimateIn>

        <div className="relative">
          {/* Stage */}
          <div
            ref={stageRef}
            className="relative mx-auto w-full overflow-hidden"
            style={{ height: cardH }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            aria-roledescription="karusell"
          >
            {items.map((item, i) => {
              const offset = circularOffset(i, current, n)
              const abs = Math.abs(offset)
              const isCenter = offset === 0
              const visible = abs <= 1
              const poster = item.poster || (builder.thumb ? builder.thumb(item.id) : null)

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => (isCenter ? handlePlay(i) : setCurrent(i))}
                  aria-hidden={visible ? undefined : true}
                  tabIndex={visible ? 0 : -1}
                  aria-label={isCenter ? `${watchLabel}: ${item.title || 'video'}` : `Vis ${item.title || 'video'}`}
                  className={`group absolute left-1/2 top-1/2 overflow-hidden rounded-3xl bg-navy ring-1 ring-black/5 shadow-xl will-change-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400 ${reduce || !ready ? '' : 'transition-[transform,opacity] duration-500 ease-out'}`}
                  style={{
                    width: cardW,
                    height: cardH,
                    transformOrigin: 'center',
                    transform: `translate(-50%, -50%) translateX(${offset * slot}px) scale(${isCenter ? 1 : 0.82})`,
                    opacity: visible ? (isCenter ? 1 : 0.5) : 0,
                    zIndex: 30 - abs,
                    pointerEvents: visible ? 'auto' : 'none',
                  }}
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt=""
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-cover ${reduce ? '' : 'transition-transform duration-[600ms] ease-out group-hover:scale-105'}`}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-navy via-primary-900 to-primary-800" />
                  )}
                  {/* Side cards get a dark veil; centre stays clear */}
                  <div className={`absolute inset-0 transition-colors duration-500 ${isCenter ? 'bg-black/0' : 'bg-navy/40'}`} />

                  <span className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-primary-700 shadow-xl ring-1 ring-black/5 backdrop-blur-sm ${reduce ? '' : 'transition duration-300 ease-out group-hover:scale-110 group-hover:bg-white'} ${isCenter ? 'h-[4.25rem] w-[4.25rem]' : 'h-12 w-12'}`}>
                    <span className="ml-0.5">
                      <PlayIcon size={isCenter ? 26 : 18} />
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Side arrows (desktop). Mobile uses swipe + dots. */}
          {n > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Forrige video"
                className="absolute left-0 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-ink shadow-md transition-all hover:border-primary-600 hover:bg-primary-600 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300 sm:flex lg:left-4"
              >
                <ChevronIcon dir="left" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Neste video"
                className="absolute right-0 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-ink shadow-md transition-all hover:border-primary-600 hover:bg-primary-600 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300 sm:flex lg:right-4"
              >
                <ChevronIcon dir="right" />
              </button>
            </>
          )}
        </div>

        {/* Current title */}
        <p className="mt-7 text-center font-heading text-lg font-bold text-ink" aria-live="polite">
          {items[current]?.title}
        </p>

        {/* Dots */}
        {n > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2.5" role="tablist" aria-label="Velg video">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={item.title || `Video ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${i === current ? 'w-7 bg-primary-600' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        )}
      </div>

      {activeIndex !== null && (
        <VideoLightbox
          items={items}
          index={activeIndex}
          provider={provider}
          onClose={() => { if (activeIndex !== null) setCurrent(activeIndex); setActiveIndex(null) }}
          onNavigate={navigate}
        />
      )}
    </section>
  )
}
