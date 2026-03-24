import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { writeContentOverrides, clearContentOverrides } from '../lib/contentOverrides'
import defaultContent from '../data/siteContent'
import useContent from '../hooks/useContent'
import useAuth from '../hooks/useAuth'
import { canCurrentUserEditContent as canEditContentByPolicy, saveContentSnapshot } from '../lib/contentRemote'
import useTemplates from '../hooks/useTemplates'
import useTemplateContent from '../hooks/useTemplateContent'
import ContentEntityManager from '../components/admin/ContentEntityManager'

const resolveAdminAuthMode = () => {
  const configured = String(import.meta.env.VITE_ADMIN_AUTH_MODE || '').trim().toLowerCase()
  if (configured === 'local' && import.meta.env.DEV) return 'local'
  return 'supabase'
}

const ADMIN_AUTH_MODE = resolveAdminAuthMode()

// Security constants
const MAX_ATTEMPTS    = 5
const LOCKOUT_MS      = 30 * 60 * 1000   // 30 min lockout after MAX_ATTEMPTS
const SESSION_MS      = 60 * 60 * 1000   // 60 min idle timeout
const RATE_KEY        = 'gw_admin_rate_v2'
const SESSION_KEY     = 'gw_admin_sess_v2'

// PBKDF2 - 200 000 iterations (computationally expensive for attackers)
async function pbkdf2Hash(password) {
  const SALT = import.meta.env.VITE_ADMIN_SALT || 'gw-static-salt-v1'
  const enc  = new TextEncoder()
  const key  = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(SALT), iterations: 200_000, hash: 'SHA-256' },
    key, 256
  )
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function getRateState() {
  try { return JSON.parse(localStorage.getItem(RATE_KEY)) || { attempts: 0, lockedUntil: 0 } }
  catch { return { attempts: 0, lockedUntil: 0 } }
}
function setRateState(s) { localStorage.setItem(RATE_KEY, JSON.stringify(s)) }

function isSessionValid() {
  try {
    const d = sessionStorage.getItem(SESSION_KEY)
    if (!d) return false
    return Date.now() - JSON.parse(d).ts < SESSION_MS
  } catch { return false }
}
function touchSession() {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }))
}
function clearSession() { sessionStorage.removeItem(SESSION_KEY) }

function getErrorMessage(error) {
  if (!error) return 'Ukjent feil'
  if (typeof error === 'string') return error
  return error.message || error.error_description || 'Ukjent feil'
}

function Field({ label, hint, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
        {label}
        {hint && <span className="ml-1 text-gray-400 normal-case font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-all'

function TextInput({ value, onChange, placeholder }) {
  return <input className={inputCls} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
}

function Textarea({ value, onChange, rows = 3 }) {
  return <textarea className={`${inputCls} resize-none`} value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} />
}

function JsonEditor({ value, onChange }) {
  const [error, setError] = useState(null)
  const [raw, setRaw] = useState(() => JSON.stringify(value, null, 2))

  function handleChange(text) {
    setRaw(text)
    try {
      const parsed = JSON.parse(text)
      setError(null)
      onChange(parsed)
    } catch {
      setError('JSON invÃ¡lido')
    }
  }

  return (
    <div>
      <textarea
        className={`${inputCls} font-mono text-xs resize-y`}
        value={raw}
        onChange={e => handleChange(e.target.value)}
        rows={8}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function StringListEditor({ items, onChange }) {
  return (
    <div className="space-y-2">
      {(items || []).map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={`${inputCls} flex-1`}
            value={item}
            onChange={e => onChange(items.map((v, j) => j === i ? e.target.value : v))}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="px-2 text-red-400 hover:text-red-600 transition-colors"
            title="Fjern"
          >Ã—</button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...(items || []), ''])}
        className="text-primary-600 text-xs font-semibold hover:underline"
      >+ Legg til</button>
    </div>
  )
}

// â”€â”€â”€ Section Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-heading font-bold text-ink text-base">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function JsonPreview({ value }) {
  return (
    <pre className="rounded-xl bg-slate-950 text-slate-100 p-4 text-xs font-mono overflow-auto max-h-80 whitespace-pre-wrap break-words">
      {JSON.stringify(value ?? {}, null, 2)}
    </pre>
  )
}

function TemplatesEditor() {
  const { templates, loading, error } = useTemplates()
  const [selectedKey, setSelectedKey] = useState('')

  const selectedTemplate = useMemo(() => {
    if (!templates.length) return null
    return templates.find((template) => template.key === selectedKey) || templates[0]
  }, [selectedKey, templates])

  const { resolvedContent, isValid, issues } = useTemplateContent({
    template: selectedTemplate,
    content: {},
  })

  return (
    <>
      <Section title="Templates">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm text-gray-600 font-medium">Aktive templates</p>
            <p className="text-xs text-gray-400">Base for fremtidig template-drevet redigering.</p>
          </div>
          <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
            {templates.length} aktive
          </span>
        </div>

        {loading && <p className="mt-4 text-sm text-gray-500">Laster templates...</p>}

        {error && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error.message}
          </div>
        )}

        {!loading && !error && templates.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">Ingen aktive templates ble funnet.</p>
        )}

        <div className="mt-4 grid gap-2">
          {templates.map((template) => (
            <button
              key={template.key}
              type="button"
              onClick={() => setSelectedKey(template.key)}
              className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                selectedTemplate?.key === template.key
                  ? 'border-primary-200 bg-primary-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-sm text-ink">{template.name}</span>
                <span className="text-[11px] font-mono text-gray-400">{template.key}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-500">
                <span>{template.contentType}</span>
                <span>•</span>
                <span>{template.locale}</span>
                {template.isStarter && <span>• starter</span>}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {selectedTemplate && (
        <Section title={`Preview: ${selectedTemplate.name}`}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <Field label="schema">
                <JsonPreview value={selectedTemplate.schema} />
              </Field>
            </div>
            <div>
              <Field label="defaults">
                <JsonPreview value={selectedTemplate.defaults} />
              </Field>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <Field label="resolvedContent" hint="defaults + content">
                <JsonPreview value={resolvedContent} />
              </Field>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                <p className="font-semibold text-ink">Validation</p>
                <p className="mt-1">{isValid ? 'Template shape ser grei ut.' : 'Template shape mangler minimumskrav.'}</p>
              </div>
              {!isValid && issues.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-semibold">Issues</p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    {issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Section>
      )}
    </>
  )
}

// â”€â”€â”€ Section Editors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function HeroEditor({ draft, update }) {
  const s = draft.hero || {}
  const up = (k, v) => update('hero', k, v)
  return (
    <>
      <Section title="Tekster">
        <Field label="Badge-tekst"><TextInput value={s.badge} onChange={v => up('badge', v)} /></Field>
        <Field label="Tittel â€“ del 1"><TextInput value={s.h1First} onChange={v => up('h1First', v)} /></Field>
        <Field label="Tittel â€“ fremhevet ord"><TextInput value={s.h1Highlight} onChange={v => up('h1Highlight', v)} /></Field>
        <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} rows={4} /></Field>
        <Field label="Knapp 1 (CTA)"><TextInput value={s.cta1} onChange={v => up('cta1', v)} /></Field>
        <Field label="Knapp 2"><TextInput value={s.cta2} onChange={v => up('cta2', v)} /></Field>
      </Section>
      <Section title="Statistikkbokser (4 tall)">
        <Field label="JSON" hint="array av { value, label, animate }">
          <JsonEditor value={s.stats} onChange={v => up('stats', v)} />
        </Field>
      </Section>
    </>
  )
}

