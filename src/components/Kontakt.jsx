import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { trackEvent } from '../lib/analytics'
import { IMAGES, img } from '../assets/images'
import useContent from '../hooks/useContent'
import FormField from './ui/FormField'
import FormAlert from './ui/FormAlert'
import TextLink from './ui/TextLink'
import RichText from './ui/RichText'
import EmailText from './ui/EmailText'

/**
 * Kontakt — el formulario del empleador noruego.
 *
 * Lo que se tiró:
 *  · Las fichas de contacto eran `glass-card bg-white/70 backdrop-blur-md`
 *    con `hover:shadow-lg`. Cristal esmerilado sobre un fondo plano no
 *    difumina nada: es una tarjeta blanca más caro de pintar.
 *  · La foto del contacto crecía de 48 a 160 px al hacerle clic, con
 *    `shadow-2xl` y `hover:scale-110`. Un juguete en un formulario de trabajo.
 *  · La foto de la oficina llevaba un degradado navy encima para poder
 *    escribir la dirección. La dirección es texto; la foto se ve entera.
 *  · El panel del formulario flotaba con `shadow-xl` y `rounded-3xl`.
 *
 * Lo que se añadió: validación con mensajes legibles (no solo borde rojo),
 * `aria-invalid` / `aria-describedby` por campo y un aviso de envío anunciado
 * por lector de pantalla. La protección antibot no se toca.
 */

const miriamPhoto = IMAGES.contactMiriam
const groPhoto = IMAGES.contactGro

const resolveContactPhoto = (contact = {}) => {
  if (contact.imageUrl) return contact.imageUrl
  const lower = String(contact.name || '').toLowerCase()
  if (lower.includes('miriam')) return miriamPhoto
  if (lower.includes('gro')) return groPhoto
  return null
}

const EMAILJS_SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const isEmailConfigured = Boolean(EMAILJS_SERVICE && EMAILJS_TEMPLATE && EMAILJS_PUBLIC)
const BOT_GUARD_KEY = 'gw_contact_rate_limit_v1'
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3
const MIN_FORM_FILL_MS = 3000

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validate = (f) => {
  const next = {}
  if (!f.from_name.trim()) next.from_name = 'Fyll inn navnet ditt.'
  if (!f.from_email.trim()) next.from_email = 'Fyll inn e-postadressen din.'
  else if (!EMAIL_PATTERN.test(f.from_email.trim())) next.from_email = 'Skriv inn en gyldig e-postadresse.'
  if (!f.message.trim()) next.message = 'Skriv en kort melding til oss.'
  return next
}

