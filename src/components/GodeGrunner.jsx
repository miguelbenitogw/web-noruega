import { IMAGES, img } from '../assets/images'
import AnimateIn from './AnimateIn'

const testimonials = [
  {
    quote:
      'Vi har vært veldig fornøyd med to av våre sykepleiere fra Spania. Språket var mye bedre enn forventet, og de passet godt inn hos oss.',
    author: 'Karin, Åmot kommune',
  },
  {
    quote:
      'Vi fant en god løsning med å la en sykepleier jobbe i helsefagarbeider-stilling til hun var bedre i språket. Tre-fire uker etterpå var hun klar til å jobbe fast som sykepleier hos oss.',
    author: 'Daniel, Kautokeino kommune',
  },
  {
    quote:
      'Vi var veldig glade for å få en sykepleier fra Italia som en del av teamet vårt. Han lærte seg språket fort når han begynte å jobbe.',
    author: 'Anne, Trondheim kommune',
  },
]

export default function GodeGrunner() {
  return (
    <section className="py-24 lg:py-32 bg-surface" aria-labelledby="gode-grunner-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-14">
          <AnimateIn variant="fadeRight">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={img(IMAGES.rekruttering, 900)}
                alt="Global Working samarbeid med norske kommuner"
                className="w-full object-cover"
                loading="lazy"
                width="640"
                height="450"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 via-transparent to-transparent" aria-hidden="true"/>
            </div>
          </AnimateIn>

          <div>
            <AnimateIn>
              <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                Et samarbeid som gir nye løsninger
              </span>
              <h2 id="gode-grunner-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight">
                Hva sier kommunene vi samarbeider med?
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Mangelen på helsepersonell kombinert med sykefravær og permisjoner gjør det nødvendig å finne varige løsninger på arbeidskraft for å gi pasientene oppfølgingen de trenger.
              </p>
              <a
                href="/nyheter/sor-fron-integrasjon"
                className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Les artikkel
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </AnimateIn>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <AnimateIn key={t.author} variant="fadeUp" delay={i * 100}>
              <article className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-600 text-sm leading-relaxed mb-5">“{t.quote}”</p>
                <p className="font-semibold text-ink text-sm">— {t.author}</p>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
