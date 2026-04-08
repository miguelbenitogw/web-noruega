// TODO: This component is currently not imported or rendered by any page.
// If it should appear on the site, import it in the appropriate page component.
import { IMAGES, img } from '../assets/images'
import useContent from '../hooks/useContent'
import EditableText from './editable/EditableText'

export default function Partners() {
  const c = useContent('partners')

  return (
    <section className="py-16 bg-white border-y border-gray-100 overflow-hidden" aria-label={c.heading}>
      <div className="container-xl px-4">
        <div className="text-center mb-10">
          <EditableText
            as="p"
            path="partners.label"
            value={c.label}
            className="text-primary-600 font-bold text-xs uppercase tracking-[0.2em] mb-3"
          />
          <EditableText
            as="h2"
            path="partners.heading"
            value={c.heading}
            className="font-heading text-3xl font-bold text-ink"
          />
        </div>

        <div className="space-y-12 max-w-5xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center transition-all duration-700">
              <img
                src={img(IMAGES.partnersRow1, 1400)}
                alt={c.row1Alt}
                className="w-full h-auto object-contain max-h-[120px] sm:max-h-[160px]"
                loading="lazy"
              />
            </div>
          </div>

          <div className="w-1/2 h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent mx-auto" />

          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center transition-all duration-700">
              <img
                src={img(IMAGES.partnersRow2, 1400)}
                alt={c.row2Alt}
                className="w-full h-auto object-contain max-h-[100px] sm:max-h-[140px]"
                loading="lazy"
              />
            </div>
            <EditableText
              as="p"
              path="partners.caption"
              value={c.caption}
              className="mt-6 text-gray-400 text-xs font-medium italic"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
