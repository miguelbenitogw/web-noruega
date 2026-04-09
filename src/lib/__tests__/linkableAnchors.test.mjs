import assert from 'node:assert/strict'
import {
  getLinkableAnchorGroups,
  getLinkableAnchorOptions,
  isValidInternalDestination,
} from '../linkableAnchors.js'

const cases = []

const testCase = (name, fn) => {
  cases.push({ name, fn })
}

testCase('getLinkableAnchorGroups puts the current page first', () => {
  const groups = getLinkableAnchorGroups({ routeKey: 'admin:helse' })
  assert.equal(groups[0].pageKey, 'helse')
  assert.equal(groups[0].isCurrentPage, true)
  assert.equal(groups[0].anchors[0].destination, '#helsesektor')
})

testCase('getLinkableAnchorGroups omits catalog pages without anchors', () => {
  const groups = getLinkableAnchorGroups({ routeKey: 'admin:kontakt' })

  assert.equal(groups.some((group) => group.pageKey === 'personvern'), false)
  assert.equal(groups.some((group) => group.pageKey === 'vilkar'), false)
  assert.equal(groups.some((group) => group.pageKey === 'cookies'), false)
  assert.equal(groups.every((group) => group.anchors.length > 0), true)
})

testCase('getLinkableAnchorOptions includes same-page and cross-page destinations', () => {
  const options = getLinkableAnchorOptions({ routeKey: 'admin:helse' })
  assert.ok(options.some((option) => option.destination === '#hvagjor'))
  assert.ok(options.some((option) => option.destination === '/nyheter#nyheter-arkiv'))
  assert.ok(options.some((option) => option.destination === '/kontakt#phone'))
})

testCase('isValidInternalDestination accepts only registered internal anchors', () => {
  const validTargets = [
    '#helsesektor',
    '#hvagjor',
    '/nyheter#nyheter-arkiv',
    '/kontakt#phone',
  ]

  for (const target of validTargets) {
    assert.equal(isValidInternalDestination(target, { routeKey: 'admin:helse' }), true, target)
  }

  const rejectedTargets = [
    '',
    ' ',
    '#missing-anchor',
    '/helsesektor',
    '/nyheter',
    '/nyheter#missing',
    'https://example.com',
    'javascript:alert(1)',
  ]

  for (const target of rejectedTargets) {
    assert.equal(isValidInternalDestination(target, { routeKey: 'admin:helse' }), false, target)
  }
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
  throw new Error('linkable anchors tests failed')
}

console.log(`\n${cases.length} linkable anchors checks passed`)
