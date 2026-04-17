const SB = 'https://hahqimviirkkzkvmusga.supabase.co/storage/v1/object/public/content-media'

export const IMAGES = {
  // Logos (kept as static imports — not content-editable)
  logo:           new URL('./logo-white.png', import.meta.url).href,
  logoColor:      new URL('./logo-color.jpg', import.meta.url).href,

  // Team / people
  teamHero:                 `${SB}/team-hero.jpg`,
  homeMetricsTeam:          `${SB}/home/metrics-team.jpg`,
  ceoPhoto:                 `${SB}/team/pablo-ceo.webp`,
  teamGroup:                `${SB}/team/team-group.webp`,
  contactMiriam:            `${SB}/team/miriam-svendsen.jpg`,
  contactGro:               `${SB}/team/gro-anette.jpg`,

  // Offices
  alicanteOffice:           `${SB}/office/alicante-office.webp`,
  oficina:                  `${SB}/office/oficina.webp`,

  // Alicante
  spanskAlicanteHeroSunset: `${SB}/alicante/hero-sunset.jpeg`,
  spanskAlicanteBeachPalms: `${SB}/alicante/beach-palms.jpeg`,
  spanskAlicantePromenade:  `${SB}/alicante/promenade-lifestyle.jpg`,
  spanskAlicanteCityView:   `${SB}/alicante/city-view.jpeg`,
  spanskAlicanteCastleArch: `${SB}/alicante/castle-arch.jpeg`,

  // Helse
  enfermeria:               `${SB}/helse/nurses.webp`,
  helseHealthTeam:          `${SB}/helse/health-team.jpg`,
  helsesektor:              `${SB}/cdn/helsesektor.png`,

  // Rekruttering / platform
  rekruttering:             `${SB}/rekruttering.png`,
  platformHero:             `${SB}/platform-hero.png`,
  claseNoruego:             `${SB}/clase-noruego.webp`,

  // People / backgrounds
  peopleHero:               `${SB}/cdn/people-hero.jpg`,
  peopleTeam1:              `${SB}/cdn/people-hero.jpg`,
  peopleTeam2:              `${SB}/people-team.png`,
  peopleCTA:                `${SB}/cdn/people-cta.jpg`,

  // Partner logos (still on CDN — not critical)
  partner1:      'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/daa93884-fbf5-4659-b78c-124a0ccb6d3c/Screenshot+2026-02-26+at+18.15.19.png',
  partner2:      'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/54a26273-89d1-48c9-8404-f1dc25e3df48/Screenshot+2026-02-26+at+18.28.39.png',
  omOss1:        'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/a9bc873b-c7a6-4d48-a550-b69907729127/Screenshot+2026-02-27+at+10.43.30.png',
  omOss2:        'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/7a7c6e81-e17d-44e5-b62b-0257b043f23e/Screenshot+2026-02-26+at+17.51.02.png',
  partnersRow1:  'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/daa93884-fbf5-4659-b78c-124a0ccb6d3c/Screenshot+2026-02-26+at+18.15.19.png',
  partnersRow2:  'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/54a26273-89d1-48c9-8404-f1dc25e3df48/Screenshot+2026-02-26+at+18.28.39.png',
  empresas:      'https://globalworking.net/wp-content/uploads/2024/10/Empresas-con-las-que-trabajamos_Mesa-de-trabajo-1-1024x89.webp',
}

/**
 * img() — previously applied Squarespace CDN width param.
 * Now that images are on Supabase public storage (no transform API),
 * this simply returns the URL unchanged.
 */
export const img = (url) => url ?? ''
