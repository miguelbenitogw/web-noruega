import useContent from '../hooks/useContent'
import LegalDocument from '../components/ui/LegalDocument'

/**
 * KvalitetspolicyPage — la política de calidad, en texto plano.
 *
 * Es la traducción de globalworking.net/politica-de-calidad/ (no hay versión
 * noruega oficial). Va sin sello de TÜV NORD: la empresa decidió no usar el
 * logo en la web noruega, así que la certificación se cuenta solo con texto.
 */
export default function KvalitetspolicyPage() {
  const content = useContent('legalKvalitetspolicy')

  return <LegalDocument content={content} />
}
