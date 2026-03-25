export const baseInputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
export const baseTextareaClass = `${baseInputClass} min-h-[110px] resize-y font-mono text-xs leading-5`

export const isPlainObject = (value) => Boolean(value) && Object.prototype.toString.call(value) === '[object Object]'

const truthyValues = new Set(['1', 'true', 'yes', 'on'])

export const parseStructuredAdminEditorFlag = (rawValue, fallback = true) => {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return fallback
  }

  return truthyValues.has(String(rawValue).trim().toLowerCase())
}

export const isStructuredAdminEditorEnabled = () => {
  const env = typeof import.meta !== 'undefined' && import.meta && import.meta.env ? import.meta.env : {}
  return parseStructuredAdminEditorFlag(env.VITE_ADMIN_STRUCTURED_EDITOR, true)
}

const cloneValue = (value) => {
  if (Array.isArray(value)) return value.map(cloneValue)
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]))
  }
  return value
}

export const formatLabel = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())

export const getSchemaType = (schemaNode, value) => {
  if (schemaNode && typeof schemaNode === 'object' && !Array.isArray(schemaNode) && typeof schemaNode.type === 'string') {
    return schemaNode.type.toLowerCase()
  }

  if (typeof schemaNode === 'string') {
    return schemaNode.toLowerCase()
  }

  if (Array.isArray(value)) return 'array'
  if (value !== null && typeof value === 'object') return 'object'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'

  return 'string'
}

export const getJsonFallback = (fieldType) => (fieldType === 'array' ? [] : {})

export const getObjectProperties = (schemaNode) => {
  if (!isPlainObject(schemaNode) || !isPlainObject(schemaNode.properties)) return null
  return schemaNode.properties
}

export const getArrayItemSchema = (schemaNode) => {
  if (!isPlainObject(schemaNode) || !Object.prototype.hasOwnProperty.call(schemaNode, 'items')) return null
  return schemaNode.items
}

export const getRequiredKeys = (schemaNode) => {
  if (!isPlainObject(schemaNode) || !Array.isArray(schemaNode.required)) return []
  return schemaNode.required.filter((entry) => typeof entry === 'string')
}

export const isStringArraySchema = (schemaNode, value) => {
  const itemSchema = getArrayItemSchema(schemaNode)
  if (getSchemaType(itemSchema) === 'string') return true
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

export const isObjectArraySchema = (schemaNode, value) => {
  const itemSchema = getArrayItemSchema(schemaNode)
  if (getSchemaType(itemSchema) === 'object') return true
  return Array.isArray(value) && value.every((entry) => isPlainObject(entry))
}

export const createValueFromSchema = (schemaNode, depth = 0) => {
  if (depth > 4) return null

  if (isPlainObject(schemaNode) && Object.prototype.hasOwnProperty.call(schemaNode, 'default')) {
    return cloneValue(schemaNode.default)
  }

  const fieldType = getSchemaType(schemaNode)

  if (fieldType === 'boolean') return false
  if (fieldType === 'number') return null
  if (fieldType === 'array') return []

  if (fieldType === 'object') {
    const properties = getObjectProperties(schemaNode)
    if (!properties) return {}

    return Object.fromEntries(
      Object.entries(properties).map(([propertyKey, propertySchema]) => [propertyKey, createValueFromSchema(propertySchema, depth + 1)]),
    )
  }

  return ''
}

const isEmptyValue = (value, schemaNode) => {
  const fieldType = getSchemaType(schemaNode, value)

  if (fieldType === 'string') return String(value ?? '').trim() === ''
  if (fieldType === 'number') return value === null || value === undefined || Number.isNaN(value)
  if (fieldType === 'boolean') return value === null || value === undefined
  if (fieldType === 'array') return !Array.isArray(value) || value.length === 0
  if (fieldType === 'object') return !isPlainObject(value) || Object.keys(value).length === 0

  return value === null || value === undefined || value === ''
}

export const validateStructuredValue = (value, schemaNode, path = '') => {
  const errors = {}
  const fieldType = getSchemaType(schemaNode, value)
  const requiredKeys = getRequiredKeys(schemaNode)

  if (fieldType === 'object') {
    const properties = getObjectProperties(schemaNode)
    if (!properties) return errors

    const safeValue = isPlainObject(value) ? value : {}

    requiredKeys.forEach((propertyKey) => {
      const propertySchema = properties[propertyKey]
      const propertyPath = path ? `${path}.${propertyKey}` : propertyKey
      if (propertySchema && isEmptyValue(safeValue[propertyKey], propertySchema)) {
        errors[propertyPath] = `${formatLabel(propertyKey)} er påkrevd.`
      }
    })

    Object.entries(properties).forEach(([propertyKey, propertySchema]) => {
      const propertyValue = safeValue[propertyKey]
      const propertyPath = path ? `${path}.${propertyKey}` : propertyKey
      Object.assign(errors, validateStructuredValue(propertyValue, propertySchema, propertyPath))
    })

    return errors
  }

  if (fieldType === 'array' && isObjectArraySchema(schemaNode, value)) {
    const itemSchema = getArrayItemSchema(schemaNode)
    const items = Array.isArray(value) ? value : []

    items.forEach((item, index) => {
      const itemPath = path ? `${path}.${index}` : `${index}`
      Object.assign(errors, validateStructuredValue(item, itemSchema, itemPath))
    })
  }

  return errors
}

export function canRenderObjectListField(schemaNode, value, depth = 0) {
  if (depth > 3) return false
  if (getSchemaType(schemaNode, value) !== 'array') return false
  if (!isObjectArraySchema(schemaNode, value)) return false

  const itemSchema = getArrayItemSchema(schemaNode)
  const properties = getObjectProperties(itemSchema)
  if (!properties || Object.keys(properties).length === 0) return false

  return Object.entries(properties).every(([propertyKey, propertySchema]) => {
    const sampleValue = Array.isArray(value) ? value.find(isPlainObject)?.[propertyKey] : undefined
    return canRenderStructuredField(propertySchema, sampleValue, depth + 1)
  })
}

export function canRenderStructuredField(schemaNode, value, depth = 0) {
  if (depth > 3) return false

  const fieldType = getSchemaType(schemaNode, value)

  if (fieldType === 'string' || fieldType === 'number' || fieldType === 'boolean') {
    return true
  }

  if (fieldType === 'array') {
    return isStringArraySchema(schemaNode, value) || canRenderObjectListField(schemaNode, value, depth + 1)
  }

  if (fieldType === 'object') {
    const properties = getObjectProperties(schemaNode)
    if (!properties || Object.keys(properties).length === 0) return false

    return Object.entries(properties).every(([propertyKey, propertySchema]) => {
      const nextValue = isPlainObject(value) ? value[propertyKey] : undefined
      return canRenderStructuredField(propertySchema, nextValue, depth + 1)
    })
  }

  return false
}
