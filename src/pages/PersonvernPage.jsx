import useContent from '../hooks/useContent'
import LegalDocument from '../components/ui/LegalDocument'

/**
 * PersonvernPage — página legal.
 *
 * Las tres legales (personvern, vilkår, cookies) eran el mismo archivo copiado
 * tres veces: setenta y cinco líneas idénticas salvo la clave de contenido.
 * Ahora la estructura vive en `<LegalDocument>` y acá queda lo único que de
 * verdad distingue a esta página: de dónde sale su texto.
 */
export default function PersonvernPage() {
  const content = useContent('legalPersonvern')

  return <LegalDocument contentKey="legalPersonvern" content={content} />
}
