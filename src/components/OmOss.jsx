import { IMAGES, img } from '../assets/images'
import useContent from '../hooks/useContent'

export default function OmOss() {
  const c = useContent('omOssComp')

  return (
    <section id="om-oss" className="scroll-mt-28 py-24 lg:py-32 bg-white" aria-labelledby="om-oss-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
              {c.label}
            </span>
            <h2 id="om-oss-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight">
              {c.heading}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{c.p1}</p>
            <p className="text-gray-600 leading-relaxed mb-8">{c.p2}</p>

            {c.blockquote && (
              <blockquote className="mb-8 rounded-2xl border border-primary-100 bg-primary-50/40 p-5 text-sm leading-relaxed text-gray-700">
                "{c.blockquote.text}"
                <footer className="mt-3 font-semibold text-ink">— {c.blockquote.author}</footer>
              </blockquote>
            )}

            <div className="flex flex-wrap gap-8">
              {(c.stats || []).map((s, i) => (
                <div key={s.label}>
                  {i > 0 && <div className="hidden sm:block w-px bg-gray-100 absolute" />}
                  <div className="font-heading text-3xl font-bold text-primary-600">{s.value}</div>
                  <div className="text-gray-400 text-sm mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden shadow-lg row-span-2 relative group uppercase">
              <img
                src={img(IMAGES.teamGroup, 1200)}
                alt="Global Working-teamet"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-300" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg relative group">
              <img
                src={img(IMAGES.oficina, 800)}
                alt="Global Working-kontor"
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-300" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg bg-navy flex items-center justify-center p-6 text-center">
              <div className="text-white">
                <div className="font-heading text-4xl font-bold mb-1">{c.locationLabel}</div>
                <div className="text-blue-200 text-sm font-medium">{c.locationSub}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {(c.values || []).map((v) => (
            <div key={v.title} className="bg-surface rounded-2xl p-7 border border-gray-100 hover:shadow-md hover:border-primary-100 transition-all duration-300">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E73BE" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="font-heading text-lg font-bold text-ink mb-2">{v.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
