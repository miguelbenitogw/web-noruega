import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuth from '../hooks/useAuth'
import { canCurrentUserEditContent as canEditContentByPolicy } from '../lib/contentRemote'
import AdminVisualShell from '../components/admin/AdminVisualShell'

const resolveAdminAuthMode = () => {
  const configured = String(import.meta.env.VITE_ADMIN_AUTH_MODE || '').trim().toLowerCase()
  if (configured === 'local' && import.meta.env.DEV) return 'local'
  return 'supabase'
}

const ADMIN_AUTH_MODE = resolveAdminAuthMode()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30 * 60 * 1000
const SESSION_MS = 60 * 60 * 1000
const RATE_KEY = 'gw_admin_rate_v2'
const SESSION_KEY = 'gw_admin_sess_v2'

async function pbkdf2Hash(password) {
  const salt = import.meta.env.VITE_ADMIN_SALT || 'gw-static-salt-v1'
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 200_000, hash: 'SHA-256' },
    key,
    256,
  )

  return Array.from(new Uint8Array(bits)).map((value) => value.toString(16).padStart(2, '0')).join('')
}

function getRateState() {
  try {
    return JSON.parse(localStorage.getItem(RATE_KEY)) || { attempts: 0, lockedUntil: 0 }
  } catch {
    return { attempts: 0, lockedUntil: 0 }
  }
}

function setRateState(nextState) {
  localStorage.setItem(RATE_KEY, JSON.stringify(nextState))
}

function isSessionValid() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return false
    return Date.now() - JSON.parse(raw).ts < SESSION_MS
  } catch {
    return false
  }
}

function touchSession() {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }))
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

function getErrorMessage(error) {
  if (!error) return 'Ukjent feil'
  if (typeof error === 'string') return error
  return error.message || error.error_description || 'Ukjent feil'
}

function AdminLoadingScreen({ message }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-900/40">
          <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-white">Klargjør adminverktøyet</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{message}</p>
      </div>
    </div>
  )
}

