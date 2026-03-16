// Images from Global Working's Squarespace (Norge) and WordPress (main) sites
const CDN = 'https://images.squarespace-cdn.com/content/v1'
const OLD = `${CDN}/5ec321c2af33de48734cc929`
const NEW = `${CDN}/699f19dee84d12556ca836b0`
const WP  = 'https://globalworking.net/wp-content/uploads'

export const IMAGES = {
  // Logo oficial (blanco monocromatico - Squarespace)
  logo: `${NEW}/de82e965-5e6b-4ae6-8bdc-2df50a14bc7d/GlobalWorking-monocromatico-blanco.png`,

  // Logo color (WordPress)
  logoColor: `${WP}/2025/12/cropped-GlobalWorking-Logotipo-Principal-vertical-cuadrado-scaled-1.jpg`,

  // Fotos de personas / fondo (portfolio original)
  peopleHero:    `${OLD}/1615224238156-OY2QGA6E03LY3JALP4NL/Rectangle+16.jpg`,
  peopleTeam1:   `${OLD}/1615224412523-SZYXMKS44H8QE5OK3RZP/Rectangle+17.jpg`,
  peopleTeam2:   `${OLD}/1615224431317-5MY8W6DHU2C1N8K4V902/Rectangle+18.jpg`,
  peopleCTA:     `${OLD}/1615224521708-2NJ8JNMIYIPO2KCL1RU2/Rectangle+16.jpg`,

  // Screenshots de la plataforma / capturas de contenido actual (Squarespace)
  platformHero:  `${NEW}/6ad4318b-849b-4578-93da-9d23c07a46b2/Screenshot+2026-02-26+at+15.58.15.png`,
  helsesektor:   `${NEW}/a00ac4da-b7a3-4ada-a655-84cb442ef431/Screenshot+2026-02-26+at+16.20.14.png`,
  rekruttering:  `${NEW}/f4402b3e-c62e-468a-a054-9d8f375df5e2/Screenshot+2026-02-26+at+17.52.20.png`,
  partner1:      `${NEW}/daa93884-fbf5-4659-b78c-124a0ccb6d3c/Screenshot+2026-02-26+at+18.15.19.png`,
  partner2:      `${NEW}/54a26273-89d1-48c9-8404-f1dc25e3df48/Screenshot+2026-02-26+at+18.28.39.png`,
  omOss1:        `${NEW}/a9bc873b-c7a6-4d48-a550-b69907729127/Screenshot+2026-02-27+at+10.43.30.png`,
  omOss2:        `${NEW}/7a7c6e81-e17d-44e5-b62b-0257b043f23e/Screenshot+2026-02-26+at+17.51.02.png`,

  // Fotos reales de globalworking.net (WordPress)
  ceoPhoto:     `${WP}/elementor/thumbs/Pablo-CEO-Global-Working-scaled-qdzm8bgkyj7fl9de66fkip6zayvldart6ymyu2gae8.webp`,
  claseNoruego: `${WP}/2023/03/Clase-de-noruego-en-Global-Working-1024x682.webp`,
  oficina:      `${WP}/2023/06/Oficina-Global-Working-1-1024x768.webp`,
  alicanteOffice: `https://globalworking.net/wp-content/uploads/2023/06/Oficinas-Global-Working-scaled.webp`,
  teamGroup:    `https://globalworking.net/wp-content/uploads/2025/02/Global-Working-preparate-para-trabajar-en-Europa-1-1-scaled.webp`,
  enfermeria:   `${WP}/2023/06/Journees-de-lemployabilite-soins-infirmiers.webp`,
  empresas:     `${WP}/2024/10/Empresas-con-las-que-trabajamos_Mesa-de-trabajo-1-1024x89.webp`,
  partnersRow1: `https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/daa93884-fbf5-4659-b78c-124a0ccb6d3c/Screenshot+2026-02-26+at+18.15.19.png`,
  partnersRow2: `https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/54a26273-89d1-48c9-8404-f1dc25e3df48/Screenshot+2026-02-26+at+18.28.39.png`,
}

// Helper para obtener tamaño optimizado de Squarespace CDN
export const img = (url, width = 1200) => {
  if (url.includes('squarespace-cdn')) return `${url}?format=${width}w`
  return url // WordPress images ya tienen tamaño en el filename
}
