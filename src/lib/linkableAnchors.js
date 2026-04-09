const LINKABLE_PAGE_CATALOG = [
  {
    pageKey: 'home',
    label: 'Startside',
    path: '/',
    routeKeys: ['home', 'admin:landing'],
    anchors: [
      { id: 'nyheter-preview-heading', label: 'Nyheter · forhåndsvisning' },
    ],
  },
  {
    pageKey: 'nyheter',
    label: 'Nyhetsside',
    path: '/nyheter',
    routeKeys: ['nyheter', 'admin:nyheter'],
    anchors: [
      { id: 'nyheter', label: 'Nyheter · toppseksjon' },
      { id: 'nyheter-heading', label: 'Nyheter · overskrift' },
      { id: 'nyheter-arkiv', label: 'Nyheter · arkiv' },
    ],
  },
  {
    pageKey: 'helse',
    label: 'Helse',
    path: '/helse',
    routeKeys: ['helse', 'admin:helse'],
    anchors: [
      { id: 'helsesektor', label: 'Helse · sektor' },
      { id: 'helsesektor-heading', label: 'Helse · overskrift' },
      { id: 'hvagjor', label: 'Helse · hva gjør vi' },
      { id: 'hvagjor-heading', label: 'Helse · overskrift' },
      { id: 'faser-heading', label: 'Helse · faser' },
      { id: 'gode-grunner-heading', label: 'Helse · gode grunner' },
      { id: 'nyheter', label: 'Helse · nyheter' },
      { id: 'nyheter-heading', label: 'Helse · nyheter · overskrift' },
      { id: 'nyheter-arkiv', label: 'Helse · nyheter · arkiv' },
    ],
  },
  {
    pageKey: 'rekruttering',
    label: 'Rekrutteringsmodell',
    path: '/vr-rekrutteringsmodell',
    routeKeys: ['rekruttering', 'admin:rekruttering'],
    anchors: [
      { id: 'rekruttering', label: 'Rekruttering · seksjon' },
      { id: 'rekruttering-heading', label: 'Rekruttering · overskrift' },
    ],
  },
  {
    pageKey: 'spansk-i-alicante',
    label: 'Spansk i Alicante',
    path: '/spansk-i-alicante',
    routeKeys: ['spansk-i-alicante', 'admin:spansk-alicante'],
    anchors: [
      { id: 'spansk-alicante-process', label: 'Spansk i Alicante · prosess' },
    ],
  },
  {
    pageKey: 'kontakt',
    label: 'Kontakt',
    path: '/kontakt',
    routeKeys: ['kontakt', 'admin:kontakt'],
    anchors: [
      { id: 'kontakt', label: 'Kontakt · seksjon' },
      { id: 'kontakt-heading', label: 'Kontakt · overskrift' },
      { id: 'phone', label: 'Kontakt · telefon' },
      { id: 'message', label: 'Kontakt · melding' },
    ],
  },
  {
    pageKey: 'om-oss',
    label: 'Om oss',
    path: '/om-oss',
    routeKeys: ['om-oss', 'admin:om-oss'],
    anchors: [
      { id: 'om-oss', label: 'Om oss · seksjon' },
      { id: 'om-oss-faq', label: 'Om oss · FAQ' },
    ],
  },
  {
    pageKey: 'talentportalen',
    label: 'Talentportalen',
    path: '/talentportalen',
    routeKeys: ['talentportalen', 'admin:talentportalen'],
    anchors: [
      { id: 'talentportalen', label: 'Talentportalen · seksjon' },
      { id: 'talentportalen-heading', label: 'Talentportalen · overskrift' },
      { id: 'how-it-works-heading', label: 'Talentportalen · hvordan det fungerer' },
      { id: 'benefits-heading', label: 'Talentportalen · fordeler' },
    ],
  },
  {
    pageKey: 'personvern',
    label: 'Personvern',
    path: '/personvern',
    routeKeys: ['personvern', 'admin:personvern'],
    anchors: [],
  },
  {
    pageKey: 'vilkar',
    label: 'Vilkår',
    path: '/vilkar',
    routeKeys: ['vilkar', 'admin:vilkar'],
    anchors: [],
  },
  {
    pageKey: 'cookies',
    label: 'Cookies',
    path: '/cookies',
    routeKeys: ['cookies', 'admin:cookies'],
    anchors: [],
  },
]