function ContactsEditor({ draft, update }) {
  const s = draft.contacts || []
  return (
    <Section title="Kontaktpersoner (vises pÃ¥ forside og kontaktside)">
      <Field label="JSON" hint="array av { name, role, email, phone }">
        <JsonEditor value={s} onChange={v => update('contacts', null, v)} />
      </Field>
    </Section>
  )
}

function HomeServicesEditor({ draft, update }) {
  const s = draft.homeServices || {}
  const up = (k, v) => update('homeServices', k, v)
  return (
    <>
      <Section title="Overskrift">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
        <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
      </Section>
      <Section title="Tjenestekort (4 kort)">
        <Field label="JSON" hint="array av { title, description, href }">
          <JsonEditor value={s.sections} onChange={v => up('sections', v)} />
        </Field>
      </Section>
    </>
  )
}

function HomeStatsEditor({ draft, update }) {
  const s = draft.homeStats || []
  return (
    <Section title="Statistikk (3 tall under helse-seksjon)">
      <Field label="JSON" hint="array av { value, label }">
        <JsonEditor value={s} onChange={v => update('homeStats', null, v)} />
      </Field>
    </Section>
  )
}

function HomeHealthEditor({ draft, update }) {
  const s = draft.homeHealth || {}
  const up = (k, v) => update('homeHealth', k, v)
  return (
    <Section title="Helse-fremhevet (mÃ¸rk seksjon pÃ¥ forside)">
      <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
      <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
      <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
      <Field label="CTA-knapp"><TextInput value={s.cta} onChange={v => up('cta', v)} /></Field>
    </Section>
  )
}

function PageHeroEditor({ sectionKey, title, draft, update }) {
  const s = draft[sectionKey] || {}
  const up = (k, v) => update(sectionKey, k, v)
  return (
    <Section title={title}>
      <Field label="Sidetittel (H1)"><TextInput value={s.h1} onChange={v => up('h1', v)} /></Field>
      <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
    </Section>
  )
}

function RekrutteringCollabEditor({ draft, update }) {
  const s = draft.rekrutteringCollab || {}
  const up = (k, v) => update('rekrutteringCollab', k, v)
  return (
    <Section title="Samarbeidsmodell-seksjon">
      <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
      <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
      <Field label="Avsnitt 1"><Textarea value={s.p1} onChange={v => up('p1', v)} /></Field>
      <Field label="Avsnitt 2"><Textarea value={s.p2} onChange={v => up('p2', v)} /></Field>
      <Field label="Avsnitt 3"><Textarea value={s.p3} onChange={v => up('p3', v)} /></Field>
      <Field label="CTA 1"><TextInput value={s.cta1} onChange={v => up('cta1', v)} /></Field>
      <Field label="CTA 2"><TextInput value={s.cta2} onChange={v => up('cta2', v)} /></Field>
    </Section>
  )
}

