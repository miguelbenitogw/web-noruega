import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { trackEvent } from '../lib/analytics'
import FormField from './ui/FormField'
import FormAlert from './ui/FormAlert'

/**
 * Formulario de candidatos.
 *
 * La subida del CV se eliminó al desconectar Supabase: el archivo iba a un
 * bucket `cv-uploads` de Supabase Storage y el correo solo llevaba el enlace.
 * Ahora el candidato manda el CV por correo. Si en algún momento se quiere
 * recuperar el adjunto sin volver a Supabase, EmailJS admite adjuntos en sus
 * planes de pago.
 *
 * Diseño: antes era un bloque centrado (`max-w-2xl mx-auto`, todo el texto al
 * medio) con el panel flotando en `shadow-xl rounded-3xl`, pestañas con
 * `shadow-sm` y un círculo verde con un tic al enviar. Ahora la banda navy se
 * reparte en dos columnas —el porqué a la izquierda, el formulario a la
 * derecha— y la jerarquía la dan el tono y el filete.
 *
 * La protección antibot (honeypot `website`, `MIN_FORM_FILL_MS`, rate limit)
 * no se toca: es lógica, no diseño.
 */

const EMAILJS_SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const isEmailConfigured = Boolean(EMAILJS_SERVICE && EMAILJS_TEMPLATE && EMAILJS_PUBLIC)

const CV_EMAIL = 'kontakt@globalworking.no'

const BOT_GUARD_KEY = 'gw_kandidat_rate_limit_v1'
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3
const MIN_FORM_FILL_MS = 3000

