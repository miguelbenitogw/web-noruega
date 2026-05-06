import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import AnimateIn from './AnimateIn'
import { trackEvent } from '../lib/analytics'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient'

const EMAILJS_SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const isEmailConfigured = Boolean(EMAILJS_SERVICE && EMAILJS_TEMPLATE && EMAILJS_PUBLIC)

const CV_BUCKET = 'cv-uploads'
const CV_MAX_SIZE_BYTES = 5 * 1024 * 1024
const CV_ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const CV_ALLOWED_EXTENSIONS = '.pdf,.doc,.docx'

const BOT_GUARD_KEY = 'gw_kandidat_rate_limit_v1'
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3
const MIN_FORM_FILL_MS = 3000

const TABS = [
  { key: 'kandidat', label: 'Kandidat' },
  { key: 'vil_jobbe', label: 'Vil jobbe' },
]

async function uploadCvToStorage(file) {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase ikke konfigurert')

  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
  const uuid = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const path = `${new Date().toISOString().slice(0, 10)}/${uuid}.${ext}`

  const { data, error } = await client.storage
    .from(CV_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) throw error

  const { data: urlData } = client.storage.from(CV_BUCKET).getPublicUrl(data?.path || path)
  return urlData?.publicUrl || null
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
  const [cvFile, setCvFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [cvError, setCvError] = useState('')
  const formOpenedAtRef = useRef(0)
  const fileInputRef = useRef(null)

  useEffect(() => {
    formOpenedAtRef.current = Date.now()
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleCvChange = (e) => {
    setCvError('')
    const file = e.target.files?.[0]
    if (!file) {
      setCvFile(null)
      return
    }

    if (!CV_ALLOWED_TYPES.includes(file.type)) {
      setCvError('Kun PDF- og Word-filer er tillatt.')
      setCvFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > CV_MAX_SIZE_BYTES) {
      setCvError('Filen er for stor. Maks 5 MB.')
      setCvFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setCvFile(file)
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
      let cvUrl = ''

      if (form.type === 'vil_jobbe' && cvFile) {
        if (!isSupabaseConfigured) {
          setStatus('error')
          trackEvent('kandidat_error', { reason: 'missing_supabase_config' })
          return
        }
        cvUrl = await uploadCvToStorage(cvFile)
      }

      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          from_name: form.from_name,
          from_email: form.from_email,
          phone: form.phone,
          message: form.message,
          type: form.type === 'vil_jobbe' ? 'Vil jobbe' : 'Kandidat',
          cv_url: cvUrl || 'Ingen CV lastet opp',
        },
        EMAILJS_PUBLIC,
      )

      setStatus('sent')
      trackEvent('kandidat_submit', { contact_type: form.type, has_cv: Boolean(cvUrl) })
      trackEvent('generate_lead', { lead_type: form.type, method: 'kandidat_form' })
    } catch (err) {
      console.error('KandidatKontakt send error:', err)
      setStatus('error')
      trackEvent('kandidat_error', { reason: 'send_failed', contact_type: form.type })
    }
  }

  const reset = () => {
    setStatus('idle')
    setCvFile(null)
    setCvError('')
    setForm({ from_name: '', from_email: '', phone: '', message: '', type: 'kandidat', website: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
    formOpenedAtRef.current = Date.now()
  }

  return (
    <section id="kandidat-kontakt" className="scroll-mt-28 py-24 lg:py-28 bg-gradient-to-br from-navy via-primary-900 to-primary-800 overflow-hidden">
      <div className="container-xl">
        <AnimateIn>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block text-blue-200 font-semibold text-sm tracking-wide uppercase mb-3">
                Kontakt oss
              </span>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                Klar for en ny mulighet?
              </h2>
              <p className="text-blue-100/90 text-lg leading-relaxed">
                Enten du er kandidat eller ønsker å jobbe — fyll ut skjemaet, så tar vi kontakt.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-10">
              {status === 'sent' ? (
                <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-green-500">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
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

                  <div className="flex bg-surface rounded-xl p-1 gap-1" role="group" aria-label="Type henvendelse">
                    {TABS.map(t => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, type: t.key }))}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                          form.type === t.key ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-ink'
                        }`}
                        aria-pressed={form.type === t.key}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label htmlFor="kandidat_from_name" className="block text-sm font-medium text-ink mb-1.5">Fullt navn *</label>
                    <input
                      id="kandidat_from_name"
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
                    <label htmlFor="kandidat_from_email" className="block text-sm font-medium text-ink mb-1.5">E-postadresse *</label>
                    <input
                      id="kandidat_from_email"
                      name="from_email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.from_email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-ink placeholder-gray-400 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      placeholder="ola@eksempel.no"
                    />
                  </div>

                  <div>
                    <label htmlFor="kandidat_phone" className="block text-sm font-medium text-ink mb-1.5">Telefon</label>
                    <input
                      id="kandidat_phone"
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
                    <label htmlFor="kandidat_message" className="block text-sm font-medium text-ink mb-1.5">Melding *</label>
                    <textarea
                      id="kandidat_message"
                      name="message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-ink placeholder-gray-400 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                      placeholder={form.type === 'vil_jobbe' ? 'Fortell oss om din erfaring og hva du ser etter...' : 'Fortell oss om ditt behov...'}
                    />
                  </div>

                  {form.type === 'vil_jobbe' && (
                    <div>
                      <label htmlFor="kandidat_cv" className="block text-sm font-medium text-ink mb-1.5">
                        Last opp CV <span className="text-gray-400 font-normal">(PDF eller Word, maks 5 MB)</span>
                      </label>
                      <div className="relative">
                        <input
                          ref={fileInputRef}
                          id="kandidat_cv"
                          type="file"
                          accept={CV_ALLOWED_EXTENSIONS}
                          onChange={handleCvChange}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 file:cursor-pointer file:transition-colors"
                        />
                      </div>
                      {cvFile && (
                        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(1)} MB)
                        </p>
                      )}
                      {cvError && (
                        <p className="mt-1.5 text-xs text-red-600">{cvError}</p>
                      )}
                    </div>
                  )}

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
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
