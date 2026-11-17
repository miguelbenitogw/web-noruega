import useContent from '../hooks/useContent'
import LegalDocument from '../components/ui/LegalDocument'

/**
 * CookiesPage — página legal.
 *
 * Misma estructura de documento que Personvern y Vilkår, y por eso ya no la
 * escribe: la pone `<LegalDocument>`.
 */
export default function CookiesPage() {
  const content = useContent('legalCookies')

  return <LegalDocument content={content} />
}