const ROUTE_KEY_TO_PAGE_KEY = new Map([
  ['home', 'home'],
  ['admin:landing', 'home'],
  ['nyheter', 'nyheter'],
  ['admin:nyheter', 'nyheter'],
  ['helse', 'helse'],
  ['admin:helse', 'helse'],
  ['rekruttering', 'rekruttering'],
  ['admin:rekruttering', 'rekruttering'],
  ['spansk-i-alicante', 'spansk-i-alicante'],
  ['admin:spansk-alicante', 'spansk-i-alicante'],
  ['kontakt', 'kontakt'],
  ['admin:kontakt', 'kontakt'],
  ['om-oss', 'om-oss'],
  ['admin:om-oss', 'om-oss'],
  ['talentportalen', 'talentportalen'],
  ['admin:talentportalen', 'talentportalen'],
  ['personvern', 'personvern'],
  ['admin:personvern', 'personvern'],
  ['vilkar', 'vilkar'],
  ['admin:vilkar', 'vilkar'],
  ['cookies', 'cookies'],
  ['admin:cookies', 'cookies'],
])

const normalizeRouteKey = (routeKey) => {
  if (typeof routeKey !== 'string' || !routeKey.trim()) return null
  const trimmed = routeKey.trim()

  if (trimmed.startsWith('admin:article:') || trimmed.startsWith('news:')) {
    return 'article'
  }

  return ROUTE_KEY_TO_PAGE_KEY.get(trimmed) || null
}

const buildDestination = (pagePath, anchorId, isCurrentPage) => {
  if (!anchorId) return ''
  if (isCurrentPage) return `#${anchorId}`
  return pagePath === '/' ? `/#${anchorId}` : `${pagePath}#${anchorId}`
}

export const getLinkableAnchorGroups = ({ routeKey } = {}) => {
  const currentPageKey = normalizeRouteKey(routeKey)

  const sortedPages = [...LINKABLE_PAGE_CATALOG].sort((left, right) => {
    const leftIsCurrent = left.pageKey === currentPageKey
    const rightIsCurrent = right.pageKey === currentPageKey

    if (leftIsCurrent === rightIsCurrent) return 0
    return leftIsCurrent ? -1 : 1
  })

  return sortedPages
    .map((page) => {
      const isCurrentPage = page.pageKey === currentPageKey
      const anchors = page.anchors.map((anchor) => ({
        id: anchor.id,
        label: anchor.label,
        destination: buildDestination(page.path, anchor.id, isCurrentPage),
        pageKey: page.pageKey,
        pageLabel: page.label,
        pagePath: page.path,
        isCurrentPage,
      }))

      return {
        pageKey: page.pageKey,
        pageLabel: page.label,
        pagePath: page.path,
        isCurrentPage,
        anchors,
      }
    })
    .filter((page) => page.anchors.length > 0)
}

export const getLinkableAnchorOptions = ({ routeKey } = {}) => (
  getLinkableAnchorGroups({ routeKey }).flatMap((group) => group.anchors)
)

export const isValidInternalDestination = (value, { routeKey } = {}) => {
  const trimmed = `${value ?? ''}`.trim()
  if (!trimmed) return false
  if (/\s/.test(trimmed)) return false

  if (!trimmed.startsWith('#') && !trimmed.startsWith('/')) {
    return false
  }

  return getLinkableAnchorOptions({ routeKey }).some((option) => option.destination === trimmed)
}

