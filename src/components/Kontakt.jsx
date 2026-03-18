import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import AnimateIn from './AnimateIn'
import { trackEvent } from '../lib/analytics'
import { IMAGES, img } from '../assets/images'

const EMAILJS_SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const isEmailConfigured = Boolean(EMAILJS_SERVICE && EMAILJS_TEMPLATE && EMAILJS_PUBLIC)
const BOT_GUARD_KEY = 'gw_contact_rate_limit_v1'
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3
const MIN_FORM_FILL_MS = 3000

const contacts = [
  {
    name: 'Miriam Svendsen',
    email: 'Miriam.Svendsen@globalworking.net',
    phone: '+47 919 00 649',
    role: 'Rekrutteringsansvarlig',
  },
  {
    name: 'Gro Anette',
    email: 'Gro.anette@globalworking.net',
    phone: '+47 408 98 448',
    role: 'Kandidatoppfølging',
  },
]

export default function Kontakt() {
  const [form, setForm] = useState({
    from_name: '',
    from_email: '',
    phone: '',
    message: '',
    type: 'arbeidsgiver',
    website: '',
  })
  const [status, setStatus] = useState('idle')
  const formOpenedAtRef = useRef(0)

  useEffect(() => {
    formOpenedAtRef.current = Date.now()
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Honeypot: real users never fill this hidden field.
    if (form.website.trim()) {
      setStatus('sent')
      trackEvent('contact_blocked_bot', { reason: 'honeypot' })
      return
    }

    // Bots often submit unrealistically fast.
    if (Date.now() - formOpenedAtRef.current < MIN_FORM_FILL_MS) {
      setStatus('rate_limited')
      trackEvent('contact_blocked_bot', { reason: 'too_fast' })
      return
    }

    try {
      const now = Date.now()
      const saved = localStorage.getItem(BOT_GUARD_KEY)
      const entries = saved ? JSON.parse(saved) : []
      const recent = entries.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS)

      if (recent.length >= RATE_LIMIT_MAX) {
        setStatus('rate_limited')
        trackEvent('contact_blocked_bot', { reason: 'rate_limit' })
        return
      }

      recent.push(now)
      localStorage.setItem(BOT_GUARD_KEY, JSON.stringify(recent))
    } catch (storageError) {
      console.warn('Bot guard storage unavailable:', storageError)
    }

    setStatus('sending')

    if (!isEmailConfigured) {
      setStatus('error')
      trackEvent('contact_error', { reason: 'missing_emailjs_config' })
      return
    }

    try {
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          from_name: form.from_name,
          from_email: form.from_email,
          phone: form.phone,
          message: form.message,
          type: form.type,
        },
        EMAILJS_PUBLIC,
      )
      setStatus('sent')
      trackEvent('contact_submit', { contact_type: form.type })
      trackEvent('generate_lead', {
        lead_type: form.type,
        method: 'contact_form',
      })
    } catch (err) {
      console.error('EmailJS error:', err)
      setStatus('error')
      trackEvent('contact_error', { reason: 'send_failed', contact_type: form.type })
    }
  }

  const reset = () => {
    setStatus('idle')
    setForm({ from_name: '', from_email: '', phone: '', message: '', type: 'arbeidsgiver', website: '' })
    formOpenedAtRef.current = Date.now()
  }

  return (
    <section id="kontakt" className="scroll-mt-28 py-24 lg:py-32 bg-surface overflow-hidden" aria-labelledby="kontakt-heading">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <AnimateIn variant="fadeRight">
            <div className="space-y-12">
              <div>
                <span className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3">
                  Kontakt
                </span>
                <h2 id="kontakt-heading" className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-5 leading-tight">
                  Ønsker du å vite mer?
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Du treffer oss på e-post eller telefon, eller ved å fylle ut skjemaet under. Vi tar kontakt så snart vi har mulighet.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {contacts.map(c => (
                  <div key={c.name} className="glass-card bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-200">
                        <span className="font-heading font-bold text-white text-lg">{c.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-heading font-bold text-ink text-sm mb-0.5">{c.name}</div>
                        <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">{c.role}</div>
                        <div className="space-y-1">
                          <a href={`mailto:${c.email}`} className="text-primary-600 text-xs hover:underline flex items-center gap-2">
                            {c.email}
                          </a>
                          <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="text-gray-500 text-xs hover:text-primary-600 transition-colors flex items-center gap-2">
                            {c.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="group relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                <img
                  src={img(IMAGES.alicanteOffice, 1200)}
                  alt="Global Working-kontoret i Alicante"
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/40 to-transparent flex flex-col justify-end p-8">
                  <div className="text-white">
                    <h4 className="font-heading font-bold text-xl mb-1">Hovedkontor Alicante</h4>
                    <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
                      Carrer de Periodista Pirula Arderius, 4, 03001 Alicante, España
                    </p>
                    <a
                      href="https://maps.google.com/?q=Global+Working+Alicante"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-wider text-white hover:text-blue-200 transition-colors"
                    >
                      Se i Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>

          <AnimateIn variant="fadeLeft" delay={150}>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-10">
              {status === 'sent' ? (
                <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
                  <h3 className="font-heading text-xl font-bold text-ink">Takk for henvendelsen!</h3>
                  <p className="text-gray-500 leading-relaxed">Vi kontakter deg innen 1 virkedag.</p>
                  <button
                    onClick={reset}
                    className="mt-2 text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors cursor-pointer"
                  >
                    Send ny melding
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Kontaktskjema">
                  <div>
                    <p className="font-heading font-bold text-ink text-xl mb-1">Send oss en melding</p>
                    <p className="text-gray-400 text-sm">Vi svarer normalt innen 1 virkedag.</p>
                  </div>

                  {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3" role="alert">
                      {isEmailConfigured
                        ? 'Noe gikk galt. Prøv igjen eller kontakt oss direkte per e-post.'
                        : 'Kontaktskjema er midlertidig utilgjengelig. Kontakt oss direkte på e-post eller telefon.'}
                    </div>
                  )}
                  {status === 'rate_limited' && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3" role="alert">
                      For mange forsøk på kort tid. Vent litt og prøv igjen.
                    </div>
                  )}

                  <input type="hidden" name="type" value={form.type} />
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    autoComplete="off"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute -left-[9999px] opacity-0 pointer-events-none"
                  />
                  <div className="flex bg-surface rounded-xl p-1 gap-1" role="group" aria-label="Type henvendelse">
                    {['arbeidsgiver', 'kandidat'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 cursor-pointer ${
                          form.type === t ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-ink'
                        }`}
                        aria-pressed={form.type === t}
                      >
                        {t === 'arbeidsgiver' ? 'Arbeidsgiver' : 'Kandidat'}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label htmlFor="from_name" className="block text-sm font-medium text-ink mb-1.5">Fullt navn *</label>
                    <input
                      id="from_name"
                      name="from_name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.from_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-ink placeholder-gray-400 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      placeholder="Ola Nordmann"
                    />
                  </div>

                  <div>
                    <label htmlFor="from_email" className="block text-sm font-medium text-ink mb-1.5">E-postadresse *</label>
                    <input
                      id="from_email"
                      name="from_email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.from_email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-ink placeholder-gray-400 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      placeholder="ola@bedrift.no"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-ink mb-1.5">Telefon</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-ink placeholder-gray-400 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      placeholder="+47 000 00 000"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-ink mb-1.5">Melding *</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-ink placeholder-gray-400 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                      placeholder="Fortell oss om ditt behov..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? 'Sender...' : 'Send melding'}
                  </button>
                </form>
              )}
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}

