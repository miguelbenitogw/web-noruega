import { useEffect, useState } from 'react'
import { isSupabaseConfigured, listTemplates } from '../lib/contentServices'

export default function useTemplates(contentType) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!isSupabaseConfigured) {
          if (!cancelled) setTemplates([])
          return
        }

        const rows = await listTemplates(contentType)
        if (!cancelled) setTemplates(rows)
      } catch (err) {
        if (!cancelled) {
          setTemplates([])
          setError(err instanceof Error ? err : new Error('Could not load templates.'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [contentType])

  return { templates, loading, error }
}
