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

const PlayIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)

// Facade card: shows our poster + a play button. The heavy <iframe> only mounts
// in the lightbox after a click → zero impact on initial load / LCP.
function VideoCard({ item, index, provider, items, onPlay }) {
  const builder = PROVIDERS[provider] || PROVIDERS.youtube
  const poster = item.poster || (builder.thumb ? builder.thumb(item.id) : null)
  const titleCommitter = createArrayItemCommitter({
    basePath: 'homeVideos.items',
    fallbackItems: items,
    index,
    field: 'title',
  })

  return (
    <div className="snap-start shrink-0 w-[230px] sm:w-[260px]">
      <button
        type="button"
        onClick={() => onPlay(item)}
        className="group relative block w-full aspect-[9/16] overflow-hidden rounded-2xl bg-navy shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300"
        aria-label={`Spill av video: ${item.title || 'video'}`}
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-primary-900 to-primary-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary-700 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
          <span className="ml-1">
            <PlayIcon />
          </span>
        </span>
      </button>
      <EditableText
        as="p"
        path={`homeVideos.items.${index}.title`}
        value={item.title}
        onCommit={titleCommitter}
        className="mt-3 px-1 text-sm font-semibold leading-snug text-ink"
      />
    </div>
  )
}

// Accessible lightbox: locks scroll, traps initial focus, ESC + backdrop close.
function VideoLightbox({ video, provider, onClose }) {
  const closeRef = useRef(null)
  const builder = PROVIDERS[provider] || PROVIDERS.youtube

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title || 'Video'}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-[fadeInUp_0.2s_ease-out]"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Lukk video"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div
        className="relative aspect-[9/16] h-[85vh] max-h-[85vh] w-auto max-w-[95vw] overflow-hidden rounded-2xl bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={builder.embed(video.id)}
          title={video.title || 'Video'}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  )
}

export default function VideoCarousel() {
  const c = useContent('homeVideos')
  const items = Array.isArray(c.items) ? c.items.filter((it) => it && it.id) : []
  const provider = c.provider || 'youtube'
  const scrollerRef = useRef(null)
  const [active, setActive] = useState(null)
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
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 560), behavior: 'smooth' })
  }

  const handlePlay = (video) => {
    trackEvent('video_play', { location: 'home_videos', id: video.id, provider })
    setActive(video)
  }

  if (items.length === 0) return null

  return (
    <section className="py-24 lg:py-32 bg-surface" aria-labelledby={headingId}>
      <div className="container-xl">
        <AnimateIn className="mb-12 max-w-3xl">
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
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, i) => (
              <VideoCard
                key={item.id}
                item={item}
                index={i}
                provider={provider}
                items={items}
                onPlay={handlePlay}
              />
            ))}
          </div>

          {/* Arrows: hidden when there's nothing to scroll to in that direction */}
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            disabled={edges.start}
            aria-label="Forrige videoer"
            className="absolute -left-3 top-[calc(50%-1rem)] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lg transition-all hover:bg-primary-600 hover:text-white disabled:pointer-events-none disabled:opacity-0 sm:flex"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            disabled={edges.end}
            aria-label="Flere videoer"
            className="absolute -right-3 top-[calc(50%-1rem)] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lg transition-all hover:bg-primary-600 hover:text-white disabled:pointer-events-none disabled:opacity-0 sm:flex"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {active && (
        <VideoLightbox video={active} provider={provider} onClose={() => setActive(null)} />
      )}
    </section>
  )
}
