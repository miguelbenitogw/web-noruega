import assert from 'node:assert/strict'
import process from 'node:process'

import { isSafeInlineLinkTarget, parseInlineLinkTokens, sanitizeInlineLinkMarkdown } from '../inlineLinkParser.js'

const cases = []

const testCase = (name, fn) => {
  cases.push({ name, fn })
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const renderTokens = (tokens) =>
  tokens
    .map((token) => {
      if (token.type === 'link') {
        return `<a href="${escapeHtml(token.href)}">${escapeHtml(token.value)}</a>`
      }

      return escapeHtml(token.value)
    })
    .join('')

testCase('parseInlineLinkTokens preserves plain text when no markdown links exist', () => {
  assert.deepEqual(parseInlineLinkTokens('Texto normal con salto\n de línea'), [
    { type: 'text', value: 'Texto normal con salto\n de línea' },
  ])
})

testCase('parseInlineLinkTokens accepts internal anchors and routes only', () => {
  assert.deepEqual(parseInlineLinkTokens('Ir a [sección](#contacto) o [perfil](/equipo) y [detalle](/equipo#bio) o [home](/#inicio).'), [
    { type: 'text', value: 'Ir a ' },
    { type: 'link', value: 'sección', href: '#contacto' },
    { type: 'text', value: ' o ' },
    { type: 'link', value: 'perfil', href: '/equipo' },
    { type: 'text', value: ' y ' },
    { type: 'link', value: 'detalle', href: '/equipo#bio' },
    { type: 'text', value: ' o ' },
    { type: 'link', value: 'home', href: '/#inicio' },
    { type: 'text', value: '.' },
  ])
})

testCase('isSafeInlineLinkTarget rejects dangerous and external targets', () => {
  const rejectedTargets = [
    'javascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'vbscript:msgbox(1)',
    '//external.example.com',
    'https://external.example.com',
    'http://external.example.com',
    '/ruta?redirect=https://external.example.com',
    ' /ruta',
    '/ruta ',
    '#',
  ]

  for (const target of rejectedTargets) {
    assert.equal(isSafeInlineLinkTarget(target), false, target)
  }
})

testCase('parseInlineLinkTokens renders invalid markdown links as plain text', () => {
  assert.deepEqual(parseInlineLinkTokens('Esto queda plano: [malo](javascript:alert(1)) y [otro](//evil.example).'), [
    { type: 'text', value: 'Esto queda plano: [malo](javascript:alert(1)) y [otro](//evil.example).' },
  ])
})

testCase('parseInlineLinkTokens leaves escaped and image-like syntax untouched', () => {
  assert.deepEqual(parseInlineLinkTokens('Escapado \\[texto](#ancla) y ![imagen](#ancla).'), [
    { type: 'text', value: 'Escapado \\[texto](#ancla) y ![imagen](#ancla).' },
  ])
})

testCase('parseInlineLinkTokens accepts safe anchors with punctuation and renderTokens keeps anchors explicit', () => {
  const tokens = parseInlineLinkTokens('Ir a [faq 2.0](#faq.2) o [bio-1](/equipo-1#bio-2) o [inicio](/#faq.2).')

  assert.deepEqual(tokens, [
    { type: 'text', value: 'Ir a ' },
    { type: 'link', value: 'faq 2.0', href: '#faq.2' },
    { type: 'text', value: ' o ' },
    { type: 'link', value: 'bio-1', href: '/equipo-1#bio-2' },
    { type: 'text', value: ' o ' },
    { type: 'link', value: 'inicio', href: '/#faq.2' },
    { type: 'text', value: '.' },
  ])

  assert.equal(renderTokens(tokens), 'Ir a <a href="#faq.2">faq 2.0</a> o <a href="/equipo-1#bio-2">bio-1</a> o <a href="/#faq.2">inicio</a>.')
})

testCase('parseInlineLinkTokens keeps manually typed safe internal markdown while blocking unsafe fallbacks', () => {
  assert.deepEqual(
    parseInlineLinkTokens('Manual: [Nyheter](/nyheter) og [arkiv](/nyheter#nyheter-arkiv), men [ekstern](https://example.com) forblir tekst.'),
    [
      { type: 'text', value: 'Manual: ' },
      { type: 'link', value: 'Nyheter', href: '/nyheter' },
      { type: 'text', value: ' og ' },
      { type: 'link', value: 'arkiv', href: '/nyheter#nyheter-arkiv' },
      { type: 'text', value: ', men [ekstern](https://example.com) forblir tekst.' },
    ],
  )
})

testCase('parseInlineLinkTokens keeps nullish input safe and rejects whitespace inside targets', () => {
  assert.deepEqual(parseInlineLinkTokens(null), [])
  assert.deepEqual(parseInlineLinkTokens(undefined), [])
  assert.deepEqual(parseInlineLinkTokens('Texto roto: [malo](#faq 2) y [otro](/equipo#bio\n2).'), [
    { type: 'text', value: 'Texto roto: [malo](#faq 2) y [otro](/equipo#bio\n2).' },
  ])
})

testCase('sanitizeInlineLinkMarkdown keeps catalogued destinations and degrades uncatalogued ones to plain text', () => {
  const result = sanitizeInlineLinkMarkdown(
    'Ir a [sección](#faq) y [detalle](/equipo#bio) pero [home](/#inicio) y [otro](#nope).',
    (href) => href === '#faq' || href === '/equipo#bio' || href === '/#inicio',
  )

  assert.equal(result, 'Ir a [sección](#faq) y [detalle](/equipo#bio) pero [home](/#inicio) y otro.')
})

testCase('sanitizeInlineLinkMarkdown also degrades unsafe manual markdown without touching normal text', () => {
  const result = sanitizeInlineLinkMarkdown(
    'Texto [seguro](#faq) + [externo](https://evil.example) + [script](javascript:alert(1)) + normal.',
    (href) => href === '#faq',
  )

  assert.equal(result, 'Texto [seguro](#faq) + externo + script + normal.')
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
  throw new Error('inline link parser tests failed')
}

console.log(`\n${cases.length} inline link parser checks passed`)