function HelsePhasesEditor({ draft, update }) {
  const s = draft.helsePhases || {}
  const up = (k, v) => update('helsePhases', k, v)
  return (
    <>
      <Section title="Overskrift for faser">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
        <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
      </Section>
      <Section title="Faser (3 faser)">
        <Field label="JSON" hint="array av { number, title, description, formats }">
          <JsonEditor value={s.phases} onChange={v => up('phases', v)} />
        </Field>
      </Section>
    </>
  )
}

function HelsePartnershipEditor({ draft, update }) {
  const s = draft.helsePartnership || {}
  const up = (k, v) => update('helsePartnership', k, v)
  return (
    <Section title="Samarbeidsmodell (Helse-side)">
      <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
      <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
      <Field label="Avsnitt 1"><Textarea value={s.p1} onChange={v => up('p1', v)} /></Field>
      <Field label="Avsnitt 2"><Textarea value={s.p2} onChange={v => up('p2', v)} /></Field>
      <Field label="CTA 1"><TextInput value={s.cta1} onChange={v => up('cta1', v)} /></Field>
      <Field label="CTA 2"><TextInput value={s.cta2} onChange={v => up('cta2', v)} /></Field>
    </Section>
  )
}

function OmOssTeamEditor({ draft, update }) {
  const s = draft.omOssTeam || {}
  const up = (k, v) => update('omOssTeam', k, v)
  return (
    <>
      <Section title="Overskrift">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
        <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
      </Section>
      <Section title="Teammedlemmer">
        <Field label="JSON" hint="array av { initials, name, role, hasImage }">
          <JsonEditor value={s.members} onChange={v => up('members', v)} />
        </Field>
      </Section>
    </>
  )
}

function OmOssOfficesEditor({ draft, update }) {
  const s = draft.omOssOffices || {}
  const up = (k, v) => update('omOssOffices', k, v)
  return (
    <Section title="Kontor-seksjon">
      <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
      <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
      <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
      <Field label="Kontornavn"><TextInput value={s.officeName} onChange={v => up('officeName', v)} /></Field>
      <Field label="Adresse"><TextInput value={s.officeAddress} onChange={v => up('officeAddress', v)} /></Field>
    </Section>
  )
}

function TalentportalenStepsEditor({ draft, update }) {
  const s = draft.talentportalenSteps || {}
  const up = (k, v) => update('talentportalenSteps', k, v)
  return (
    <>
      <Section title="Overskrift">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
      </Section>
      <Section title="Steg (4 steg)">
        <Field label="JSON" hint="array av { number, title, desc }">
          <JsonEditor value={s.steps} onChange={v => up('steps', v)} />
        </Field>
      </Section>
    </>
  )
}

function TalentportalenBenefitsEditor({ draft, update }) {
  const s = draft.talentportalenBenefits || {}
  const up = (k, v) => update('talentportalenBenefits', k, v)
  return (
    <>
      <Section title="Overskrift">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
      </Section>
      <Section title="Fordeler (liste med hakemerker)">
        <Field label="Elementer">
          <StringListEditor items={s.items} onChange={v => up('items', v)} />
        </Field>
      </Section>
    </>
  )
}

function HvaGjorEditor({ draft, update }) {
  const s = draft.hvaGjor || {}
  const up = (k, v) => update('hvaGjor', k, v)
  return (
    <>
      <Section title="Overskrift">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
        <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
        <Field label="CTA-knapp"><TextInput value={s.ctaLabel} onChange={v => up('ctaLabel', v)} /></Field>
        <Field label="CTA-notat"><TextInput value={s.ctaNote} onChange={v => up('ctaNote', v)} /></Field>
      </Section>
      <Section title="Tjenester (3 kort)">
        <Field label="JSON" hint="array av { title, description }">
          <JsonEditor value={s.services} onChange={v => up('services', v)} />
        </Field>
      </Section>
    </>
  )
}

function RekrutteringCompEditor({ draft, update }) {
  const s = draft.rekrutteringComp || {}
  const up = (k, v) => update('rekrutteringComp', k, v)
  return (
    <>
      <Section title="Overskrift">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
        <Field label="Avsnitt 1"><Textarea value={s.p1} onChange={v => up('p1', v)} /></Field>
        <Field label="Avsnitt 2"><Textarea value={s.p2} onChange={v => up('p2', v)} /></Field>
        <Field label="Badge"><TextInput value={s.badge} onChange={v => up('badge', v)} /></Field>
      </Section>
      <Section title="Sektorer">
        <Field label="Liste (Ã©n per linje)">
          <StringListEditor items={s.sectors} onChange={v => up('sectors', v)} />
        </Field>
      </Section>
      <Section title="Steg (4 steg)">
        <Field label="JSON" hint="array av { title, description }">
          <JsonEditor value={s.steps} onChange={v => up('steps', v)} />
        </Field>
      </Section>
    </>
  )
}

