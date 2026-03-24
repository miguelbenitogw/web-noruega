import { useCallback, useEffect, useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient'

const getNextSessionState = (session) => ({
  session: session || null,
  user: session?.user || null,
})

export default function useAuth() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const client = getSupabaseClient()

    if (!client) {
      setSession(null)
      setUser(null)
      setLoading(false)
      return undefined
    }

    let active = true

    ;(async () => {
      try {
        const { data } = await client.auth.getSession()
        if (!active) return
        const nextState = getNextSessionState(data?.session)
        setSession(nextState.session)
        setUser(nextState.user)
      } finally {
        if (active) setLoading(false)
      }
    })()

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      const nextState = getNextSessionState(nextSession)
      setSession(nextState.session)
      setUser(nextState.user)
      setLoading(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signInWithPassword = useCallback(async ({ email, password }) => {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase auth is not configured.')
    }

    return client.auth.signInWithPassword({ email, password })
  }, [])

  const signOut = useCallback(async () => {
    const client = getSupabaseClient()
    if (!client) return null
    return client.auth.signOut()
  }, [])

  return {
    user,
    session,
    loading,
    isConfigured: isSupabaseConfigured,
    signInWithPassword,
    signOut,
  }
}
