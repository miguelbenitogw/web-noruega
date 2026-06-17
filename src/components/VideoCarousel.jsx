import { useCallback, useEffect, useId, useRef, useState } from 'react'
import AnimateIn from './AnimateIn'
import useContent from '../hooks/useContent'
import { trackEvent } from '../lib/analytics'
import EditableText, { createArrayItemCommitter } from './editable/EditableText'

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

const PlayIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const ChevronIcon = ({ dir = 'right', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
  </svg>
)

// Facade card: shows our poster + a play button. The heavy <iframe> only mounts
// in the lightbox after a click → zero impact on initial load / LCP.
function VideoCard({ item, index, provider, items, watchLabel, onPlay }) {
  const builder = PROVIDERS[provider] || PROVIDERS.youtube
  const poster = item.poster || (builder.thumb ? builder.thumb(item.id) : null)
  const titleCommitter = createArrayItemCommitter({
    basePath: 'homeVideos.items',
    fallbackItems: items,
    index,
    field: 'title',
  })

  return (
    <div className="snap-start shrink-0 w-[230px] sm:w-[256px]">
      <button
        type="button"
        onClick={() => onPlay(index)}
        className="group relative block w-full aspect-[9/16] overflow-hidden rounded-3xl bg-navy ring-1 ring-black/5 shadow-lg transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:ring-primary-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        aria-label={`${watchLabel}: ${item.title || 'video'}`}
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.07] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-primary-900 to-primary-800" />
        )}
        {/* Scrim: legibility for the overlaid title + cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/5" />

        {/* Center play affordance */}
        <span className="absolute left-1/2 top-1/2 flex h-[4.25rem] w-[4.25rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-primary-700 shadow-xl ring-1 ring-black/5 backdrop-blur-sm transition duration-300 ease-out group-hover:scale-110 group-hover:bg-white motion-reduce:transition-none motion-reduce:group-hover:scale-100">
          <span className="ml-1">
            <PlayIcon />
          </span>
        </span>

        {/* Title + watch hint overlaid on the scrim */}
        <span className="absolute inset-x-0 bottom-0 p-4 text-left">
          <span className="block font-heading text-base font-bold leading-snug text-white drop-shadow-sm">
            {item.title}
          </span>
          <span className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-white/0 transition-colors duration-300 group-hover:text-white/90 motion-reduce:transition-none">
            {watchLabel}
            <ChevronIcon size={13} />
          </span>
        </span>
      </button>

      {/* Editable title lives below the card so the inline editor never nests
          inside the <button> (invalid HTML + click conflicts in edit mode).
          On the published page it's visually hidden — the overlay above shows it. */}
      <EditableText
        as="p"
        path={`homeVideos.items.${index}.title`}
        value={item.title}
        onCommit={titleCommitter}
        className="sr-only"
      />
    </div>
  )
}

// Accessible lightbox: locks scroll, traps initial focus, ESC/backdrop close,
// arrow-key navigation. Animates in from center (scale + fade), reduced-motion safe.
function VideoLightbox({ items, index, provider, watchLabel, onClose, onNavigate }) {
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
            {hasMultiple && (
              <span className="ml-2 text-white/50">{index + 1} / {items.length}</span>
            )}
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
  const scrollerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(null)
  const [edges, setEdges] = useState({ start: true, end: false })
  const headingId = useId()

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setEdges({
      start: scrollLeft <= 2,
      end: scrollLeft + clientWidth >= scrollWidth - 2,
    })
  }, [])

  useEffect(() => {
    updateEdges()
    const el = scrollerRef.current
    if (!el) return undefined
    el.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)
    return () => {
      el.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
    }
  }, [updateEdges, items.length])

  const scrollByCards = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({
      left: dir * Math.min(el.clientWidth * 0.8, 560),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  const handlePlay = (index) => {
    trackEvent('video_play', { location: 'home_videos', id: items[index]?.id, provider })
    setActiveIndex(index)
  }

  const navigate = useCallback(
    (dir) => setActiveIndex((cur) => (cur === null ? cur : (cur + dir + items.length) % items.length)),
    [items.length],
  )

  if (items.length === 0) return null

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-white to-surface" aria-labelledby={headingId}>
      <div className="container-xl">
        <AnimateIn className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
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
          </div>

          {/* Editorial arrow controls, top-right. Hidden on mobile (swipe). */}
          {items.length > 1 && (
            <div className="hidden shrink-0 gap-3 sm:flex">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                disabled={edges.start}
                aria-label="Forrige videoer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-ink shadow-sm transition-all hover:border-primary-600 hover:bg-primary-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-ink"
              >
                <ChevronIcon dir="left" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                disabled={edges.end}
                aria-label="Flere videoer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-ink shadow-sm transition-all hover:border-primary-600 hover:bg-primary-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-ink"
              >
                <ChevronIcon dir="right" />
              </button>
            </div>
          )}
        </AnimateIn>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto"
        >
          {items.map((item, i) => (
            <VideoCard
              key={item.id}
              item={item}
              index={i}
              provider={provider}
              items={items}
              watchLabel={watchLabel}
              onPlay={handlePlay}
            />
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <VideoLightbox
          items={items}
          index={activeIndex}
          provider={provider}
          watchLabel={watchLabel}
          onClose={() => setActiveIndex(null)}
          onNavigate={navigate}
        />
      )}
    </section>
  )
}
