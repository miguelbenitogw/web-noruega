import useContent from '../hooks/useContent'
import LegalDocument from '../components/ui/LegalDocument'

/**
 * VilkarPage — página legal.
 *
 * Misma estructura de documento que Personvern y Cookies, y por eso ya no la
 * escribe: la pone `<LegalDocument>`.
 */
export default function VilkarPage() {
  const content = useContent('legalVilkar')

  return <LegalDocument content={content} />
}
