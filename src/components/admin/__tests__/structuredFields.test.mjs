import assert from 'node:assert/strict'

import {
  canRenderObjectListField,
  canRenderStructuredField,
  createValueFromSchema,
  parseStructuredAdminEditorFlag,
  validateStructuredValue,
} from '../fields/helpers.js'
import { clampPageToTotalPages } from '../assetLibraryPagination.js'

const cases = []

const testCase = (name, fn) => {
  cases.push({ name, fn })
}

testCase('parseStructuredAdminEditorFlag defaults to enabled', () => {
  assert.equal(parseStructuredAdminEditorFlag(undefined), true)
  assert.equal(parseStructuredAdminEditorFlag(null), true)
  assert.equal(parseStructuredAdminEditorFlag(''), true)
})

testCase('parseStructuredAdminEditorFlag accepts common truthy and falsey values', () => {
  assert.equal(parseStructuredAdminEditorFlag('true'), true)
  assert.equal(parseStructuredAdminEditorFlag('ON'), true)
  assert.equal(parseStructuredAdminEditorFlag('0'), false)
  assert.equal(parseStructuredAdminEditorFlag('false'), false)
  assert.equal(parseStructuredAdminEditorFlag('no'), false)
})

testCase('createValueFromSchema builds nested defaults for structured fields', () => {
  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      published: { type: 'boolean' },
      tags: { type: 'array', items: { type: 'string' } },
      hero: {
        type: 'object',
        properties: {
          alt: { type: 'string', default: 'Alt text' },
        },
      },
    },
  }

  assert.deepEqual(createValueFromSchema(schema), {
    title: '',
    published: false,
    tags: [],
    hero: { alt: 'Alt text' },
  })
})

testCase('validateStructuredValue reports nested required fields with stable paths', () => {
  const schema = {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string' },
      meta: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string' },
        },
      },
    },
  }

  const errors = validateStructuredValue({ title: '', meta: { slug: '' } }, schema)

  assert.equal(errors.title, 'Title er påkrevd.')
  assert.equal(errors['meta.slug'], 'Slug er påkrevd.')
})

testCase('canRenderStructuredField and canRenderObjectListField accept supported schemas', () => {
  const objectSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      enabled: { type: 'boolean' },
    },
  }

  const listSchema = {
    type: 'array',
    items: objectSchema,
  }

  assert.equal(canRenderStructuredField(objectSchema, { name: 'X', enabled: true }), true)
  assert.equal(canRenderObjectListField(listSchema, [{ name: 'X', enabled: true }]), true)
})

testCase('canRenderStructuredField rejects empty object contracts', () => {
  assert.equal(canRenderStructuredField({ type: 'object', properties: {} }, {}), false)
  assert.equal(canRenderObjectListField({ type: 'array', items: { type: 'object', properties: {} } }, [{}]), false)
})

testCase('clampPageToTotalPages corrige páginas fuera de rango sin romper totalPages vacío', () => {
  assert.equal(clampPageToTotalPages(5, 3), 3)
  assert.equal(clampPageToTotalPages(2, 3), 2)
  assert.equal(clampPageToTotalPages(4, 0), 4)
})

let failed = false

for (const { name, fn } of cases) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    failed = true
    console.error(`not ok - ${name}`)
    console.error(error)
  }
}

if (failed) {
  process.exitCode = 1
  throw new Error('structured fields tests failed')
}

console.log(`\n${cases.length} structured field checks passed`)
