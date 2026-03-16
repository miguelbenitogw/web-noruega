import { IMAGES, img } from '../assets/images'

export default function Partners() {
  return (
    <section className="py-16 bg-white border-y border-gray-100 overflow-hidden" aria-label="Vi jobber med">
      <div className="container-xl px-4">
        <div className="text-center mb-10">
          <p className="text-primary-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">
            Samarbeidspartnere
          </p>
          <h2 className="font-heading text-3xl font-bold text-ink">Vi jobber med</h2>
        </div>

        <div className="space-y-12 max-w-5xl mx-auto">
          {/* Fila 1: Partneres de Salud y Selección */}
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center transition-all duration-700">
              <img
                src={img(IMAGES.partnersRow1, 1400)}
                alt="Health and Recruitment Partners"
                className="w-full h-auto object-contain max-h-[120px] sm:max-h-[160px]"
                loading="lazy"
              />
            </div>
          </div>

          <div className="w-1/2 h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent mx-auto" />

          {/* Fila 2: Municipios Noruegos (Kommuner) */}
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center transition-all duration-700">
              <img
                src={img(IMAGES.partnersRow2, 1400)}
                alt="Norwegian Municipalities Partners"
                className="w-full h-auto object-contain max-h-[100px] sm:max-h-[140px]"
                loading="lazy"
              />
            </div>
            <p className="mt-6 text-gray-400 text-xs font-medium italic">
              Vi samarbeider med en rekke norske kommuner og helseforetak over hele landet.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