const TABS = [
  { key: 'kandidat', label: 'Spørsmål' },
  { key: 'vil_jobbe', label: 'Søknad' },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validate = (f) => {
  const next = {}
  if (!f.from_name.trim()) next.from_name = 'Fyll inn navnet ditt.'
  if (!f.from_email.trim()) next.from_email = 'Fyll inn e-postadressen din.'
  else if (!EMAIL_PATTERN.test(f.from_email.trim())) next.from_email = 'Skriv inn en gyldig e-postadresse.'
  if (!f.message.trim()) next.message = 'Skriv en kort melding til oss.'
  return next
}

export default function KandidatKontakt() {
  const [form, setForm] = useState({
    from_name: '',
    from_email: '',
    phone: '',
    message: '',
    type: 'kandidat',
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

    if (form.website.trim()) {
      setStatus('sent')
      trackEvent('kandidat_blocked_bot', { reason: 'honeypot' })
      return
    }

    if (Date.now() - formOpenedAtRef.current < MIN_FORM_FILL_MS) {
      setStatus('rate_limited')
      trackEvent('kandidat_blocked_bot', { reason: 'too_fast' })
      return
    }

    // El formulario lleva `noValidate`, así que `required` no comprobaba nada
    // por sí solo. Se valida después de las trampas antibot y antes del rate
    // limit, para no gastar un intento por un campo vacío.
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
        trackEvent('kandidat_blocked_bot', { reason: 'rate_limit' })
        return
      }

      recent.push(now)
      localStorage.setItem(BOT_GUARD_KEY, JSON.stringify(recent))
    } catch {
      // Storage unavailable — continue
    }

    setStatus('sending')

    if (!isEmailConfigured) {
      setStatus('error')
      trackEvent('kandidat_error', { reason: 'missing_emailjs_config' })
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
          type: form.type === 'vil_jobbe' ? 'Vil jobbe' : 'Kandidat',
          // La plantilla de EmailJS sigue esperando esta variable: se conserva
          // con el mismo texto que ya usaba cuando no había adjunto.
          cv_url: 'Ingen CV lastet opp',
        },
        EMAILJS_PUBLIC,
      )

      setStatus('sent')
      trackEvent('kandidat_submit', { contact_type: form.type })
      trackEvent('generate_lead', { lead_type: form.type, method: 'kandidat_form' })
    } catch (err) {
      console.error('KandidatKontakt send error:', err)
      setStatus('error')
      trackEvent('kandidat_error', { reason: 'send_failed', contact_type: form.type })
    }
  }

  const reset = () => {
    setStatus('idle')
    setErrors({})
    setForm({ from_name: '', from_email: '', phone: '', message: '', type: 'kandidat', website: '' })
    formOpenedAtRef.current = Date.now()
  }

  return (
    <section
      id="kandidat-kontakt"
      className="scroll-mt-28 py-20 lg:py-28 bg-navy"
      aria-labelledby="kandidat-kontakt-heading"
    >
      <div className="container-xl">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* La columna de la izquierda son tres líneas (235 px) contra un
              formulario de 752: con `items-start` quedaban 518 px de banda
              navy vacía al lado del formulario, el 69 % de la fila. Es el
              mismo problema que la foto vino a tapar en «Vårt tilbud».

              No hace falta inventar nada para resolverlo: el bloque de FAQ ya
              tenía la respuesta de esta casa —`lg:sticky lg:top-28`—. El
              título acompaña al formulario mientras se rellena en vez de
              quedarse arriba mirando al techo, y el hueco desaparece porque
              deja de haberlo: la columna corta viaja. */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <span className="gw-label text-white">Kontakt oss</span>
            <h2
              id="kandidat-kontakt-heading"
              className="mt-5 text-display-sm font-semibold text-white"
            >
              Klar for en ny mulighet?
            </h2>
            <p className="mt-6 gw-measure text-primary-100 text-body leading-[1.65]">
              Enten du er kandidat eller ønsker å jobbe — fyll ut skjemaet, så tar vi kontakt.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="bg-white rounded-panel border border-line p-7 lg:p-9">
              {status === 'sent' ? (
                <div className="py-6" role="status" aria-live="polite">
                  <h3 className="font-heading text-[1.375rem] font-semibold text-navy">
                    Takk for henvendelsen!
                  </h3>
                  <p className="mt-3 text-ink-muted leading-[1.65]">
                    Vi kontakter deg innen 1 virkedag.
                  </p>
                  <button
                    onClick={reset}
                    type="button"
                    className="mt-6 font-ui text-sm font-semibold text-primary-600 transition-colors hover:text-navy cursor-pointer"
                  >
                    Send ny melding
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Kandidat kontaktskjema">
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

                  {/* Dos caminos, un control. Pastilla plana: el seleccionado
                      se distingue por tono, no por sombra. */}
                  <div
                    className="flex gap-1 rounded-pill border border-line bg-frost p-1"
                    role="group"
                    aria-label="Type henvendelse"
                  >
                    {TABS.map(t => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, type: t.key }))}
                        className={`flex-1 rounded-pill py-2.5 font-ui text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                          form.type === t.key
                            ? 'bg-navy text-white'
                            : 'text-ink-muted hover:text-navy'
                        }`}
                        aria-pressed={form.type === t.key}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <FormField
                    id="kandidat_from_name"
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
                    id="kandidat_from_email"
                    name="from_email"
                    type="email"
                    label="E-postadresse *"
                    required
                    autoComplete="email"
                    value={form.from_email}
                    onChange={handleChange}
                    placeholder="ola@eksempel.no"
                    error={errors.from_email}
                  />

                  <FormField
                    id="kandidat_phone"
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
                    id="kandidat_message"
                    name="message"
                    label="Melding *"
                    rows={5}
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder={form.type === 'vil_jobbe'
                      ? 'Fortell oss om din erfaring og hva du ser etter...'
                      : 'Skriv inn dine spørsmål til oss...'}
                    error={errors.message}
                  />

                  {/* El CV ya no se sube: va por correo. El aviso se queda,
                      pero como nota bajo filete, no como caja de alerta. */}
                  {form.type === 'vil_jobbe' && (
                    <div className="gw-panel border-line px-5 py-4">
                      <p className="font-ui text-[0.875rem] text-ink-muted leading-relaxed">
                        Send CV-en din til{' '}
                        <a
                          href={`mailto:${CV_EMAIL}`}
                          className="font-semibold text-primary-600 underline decoration-primary-200 underline-offset-4 transition-colors hover:text-navy hover:decoration-navy"
                        >
                          {CV_EMAIL}
                        </a>
                        .
                      </p>
                    </div>
                  )}

                  {/* El único naranja de la pantalla. */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="gw-btn gw-btn-ember w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? 'Sender...' : 'Send melding'}
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