export default function Kontakt() {
  const contacts = useContent('contacts')
  const c = useContent('kontaktComp')
  const [form, setForm] = useState({
    from_name: '',
    from_email: '',
    phone: '',
    message: '',
    type: 'arbeidsgiver',
    website: '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const formOpenedAtRef = useRef(0)

  useEffect(() => {
    formOpenedAtRef.current = Date.now()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(prev => (prev[name] ? { ...prev, [name]: undefined } : prev))
    // El aviso de «revisá los campos marcados» desaparece en cuanto se corrige.
    setStatus(s => (s === 'invalid' ? 'idle' : s))
  }

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

    // Validación propia: el formulario lleva `noValidate`, así que sin esto
    // el navegador no comprobaba nada y `required` era decorativo.
    // Va después de las trampas antibot y antes del rate limit, para no
    // gastarle un intento a quien solo se dejó un campo sin rellenar.
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setStatus('invalid')
      return
    }
    setErrors({})

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
    setErrors({})
    setForm({ from_name: '', from_email: '', phone: '', message: '', type: 'arbeidsgiver', website: '' })
    formOpenedAtRef.current = Date.now()
  }

  return (
    <section
      id="kontakt"
      className="scroll-mt-28 py-20 lg:py-28 bg-surface"
      aria-labelledby="kontakt-heading"
    >
      <div className="container-xl">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ── Con quién hablás ───────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <span className="gw-label text-primary-600">{c.label}</span>
            <h2 id="kontakt-heading" className="mt-5 text-display-sm font-semibold text-navy">{c.heading}</h2>
            <RichText
              value={c.description}
              className="mt-6 text-ink-muted text-body leading-[1.6]"
            />

            {/* Si la promesa es «hablás con una persona», la persona se ve. */}
            <div className="mt-10 grid sm:grid-cols-2 gap-5">
              {(contacts || []).map((contact) => (
                <div key={contact.name} className="gw-panel bg-white border-line p-6">
                  {resolveContactPhoto(contact) ? (
                    <img
                      src={img(resolveContactPhoto(contact), 192)}
                      alt={contact.name}
                      className="w-16 h-16 rounded-pill object-cover object-top mb-4"
                      loading="lazy"
                      decoding="async"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-pill bg-navy flex items-center justify-center mb-4">
                      <span className="font-heading font-semibold text-white text-xl">
                        {contact.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="font-heading font-semibold text-navy leading-snug">{contact.name}</div>
                  <div className="mt-0.5 gw-meta">{contact.role}</div>

                  {/* El correo y el teléfono son, en un móvil, los dos únicos
                      gestos que importan de esta ficha: abren el cliente de
                      correo y marcan. Medían 22,4 px de alto —la mitad del
                      mínimo táctil—, así que se les da altura propia de 44 px
                      en vez de dejarlos a la altura de su línea de texto. El
                      `flex items-center` mantiene el texto donde estaba. */}
                  <div className="mt-4 pt-4 border-t border-line">
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex min-h-[44px] items-center font-ui text-body-xs text-primary-600 transition-colors hover:text-navy"
                    >
                      <EmailText email={contact.email} />
                    </a>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, '')}`}
                      className="flex min-h-[44px] items-center font-ui text-body-xs text-ink-muted tabular-nums transition-colors hover:text-primary-600"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* La sede: foto entera y la dirección como dato, bajo filete. */}
            <div className="mt-10">
              <img
                src={img(c.imageUrl || IMAGES.alicanteOffice, 1200)}
                alt={c.imageAlt || 'Global Working-kontoret i Alicante'}
                className="w-full h-56 lg:h-64 object-cover rounded-panel"
                loading="lazy"
                decoding="async"
              />
              <div className="mt-5 pt-5 border-t border-line">
                <h3 className="font-heading text-body font-semibold text-navy">{c.officeTitle}</h3>
                <RichText
                  value={c.officeAddress}
                  className="mt-1.5 font-ui text-sm text-ink-muted leading-relaxed"
                />
                <TextLink
                  href="https://maps.google.com/?q=Avenida+de+la+Albufereta+44+Alicante"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4"
                >
                  {c.mapsLabel}
                </TextLink>
              </div>
            </div>
          </div>

          {/* ── El formulario ──────────────────────────────────────────── */}
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="bg-white rounded-panel border border-line p-7 lg:p-9">
              {status === 'sent' ? (
                <div className="py-6" role="status" aria-live="polite">
                  <h3 className="font-heading text-[1.375rem] font-semibold text-navy">
                    {c.successTitle}
                  </h3>
                  <p className="mt-3 text-ink-muted leading-[1.6]">{c.successDescription}</p>
                  <button
                    onClick={reset}
                    type="button"
                    className="mt-6 font-ui text-sm font-semibold text-primary-600 transition-colors hover:text-navy cursor-pointer"
                  >
                    {c.successReset}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Kontaktskjema">
                  <div className="pb-5 border-b border-line">
                    <p className="font-heading text-[1.25rem] font-semibold text-navy">{c.formTitle}</p>
                    <p className="mt-1.5 font-ui text-sm text-ink-soft">{c.formSubtitle}</p>
                  </div>

                  {status === 'error' && (
                    <FormAlert>
                      {isEmailConfigured
                        ? 'Noe gikk galt. Prøv igjen eller kontakt oss direkte per e-post.'
                        : 'Kontaktskjema er midlertidig utilgjengelig. Kontakt oss direkte på e-post eller telefon.'}
                    </FormAlert>
                  )}
                  {status === 'rate_limited' && (
                    <FormAlert tone="warn">
                      For mange forsøk på kort tid. Vent litt og prøv igjen.
                    </FormAlert>
                  )}
                  {status === 'invalid' && (
                    <FormAlert>
                      Sjekk de merkede feltene og prøv igjen.
                    </FormAlert>
                  )}

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

                  <FormField
                    id="from_name"
                    name="from_name"
                    label="Fullt navn *"
                    required
                    autoComplete="name"
                    value={form.from_name}
                    onChange={handleChange}
                    placeholder="Ola Nordmann"
                    error={errors.from_name}
                  />

                  <FormField
                    id="from_email"
                    name="from_email"
                    type="email"
                    label="E-postadresse *"
                    required
                    autoComplete="email"
                    value={form.from_email}
                    onChange={handleChange}
                    placeholder="ola@bedrift.no"
                    error={errors.from_email}
                  />

                  <FormField
                    id="phone"
                    name="phone"
                    type="tel"
                    label="Telefon"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+47 000 00 000"
                    error={errors.phone}
                  />

                  <FormField
                    id="message"
                    name="message"
                    label="Melding *"
                    rows={5}
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Fortell oss om ditt behov..."
                    error={errors.message}
                  />

                  {/* El único naranja de la pantalla: el botón que importa. */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="gw-btn gw-btn-ember w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? c.sendingLabel : c.submitLabel}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
