const OBJECT_TAG = '[object Object]'

export const isPlainObject = (value) => Boolean(value) && Object.prototype.toString.call(value) === OBJECT_TAG

export const cloneValue = (value) => {
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

export const validateTemplateShape = (template) => {
  const issues = []

  if (!isPlainObject(template)) {
    return { valid: false, issues: ['Template must be a plain object.'] }
  }

  const schema = template.schema ?? template.frontmatter_schema
  const defaults = template.defaults ?? template.frontmatter_example

  if (!isPlainObject(schema)) {
    issues.push('schema must be a plain object.')
  }

  if (!isPlainObject(defaults)) {
    issues.push('defaults must be a plain object.')
  }

  return { valid: issues.length === 0, issues }
}

export const normalizeTemplateBlueprint = (template = {}) => ({
  schema: isPlainObject(template.schema)
    ? cloneValue(template.schema)
    : isPlainObject(template.frontmatter_schema)
      ? cloneValue(template.frontmatter_schema)
      : {},
  defaults: isPlainObject(template.defaults)
    ? cloneValue(template.defaults)
    : isPlainObject(template.frontmatter_example)
      ? cloneValue(template.frontmatter_example)
      : {},
})
