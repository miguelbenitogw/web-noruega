/**
 * Merge del contenido: los valores por defecto de siteContent.js con el
 * snapshot publicado encima. Lo único que queda de este módulo: las
 * funciones de plantillas (`validateTemplateShape`,
 * `normalizeTemplateBlueprint`) eran del editor visual y no tenían ningún
 * consumidor desde que se quitó el admin.
 */
const OBJECT_TAG = '[object Object]'

const isPlainObject = (value) => Boolean(value) && Object.prototype.toString.call(value) === OBJECT_TAG

const cloneValue = (value) => {
  if (Array.isArray(value)) return value.map(cloneValue)
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]))
  }
  return value
}

export const deepMergeContent = (defaults, content) => {
  if (isPlainObject(defaults)) {
    if (!isPlainObject(content)) return cloneValue(defaults)

    const merged = cloneValue(defaults)
    Object.entries(content).forEach(([key, value]) => {
      if (value === undefined) return

      const defaultValue = defaults[key]

      // Prevent empty-string remote overrides from blanking out real default content
      if (value === '' && typeof defaultValue === 'string' && defaultValue.length > 0) return

      if (Array.isArray(value)) {
        merged[key] = cloneValue(value)
        return
      }

      if (isPlainObject(defaultValue) && isPlainObject(value)) {
        merged[key] = deepMergeContent(defaultValue, value)
        return
      }

      merged[key] = cloneValue(value)
    })

    return merged
  }

  if (content === undefined || content === null) {
    return cloneValue(defaults)
  }

  return cloneValue(content)
}