function HelsesektorCompEditor({ draft, update }) {
  const s = draft.helsesektorComp || {}
  const up = (k, v) => update('helsesektorComp', k, v)
  return (
    <>
      <Section title="Overskrift og tekst">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
        <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
        <Field label="Sitat"><Textarea value={s.blockquote?.text} onChange={v => up('blockquote', { ...s.blockquote, text: v })} /></Field>
        <Field label="Sitat â€“ forfatter"><TextInput value={s.blockquote?.author} onChange={v => up('blockquote', { ...s.blockquote, author: v })} /></Field>
        <Field label="CTA-knapp"><TextInput value={s.ctaLabel} onChange={v => up('ctaLabel', v)} /></Field>
        <Field label="Grupper (tall)"><TextInput value={s.groupsValue} onChange={v => up('groupsValue', v)} /></Field>
        <Field label="Grupper (etikett)"><TextInput value={s.groupsLabel} onChange={v => up('groupsLabel', v)} /></Field>
      </Section>
      <Section title="Statistikk (3 tall)">
        <Field label="JSON" hint="array av { value, label }">
          <JsonEditor value={s.stats} onChange={v => up('stats', v)} />
        </Field>
      </Section>
      <Section title="Funksjoner (4 elementer)">
        <Field label="JSON" hint="array av { title, description }">
          <JsonEditor value={s.features} onChange={v => up('features', v)} />
        </Field>
      </Section>
    </>
  )
}

function OmOssCompEditor({ draft, update }) {
  const s = draft.omOssComp || {}
  const up = (k, v) => update('omOssComp', k, v)
  return (
    <>
      <Section title="Tekster">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
        <Field label="Avsnitt 1"><Textarea value={s.p1} onChange={v => up('p1', v)} /></Field>
        <Field label="Avsnitt 2"><Textarea value={s.p2} onChange={v => up('p2', v)} /></Field>
        <Field label="Sitat"><Textarea value={s.blockquote?.text} onChange={v => up('blockquote', { ...s.blockquote, text: v })} /></Field>
        <Field label="Sitat â€“ forfatter"><TextInput value={s.blockquote?.author} onChange={v => up('blockquote', { ...s.blockquote, author: v })} /></Field>
        <Field label="Lokasjon-etikett"><TextInput value={s.locationLabel} onChange={v => up('locationLabel', v)} /></Field>
        <Field label="Lokasjon-undertekst"><TextInput value={s.locationSub} onChange={v => up('locationSub', v)} /></Field>
      </Section>
      <Section title="Statistikk (3 tall)">
        <Field label="JSON" hint="array av { value, label }">
          <JsonEditor value={s.stats} onChange={v => up('stats', v)} />
        </Field>
      </Section>
      <Section title="Verdier (3 kort)">
        <Field label="JSON" hint="array av { title, desc }">
          <JsonEditor value={s.values} onChange={v => up('values', v)} />
        </Field>
      </Section>
    </>
  )
}

function TalentportalenCompEditor({ draft, update }) {
  const s = draft.talentportalenComp || {}
  const up = (k, v) => update('talentportalenComp', k, v)
  return (
    <>
      <Section title="Tekster">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
        <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
        <Field label="Portal-URL"><TextInput value={s.portalUrl} onChange={v => up('portalUrl', v)} /></Field>
        <Field label="CTA â€“ Logg inn"><TextInput value={s.ctaLogin} onChange={v => up('ctaLogin', v)} /></Field>
        <Field label="CTA â€“ Kontakt"><TextInput value={s.ctaContact} onChange={v => up('ctaContact', v)} /></Field>
      </Section>
      <Section title="Fordeler (4 elementer)">
        <Field label="JSON" hint="array av { title, desc }">
          <JsonEditor value={s.benefits} onChange={v => up('benefits', v)} />
        </Field>
      </Section>
    </>
  )
}

function GodeGrunnerEditor({ draft, update }) {
  const s = draft.godeGrunner || {}
  const up = (k, v) => update('godeGrunner', k, v)
  return (
    <>
      <Section title="Tekster">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
        <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
        <Field label="Artikkellenke"><TextInput value={s.articleLink} onChange={v => up('articleLink', v)} /></Field>
        <Field label="Artikkellenke-tekst"><TextInput value={s.articleLinkLabel} onChange={v => up('articleLinkLabel', v)} /></Field>
      </Section>
      <Section title="Sitater (3 sitater)">
        <Field label="JSON" hint="array av { quote, author }">
          <JsonEditor value={s.testimonials} onChange={v => up('testimonials', v)} />
        </Field>
      </Section>
    </>
  )
}

function CtaBannerEditor({ draft, update }) {
  const s = draft.ctaBanner || {}
  const up = (k, v) => update('ctaBanner', k, v)
  return (
    <Section title="CTA-banner (mÃ¸rk seksjon med bilde)">
      <Field label="Badge"><TextInput value={s.badge} onChange={v => up('badge', v)} /></Field>
      <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
      <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
      <Field label="Knapp 1"><TextInput value={s.cta1} onChange={v => up('cta1', v)} /></Field>
      <Field label="Knapp 2"><TextInput value={s.cta2} onChange={v => up('cta2', v)} /></Field>
    </Section>
  )
}

function FaqEditor({ draft, update }) {
  const s = draft.faq || {}
  const up = (k, v) => update('faq', k, v)
  return (
    <>
      <Section title="Overskrift">
        <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
        <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
        <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
        <Field label="Lenketekst"><TextInput value={s.ctaText} onChange={v => up('ctaText', v)} /></Field>
      </Section>
      <Section title="SpÃ¸rsmÃ¥l og svar">
        <Field label="JSON" hint="array av { q, a }">
          <JsonEditor value={s.items} onChange={v => up('items', v)} />
        </Field>
      </Section>
    </>
  )
}

