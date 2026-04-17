// Local assets — downloaded from CDN and served as static imports (Vite pattern)
import logoWhite      from './logo-white.png'
import logoColor      from './logo-color.jpg'
import pabloCeo       from './team/pablo-ceo.webp'
import alicanteOffice from './office/alicante-office.webp'
import teamGroup      from './team/team-group.webp'
import oficina        from './office/oficina.webp'
import claseNoruego   from './clase-noruego.webp'
import nurses         from './helse/nurses.webp'
import platformHero   from './platform-hero.png'
import rekruttering   from './rekruttering.png'
import peopleTeam2    from './people-team.png'
import teamHero       from './team-hero.jpg'
import metricsTeamPhoto from './home/metrics-team.jpg'
import heroSunset     from './alicante/hero-sunset.jpeg'
import beachPalms     from './alicante/beach-palms.jpeg'
import promenadeLifestyle from './alicante/promenade-lifestyle.jpg'
import cityView       from './alicante/city-view.jpeg'
import castleArch     from './alicante/castle-arch.jpeg'
import miriamPhoto    from './team/miriam-svendsen.jpg'
import groPhoto       from './team/gro-anette.jpg'

// Still on CDN — not included in the download task
const CDN = 'https://images.squarespace-cdn.com/content/v1'
const OLD = `${CDN}/5ec321c2af33de48734cc929`
const NEW = `${CDN}/699f19dee84d12556ca836b0`
const WP  = 'https://globalworking.net/wp-content/uploads'

export const IMAGES = {
  // Logos
  logo:           logoWhite,
  logoColor:      logoColor,

  // Public page photos that are editable through site content defaults
  teamHero:       teamHero,
  homeMetricsTeam: metricsTeamPhoto,
  spanskAlicanteHeroSunset: heroSunset,
  spanskAlicanteBeachPalms: beachPalms,
  spanskAlicantePromenade: promenadeLifestyle,
  spanskAlicanteCityView: cityView,
  spanskAlicanteCastleArch: castleArch,
  contactMiriam: miriamPhoto,
  contactGro: groPhoto,

  // Fotos de personas / fondo (portfolio original)
  peopleHero:    `${OLD}/1615224238156-OY2QGA6E03LY3JALP4NL/Rectangle+16.jpg`,
  peopleTeam1:   `${OLD}/1615224412523-SZYXMKS44H8QE5OK3RZP/Rectangle+17.jpg`,
  peopleTeam2:   peopleTeam2,
  peopleCTA:     `${OLD}/1615224521708-2NJ8JNMIYIPO2KCL1RU2/Rectangle+16.jpg`,

  // Screenshots de la plataforma / capturas de contenido actual
  platformHero:  platformHero,
  helsesektor:   `${NEW}/a00ac4da-b7a3-4ada-a655-84cb442ef431/Screenshot+2026-02-26+at+16.20.14.png`,
  rekruttering:  rekruttering,
  partner1:      `${NEW}/daa93884-fbf5-4659-b78c-124a0ccb6d3c/Screenshot+2026-02-26+at+18.15.19.png`,
  partner2:      `${NEW}/54a26273-89d1-48c9-8404-f1dc25e3df48/Screenshot+2026-02-26+at+18.28.39.png`,
  omOss1:        `${NEW}/a9bc873b-c7a6-4d48-a550-b69907729127/Screenshot+2026-02-27+at+10.43.30.png`,
  omOss2:        `${NEW}/7a7c6e81-e17d-44e5-b62b-0257b043f23e/Screenshot+2026-02-26+at+17.51.02.png`,

  // Fotos reales de globalworking.net
  ceoPhoto:      pabloCeo,
  claseNoruego:  claseNoruego,
  oficina:       oficina,
  alicanteOffice: alicanteOffice,
  teamGroup:     teamGroup,
  enfermeria:    nurses,
  empresas:      `${WP}/2024/10/Empresas-con-las-que-trabajamos_Mesa-de-trabajo-1-1024x89.webp`,
  partnersRow1:  `https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/daa93884-fbf5-4659-b78c-124a0ccb6d3c/Screenshot+2026-02-26+at+18.15.19.png`,
  partnersRow2:  `https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/54a26273-89d1-48c9-8404-f1dc25e3df48/Screenshot+2026-02-26+at+18.28.39.png`,
}

// Helper para obtener tamaño optimizado de Squarespace CDN
// (solo aplica a URLs CDN; los imports estáticos ya están optimizados por Vite)
export const img = (url, width = 1200) => {
  if (typeof url === 'string' && url.includes('squarespace-cdn')) return `${url}?format=${width}w`
  return url
}