function AdminLoginScreen({
  authMode,
  email,
  errorMsg,
  loading,
  lockedUntil,
  onLogin,
  password,
  setEmail,
  setPassword,
  supabaseConfigured,
}) {
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!lockedUntil) return undefined

    let intervalId = null
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
      setCountdown(seconds)
      if (seconds === 0 && intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    tick()
    intervalId = setInterval(tick, 1000)

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [lockedUntil])

  const isLocked = countdown > 0
  const minutes = Math.ceil(countdown / 60)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full border border-primary-400/30 bg-primary-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-100">
              /admin
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-white">
              Sentralisert innholdsadmin
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Her redigerer du startside, nyheter og helse med ekte canvas, seksjonspanel og nyhetsstudio på ett sted.
            </p>
          </div>

          <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-900/40">
            <span className="font-heading text-xl font-bold text-white">GW</span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onLogin}>
          {authMode === 'supabase' ? (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/20"
                placeholder="editor@globalworking.no"
                disabled={!supabaseConfigured || loading || isLocked}
              />
            </label>
          ) : (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Lokal innlogging er aktiv. Bruk den bare i utviklingsmiljø.
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Passord</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={authMode === 'supabase' ? 'current-password' : 'off'}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/20"
              placeholder="••••••••"
              disabled={loading || isLocked}
            />
          </label>

          {!supabaseConfigured && authMode === 'supabase' && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Supabase-autentisering er ikke konfigurert i dette miljøet.
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {errorMsg}
            </div>
          )}

          {isLocked && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Tilgangen er midlertidig låst i {minutes} min. Vent til sperren er over før du prøver igjen.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isLocked || (authMode === 'supabase' && !supabaseConfigured)}
            className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Logger inn…' : 'Åpne admin'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const authMode = ADMIN_AUTH_MODE
  const { session, loading: authLoading, isConfigured: supabaseConfigured, signInWithPassword, signOut } = useAuth()
  const [authed, setAuthed] = useState(() => authMode === 'local' && isSessionValid())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [lockedUntil, setLockedUntil] = useState(() => getRateState().lockedUntil)
  const [supabaseAuthorized, setSupabaseAuthorized] = useState(false)
  const [supabaseAccessLoading, setSupabaseAccessLoading] = useState(authMode === 'supabase')

  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]')

    if (meta) {
      meta.setAttribute('content', 'noindex, nofollow')
      return () => meta.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    }

    const fallbackMeta = document.createElement('meta')
    fallbackMeta.name = 'robots'
    fallbackMeta.content = 'noindex, nofollow'
    document.head.appendChild(fallbackMeta)

    return () => {
      fallbackMeta.remove()
    }
  }, [])

  const handleLogout = useCallback(() => {
    clearSession()
    setAuthed(false)
    setSupabaseAuthorized(false)
    setSupabaseAccessLoading(false)
    setPassword('')
    setEmail('')
    setLoginError('')

    if (authMode === 'supabase') {
      void signOut()
    }
  }, [authMode, signOut])

  useEffect(() => {
    if (authMode !== 'local' || !authed) return undefined

    const refresh = () => touchSession()
    const checkIdle = () => {
      if (!isSessionValid()) {
        handleLogout()
      }
    }

    window.addEventListener('mousemove', refresh)
    window.addEventListener('keydown', refresh)

    const intervalId = setInterval(checkIdle, 60_000)

    return () => {
      window.removeEventListener('mousemove', refresh)
      window.removeEventListener('keydown', refresh)
      clearInterval(intervalId)
    }
  }, [authMode, authed, handleLogout])

  useEffect(() => {
    if (authMode !== 'supabase') return undefined

    if (!supabaseConfigured) {
      setSupabaseAccessLoading(false)
      setSupabaseAuthorized(false)
      setLoginError('Supabase-autentisering er ikke konfigurert i dette miljøet.')
      return undefined
    }

    if (!session) {
      setSupabaseAuthorized(false)
      setSupabaseAccessLoading(false)
      return undefined
    }

    let cancelled = false
    setSupabaseAccessLoading(true)

    ;(async () => {
      try {
        const allowed = await canEditContentByPolicy()
        if (cancelled) return

        if (!allowed) {
          setLoginError('Kontoen mangler redaktør- eller adminrettigheter.')
          setSupabaseAuthorized(false)
          void signOut()
          return
        }

        setSupabaseAuthorized(true)
        setLoginError('')
      } catch (error) {
        if (cancelled) return
        setSupabaseAuthorized(false)
        setLoginError(`Kunne ikke verifisere tilgang: ${getErrorMessage(error)}`)
        void signOut()
      } finally {
        if (!cancelled) setSupabaseAccessLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [authMode, session, signOut, supabaseConfigured])

  const canRenderShell = useMemo(() => {
    if (authMode === 'supabase') {
      return Boolean(session && supabaseAuthorized)
    }

    return authed
  }, [authMode, authed, session, supabaseAuthorized])

  const handleLogin = useCallback(async (event) => {
    event.preventDefault()
    setLoginError('')

    const now = Date.now()
    const currentRate = getRateState()
    const normalizedRate = now >= (currentRate.lockedUntil || 0)
      ? { attempts: 0, lockedUntil: 0 }
      : currentRate

    if (
      normalizedRate.attempts !== currentRate.attempts
      || normalizedRate.lockedUntil !== currentRate.lockedUntil
    ) {
      setRateState(normalizedRate)
    }

    if (now < normalizedRate.lockedUntil) {
      setLockedUntil(normalizedRate.lockedUntil)
      return
    }

    setLoginLoading(true)

    try {
      if (authMode === 'supabase') {
        const { error } = await signInWithPassword({ email: email.trim(), password })
        if (error) {
          const attempts = normalizedRate.attempts + 1
          const lock = attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
          setRateState({ attempts, lockedUntil: lock })
          setLockedUntil(lock)
          setLoginError(
            lock
              ? 'Tilgangen er låst i 30 minutter.'
              : `${getErrorMessage(error)}. Du har ${Math.max(0, MAX_ATTEMPTS - attempts)} forsøk igjen.`,
          )
          return
        }

        setRateState({ attempts: 0, lockedUntil: 0 })
        setLockedUntil(0)
        setPassword('')
        return
      }

      const hash = await pbkdf2Hash(password)
      const storedHash = import.meta.env.VITE_ADMIN_HASH
      const fallbackPassword = import.meta.env.VITE_ADMIN_PASSWORD

      let isValid = false
      if (storedHash) {
        isValid = hash === storedHash
      } else if (fallbackPassword) {
        isValid = password === fallbackPassword
        if (isValid && import.meta.env.DEV) {
          console.info(`[Admin] Sett VITE_ADMIN_HASH til denne verdien for å stramme inn tilgangen:\n${hash}`)
        }
      } else {
        throw new Error('Ingen lokale legitimasjonsdata er konfigurert.')
      }

      if (!isValid) {
        const attempts = normalizedRate.attempts + 1
        const lock = attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
        setRateState({ attempts, lockedUntil: lock })
        setLockedUntil(lock)
        setLoginError(
          lock
            ? 'Tilgangen er låst i 30 minutter.'
            : `Ugyldig passord. Du har ${Math.max(0, MAX_ATTEMPTS - attempts)} forsøk igjen.`,
        )
        return
      }

      setRateState({ attempts: 0, lockedUntil: 0 })
      setLockedUntil(0)
      touchSession()
      setPassword('')
      setAuthed(true)
    } catch (error) {
      setLoginError(getErrorMessage(error))
    } finally {
      setLoginLoading(false)
    }
  }, [authMode, email, password, signInWithPassword])

  if (authMode === 'supabase' && (authLoading || (session && supabaseAccessLoading))) {
    return <AdminLoadingScreen message="Verifiserer økt og redigeringstilgang…" />
  }

  if (!canRenderShell) {
    return (
      <AdminLoginScreen
        authMode={authMode}
        email={email}
        errorMsg={loginError}
        loading={loginLoading}
        lockedUntil={lockedUntil}
        onLogin={handleLogin}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        supabaseConfigured={supabaseConfigured}
      />
    )
  }

  return <AdminVisualShell onSignOut={handleLogout} />
}