function NavbarEditor({ draft, update }) {
  const s = draft.navbar || {}
  const up = (k, v) => update('navbar', k, v)
  return (
    <>
      <Section title="Navigasjonslenker">
        <Field label="JSON" hint="array av { label, href }">
          <JsonEditor value={s.links} onChange={v => up('links', v)} />
        </Field>
      </Section>
      <Section title="CTA-knapp">
        <Field label="Knapp-tekst"><TextInput value={s.ctaLabel} onChange={v => up('ctaLabel', v)} /></Field>
      </Section>
    </>
  )
}

function FooterEditor({ draft, update }) {
  const s = draft.footer || {}
  const up = (k, v) => update('footer', k, v)
  return (
    <>
      <Section title="Beskrivelse">
        <Field label="Beskrivelse under logo"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
      </Section>
      <Section title="Sosiale lenker">
        <Field label="JSON" hint="array av { label, href }">
          <JsonEditor value={s.social} onChange={v => up('social', v)} />
        </Field>
      </Section>
      <Section title="Lenkekolonner">
        <Field label="JSON" hint="{ Tjenester, Selskapet, Kontakt } â€“ array av { label, href }">
          <JsonEditor value={s.links} onChange={v => up('links', v)} />
        </Field>
      </Section>
    </>
  )
}

function KontaktCompEditor({ draft, update }) {
  const s = draft.kontaktComp || {}
  const up = (k, v) => update('kontaktComp', k, v)
  return (
    <Section title="Kontaktseksjon">
      <Field label="Etikett"><TextInput value={s.label} onChange={v => up('label', v)} /></Field>
      <Field label="Overskrift"><TextInput value={s.heading} onChange={v => up('heading', v)} /></Field>
      <Field label="Beskrivelse"><Textarea value={s.description} onChange={v => up('description', v)} /></Field>
      <Field label="Kontor-tittel"><TextInput value={s.officeTitle} onChange={v => up('officeTitle', v)} /></Field>
      <Field label="Kontor-adresse"><TextInput value={s.officeAddress} onChange={v => up('officeAddress', v)} /></Field>
    </Section>
  )
}

// â”€â”€â”€ Navigation Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const NAV_GROUPS = [
  {
    title: 'Generelt',
      items: [
        { id: 'hero', label: 'Hero (Forside)' },
        { id: 'contacts', label: 'Kontaktpersoner' },
        { id: 'ctaBanner', label: 'CTA Banner' },
        { id: 'templates', label: 'Templates' },
        { id: 'pages', label: 'Pages' },
        { id: 'news', label: 'News' },
      ],
    },
  {
    title: 'Forside',
    items: [
      { id: 'homeServices', label: 'Tjenester' },
      { id: 'homeStats', label: 'Statistikk' },
      { id: 'homeHealth', label: 'Helse-highlight' },
      { id: 'homeContact', label: 'Hurtigkontakt' },
    ],
  },
  {
    title: 'Sider',
    items: [
      { id: 'rekrutteringHero', label: 'Rekruttering â€“ Hero' },
      { id: 'rekrutteringCollab', label: 'Rekruttering â€“ Samarbeid' },
      { id: 'helseHero', label: 'Helse â€“ Hero' },
      { id: 'helsePhases', label: 'Helse â€“ Faser' },
      { id: 'helsePartnership', label: 'Helse â€“ Samarbeid' },
      { id: 'omOssHero', label: 'Om Oss â€“ Hero' },
      { id: 'omOssTeam', label: 'Om Oss â€“ Team' },
      { id: 'omOssOffices', label: 'Om Oss â€“ Kontorer' },
      { id: 'talentportalenHero', label: 'Talentportalen â€“ Hero' },
      { id: 'talentportalenSteps', label: 'Talentportalen â€“ Steg' },
      { id: 'talentportalenBenefits', label: 'Talentportalen â€“ Fordeler' },
      { id: 'kontaktHero', label: 'Kontakt â€“ Hero' },
      { id: 'nyheterHero', label: 'Nyheter â€“ Hero' },
    ],
  },
  {
    title: 'Seksjoner',
    items: [
      { id: 'hvaGjor', label: 'Hva GjÃ¸r Vi' },
      { id: 'rekrutteringComp', label: 'Rekrutteringsmodell' },
      { id: 'helsesektorComp', label: 'Helsesektor' },
      { id: 'omOssComp', label: 'Om Oss' },
      { id: 'talentportalenComp', label: 'Talentportalen' },
      { id: 'godeGrunner', label: 'Gode Grunner' },
      { id: 'faq', label: 'FAQ' },
      { id: 'kontaktComp', label: 'Kontaktskjema' },
    ],
  },
  {
    title: 'Navigasjon',
    items: [
      { id: 'navbar', label: 'Toppmeny' },
      { id: 'footer', label: 'Bunntekst' },
    ],
  },
]

