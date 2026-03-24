import { useMemo } from 'react'
import { deepMergeContent, cloneValue, validateTemplateShape } from '../lib/contentMappers'

export default function useTemplateContent({ template, content } = {}) {
  const resolvedContent = useMemo(() => {
    const blueprint = template?.defaults ?? template?.frontmatter_example ?? {}
    return deepMergeContent(blueprint, content ?? {})
  }, [content, template])

  const validation = useMemo(() => template?.validation ?? validateTemplateShape(template), [template])

  return {
    resolvedContent,
    isValid: validation.valid,
    issues: validation.issues,
    blueprint: cloneValue(template?.schema ?? template?.frontmatter_schema ?? {}),
  }
}