// â”€â”€â”€ Main Admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LoginPage({ onLogin, password, setPassword, email, setEmail, authMode, errorMsg, loading, lockedUntil }) {
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!lockedUntil) return
    const tick = () => {
      const secs = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
      setCountdown(secs)
      if (secs === 0) clearInterval(id)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lockedUntil])

  const isLocked = countdown > 0
  const mins = Math.ceil(countdown / 60)

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink">Administrasjon</h1>
          <p className="text-gray-400 text-sm mt-1">Global Working Norge</p>
        </div>

        {isLocked ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-700 font-semibold text-sm">Tilgang blokkert</p>
            <p className="text-red-500 text-xs mt-1">
              PrÃ¸v igjen om {mins > 1 ? `${mins} minutter` : `${countdown} sekunder`}
            </p>
          </div>
        ) : (
          <form onSubmit={onLogin} className="space-y-4" autoComplete="off">
            {authMode === 'supabase' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">E-post</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Passord</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                autoComplete="current-password"
                autoFocus={authMode !== 'supabase'}
                disabled={loading}
              />
              {errorMsg && <p className="text-red-500 text-xs mt-1.5">{errorMsg}</p>}
            </div>
            {authMode === 'supabase' && (
              <p className="text-gray-400 text-xs leading-relaxed">
                Logg inn med Supabase-brukeren din. Du mÃ¥ ha editor- eller admin-tilgang for Ã¥ redigere innhold.
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !password || (authMode === 'supabase' && !email)}
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Verifisererâ€¦
                </>
              ) : 'Logg inn'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function AuthLoadingPage({ message }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm text-center">
        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
          <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-bold text-ink">Administrasjon</h1>
        <p className="text-gray-400 text-sm mt-2">{message}</p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  // Prevent search engines from indexing the admin panel
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]')
    if (meta) meta.setAttribute('content', 'noindex, nofollow')
    else {
      const m = document.createElement('meta')
      m.name = 'robots'
      m.content = 'noindex, nofollow'
      document.head.appendChild(m)
    }
    return () => {
      const m = document.querySelector('meta[name="robots"]')
      if (m) m.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    }
  }, [])

  const authMode = ADMIN_AUTH_MODE
  const { session, loading: authLoading, isConfigured: supabaseConfigured, signInWithPassword, signOut } = useAuth()
  const [authed, setAuthed] = useState(() => authMode === 'local' && isSessionValid())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [lockedUntil, setLockedUntil] = useState(() => getRateState().lockedUntil)
  const [activeSection, setActiveSection] = useState('hero')
  const [saveState, setSaveState] = useState({ kind: 'idle', message: '' })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasLocalEdits, setHasLocalEdits] = useState(false)
  const [supabaseAuthorized, setSupabaseAuthorized] = useState(false)
  const [supabaseAccessLoading, setSupabaseAccessLoading] = useState(false)
  const importRef = useRef(null)

  const currentContent = useContent()
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(currentContent)))
  const isSaving = saveState.kind === 'saving'
  const saveSucceeded = saveState.kind === 'success'

  const handleLogout = useCallback(() => {
    clearSession()
    setAuthed(false)
    setSupabaseAuthorized(false)
    setSupabaseAccessLoading(false)
    setPassword('')
    setEmail('')
    setLoginError('')
    setHasLocalEdits(false)
    if (authMode === 'supabase') {
      void signOut()
    }
  }, [authMode, signOut])

  useEffect(() => {
    if (authMode !== 'local' || !authed) return
    if (hasLocalEdits) return
    setDraft(JSON.parse(JSON.stringify(currentContent)))
  }, [authed, authMode, currentContent, hasLocalEdits])

  // Session activity refresh + idle timeout check
  useEffect(() => {
    if (authMode !== 'local' || !authed) return
    const refresh = () => touchSession()
    const checkIdle = () => { if (!isSessionValid()) handleLogout() }
    window.addEventListener('mousemove', refresh)
    window.addEventListener('keydown', refresh)
    const interval = setInterval(checkIdle, 60_000)
    return () => {
      window.removeEventListener('mousemove', refresh)
      window.removeEventListener('keydown', refresh)
      clearInterval(interval)
    }
  }, [authed, authMode, handleLogout])

  useEffect(() => {
    if (authMode !== 'supabase') return
    if (!session) {
      setSupabaseAuthorized(false)
      setSupabaseAccessLoading(false)
      return
    }

    let cancelled = false
    setSupabaseAuthorized(false)
    setSupabaseAccessLoading(true)

    ;(async () => {
      try {
        const allowed = await canEditContentByPolicy()
        if (cancelled) return
        if (allowed) {
          setSupabaseAuthorized(true)
          return
        }
        setLoginError('Kontoen har ikke editor- eller admin-tilgang.')
        void signOut()
      } catch (error) {
        if (cancelled) return
        setLoginError('Kunne ikke verifisere tilgang: ' + getErrorMessage(error))
        void signOut()
      } finally {
        if (!cancelled) setSupabaseAccessLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [authMode, session, signOut])

  useEffect(() => {
    if (authMode !== 'supabase') return
    if (!supabaseConfigured) {
      setLoginError('Supabase auth er ikke konfigurert. Sett VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY.')
    }
  }, [authMode, supabaseConfigured])

  async function handleLogin(e) {
    e.preventDefault()
    const rate = getRateState()

    // Check lockout
    if (Date.now() < rate.lockedUntil) {
      setLockedUntil(rate.lockedUntil)
      return
    }

    setLoginLoading(true)
    setLoginError('')

    try {
      if (authMode === 'supabase') {
        const signInEmail = email.trim()
        if (!signInEmail) {
          setLoginError('Skriv inn e-postadressen din.')
          return
        }

        const { error } = await signInWithPassword({
          email: signInEmail,
          password,
        })

        if (error) {
          const attempts = rate.attempts + 1
          const lock = attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
          setRateState({ attempts, lockedUntil: lock })
          setLockedUntil(lock)
          const left = MAX_ATTEMPTS - attempts
          setLoginError(lock
            ? 'Tilgang blokkert i 30 minutter.'
            : getErrorMessage(error) + '. ' + left + ' fors?k gjenst?r.'
          )
          setPassword('')
          return
        }

        setRateState({ attempts: 0, lockedUntil: 0 })
        setPassword('')
        setEmail('')
        return
      }

      const hash = await pbkdf2Hash(password)
      const storedHash = import.meta.env.VITE_ADMIN_HASH
      const fallback   = import.meta.env.VITE_ADMIN_PASSWORD

      let ok = false
      if (storedHash) {
        ok = hash === storedHash
      } else if (fallback) {
        // Fallback: plaintext comparison (dev only - set VITE_ADMIN_HASH in production)
        ok = password === fallback
        if (ok && import.meta.env.DEV) {
          console.info('[Admin] Configura VITE_ADMIN_HASH con este valor para mayor seguridad:\n' + hash)
        }
      } else {
        // Nothing configured
        setLoginError('Admin no est? configurado. Consulta la documentaci?n.')
        setLoginLoading(false)
        return
      }

      if (ok) {
        setRateState({ attempts: 0, lockedUntil: 0 })
        touchSession()
        setPassword('')
        setAuthed(true)
      } else {
        const attempts = rate.attempts + 1
        const lock = attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
        setRateState({ attempts, lockedUntil: lock })
        setLockedUntil(lock)
        const left = MAX_ATTEMPTS - attempts
        setLoginError(lock
          ? 'Tilgang blokkert i 30 minutter.'
          : 'Feil passord. ' + left + ' fors?k gjenst?r.'
        )
        setPassword('')
      }
    } finally {
      setLoginLoading(false)
    }
  }

  function update(sectionKey, fieldKey, value) {
    setDraft(prev => {
      if (fieldKey === null) {
        return { ...prev, [sectionKey]: value }
      }
      return { ...prev, [sectionKey]: { ...prev[sectionKey], [fieldKey]: value } }
    })
    setHasLocalEdits(true)
    setSaveState({ kind: 'idle', message: '' })
  }

  async function handleSave() {
    const snapshot = JSON.parse(JSON.stringify(draft))
    writeContentOverrides(snapshot)
    touchSession()
    setSaveState({ kind: 'saving', message: 'Lagrer endringer...' })

    if (authMode !== 'supabase') {
      setHasLocalEdits(false)
      setSaveState({ kind: 'success', message: 'Lokal lagring oppdatert.' })
      setTimeout(() => setSaveState({ kind: 'idle', message: '' }), 2500)
      return
    }

    try {
      if (!session) {
        throw new Error('Du m? v?re logget inn for ? synkronisere innhold.')
      }

      const allowed = await canEditContentByPolicy()
      if (!allowed) {
        throw new Error('Kontoen har ikke editor- eller admin-tilgang.')
      }

      const publishedSnapshot = await saveContentSnapshot(snapshot, { status: 'published' })
      const draftSnapshot = await saveContentSnapshot(snapshot, { status: 'draft' })
      if (!publishedSnapshot || !draftSnapshot) {
        throw new Error('Supabase avviste lagringen. Kontroller tabell/policy-oppsettet.')
      }
      setHasLocalEdits(false)
      setSaveState({ kind: 'success', message: 'Endringer er lagret lokalt og synkronisert til Supabase.' })
      setTimeout(() => setSaveState({ kind: 'idle', message: '' }), 2500)
    } catch (error) {
      setSaveState({
        kind: 'error',
        message: 'Lokal kopi er lagret, men remote synk feilet: ' + getErrorMessage(error),
      })
    }
  }

  function handleReset() {
    if (window.confirm('Er du sikker p? at du vil tilbakestille ALT innhold til standardverdier?')) {
      clearContentOverrides()
      setDraft(JSON.parse(JSON.stringify(defaultContent)))
      setHasLocalEdits(true)
      setSaveState({ kind: 'idle', message: '' })
    }
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'site-content-' + new Date().toISOString().slice(0, 10) + '.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result)
        setDraft(parsed)
        writeContentOverrides(parsed)
        setHasLocalEdits(true)
        setSaveState({ kind: 'idle', message: '' })
        alert('Innhold importert!')
      } catch {
        alert('Ugyldig JSON-fil. Kontroller formatet.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (authMode === 'supabase') {
    if (authLoading || (session && supabaseAccessLoading)) {
      return <AuthLoadingPage message="Verifiserer Supabase-tilgang..." />
    }

    if (!session || !supabaseAuthorized) {
      return (
        <LoginPage
          onLogin={handleLogin}
          password={password}
          setPassword={setPassword}
          email={email}
          setEmail={setEmail}
          authMode={authMode}
          errorMsg={loginError}
          loading={loginLoading}
          lockedUntil={lockedUntil}
        />
      )
    }
  } else if (!authed) {
    return (
      <LoginPage
        onLogin={handleLogin}
        password={password}
        setPassword={setPassword}
        email={email}
        setEmail={setEmail}
        authMode={authMode}
        errorMsg={loginError}
        loading={loginLoading}
        lockedUntil={lockedUntil}
      />
    )
  }

  const editorProps = { draft, update }

  const renderEditor = () => {
    switch (activeSection) {
      case 'hero': return <HeroEditor {...editorProps} />
      case 'contacts': return <ContactsEditor {...editorProps} />
      case 'ctaBanner': return <CtaBannerEditor {...editorProps} />
      case 'homeServices': return <HomeServicesEditor {...editorProps} />
      case 'homeStats': return <HomeStatsEditor {...editorProps} />
      case 'homeHealth': return <HomeHealthEditor {...editorProps} />
      case 'homeContact': return (
        <Section title="Hurtigkontakt-seksjon (forside)">
          {['label','heading','description','cta'].map(k => (
            <Field key={k} label={k}>
              <TextInput value={draft.homeContact?.[k]} onChange={v => update('homeContact', k, v)} />
            </Field>
          ))}
        </Section>
      )
      case 'rekrutteringHero': return <PageHeroEditor sectionKey="rekrutteringHero" title="Rekruttering â€“ Sidehero" {...editorProps} />
      case 'rekrutteringCollab': return <RekrutteringCollabEditor {...editorProps} />
      case 'helseHero': return <PageHeroEditor sectionKey="helseHero" title="Helse â€“ Sidehero" {...editorProps} />
      case 'helsePhases': return <HelsePhasesEditor {...editorProps} />
      case 'helsePartnership': return <HelsePartnershipEditor {...editorProps} />
      case 'omOssHero': return <PageHeroEditor sectionKey="omOssHero" title="Om Oss â€“ Sidehero" {...editorProps} />
      case 'omOssTeam': return <OmOssTeamEditor {...editorProps} />
      case 'omOssOffices': return <OmOssOfficesEditor {...editorProps} />
      case 'talentportalenHero': return <PageHeroEditor sectionKey="talentportalenHero" title="Talentportalen â€“ Sidehero" {...editorProps} />
      case 'talentportalenSteps': return <TalentportalenStepsEditor {...editorProps} />
      case 'talentportalenBenefits': return <TalentportalenBenefitsEditor {...editorProps} />
      case 'kontaktHero': return <PageHeroEditor sectionKey="kontaktHero" title="Kontakt â€“ Sidehero" {...editorProps} />
      case 'nyheterHero': return <PageHeroEditor sectionKey="nyheterHero" title="Nyheter â€“ Sidehero" {...editorProps} />
      case 'hvaGjor': return <HvaGjorEditor {...editorProps} />
      case 'rekrutteringComp': return <RekrutteringCompEditor {...editorProps} />
      case 'helsesektorComp': return <HelsesektorCompEditor {...editorProps} />
      case 'omOssComp': return <OmOssCompEditor {...editorProps} />
      case 'talentportalenComp': return <TalentportalenCompEditor {...editorProps} />
      case 'godeGrunner': return <GodeGrunnerEditor {...editorProps} />
      case 'faq': return <FaqEditor {...editorProps} />
      case 'kontaktComp': return <KontaktCompEditor {...editorProps} />
      case 'navbar': return <NavbarEditor {...editorProps} />
      case 'footer': return <FooterEditor {...editorProps} />
      case 'templates': return <TemplatesEditor />
      case 'pages': return <ContentEntityManager entityType="page" />
      case 'news': return <ContentEntityManager entityType="news" />
      default: return <p className="text-gray-400">Velg en seksjon fra menyen.</p>
    }
  }

  const activeLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeSection)?.label || 'Admin'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(v => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <span className="font-heading font-bold text-ink text-sm">Admin</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 text-sm">{activeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
                        {saveState.kind === 'success' && (
              <span className="text-green-600 text-xs font-semibold flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Lagret!
              </span>
            )}
            {saveState.kind === 'error' && (
              <span className="text-red-600 text-xs font-semibold flex items-center gap-1 max-w-[16rem] text-right">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 9v4m0 4h.01M10.29 3.86l-8.5 15A2 2 0 0 0 3.5 22h17a2 2 0 0 0 1.71-3.14l-8.5-15a2 2 0 0 0-3.42 0Z"/></svg>
                {saveState.message}
              </span>
            )}
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button onClick={() => importRef.current?.click()} className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Importer
            </button>
            <button onClick={handleExport} className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Eksporter
            </button>
            <button onClick={handleReset} className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              Tilbakestill
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-bold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              Lagre alt
            </button>
            <button onClick={handleLogout} className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors" title="Logg ut">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:static inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-100
          transition-transform duration-200 overflow-y-auto top-14 lg:top-0
        `}>
          <nav className="p-3">
            <div className="mb-3 px-2 pt-2">
              <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold hover:text-primary-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                Se nettsiden
              </a>
            </div>
            {NAV_GROUPS.map(group => (
              <div key={group.title} className="mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">{group.title}</p>
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setSidebarOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                      activeSection === item.id
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold text-ink">{activeLabel}</h2>
              <p className="text-gray-400 text-sm mt-0.5">Rediger innhold og klikk Â«Lagre altÂ» for Ã¥ publisere endringer.</p>
            </div>
            {saveState.kind !== 'idle' && (
              <div
                className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                  saveState.kind === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : saveState.kind === 'success'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                {saveState.message}
              </div>
            )}
            {renderEditor()}
                        <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-md text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Lagrer...' : saveSucceeded ? 'Lagret!' : 'Lagre alt'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
