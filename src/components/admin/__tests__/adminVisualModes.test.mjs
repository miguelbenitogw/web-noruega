import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const cases = []

const testCase = (name, fn) => {
  cases.push({ name, fn })
}

const registryPath = fileURLToPath(new URL('../../../lib/adminSectionRegistry.js', import.meta.url))
const registrySource = readFileSync(registryPath, 'utf8')

const previewModesMatch = registrySource.match(
  /export const ADMIN_PREVIEW_MODES = \[(.*?)\]\n\nconst buildLandingSections/s,
)

const previewModeSource = previewModesMatch?.[1] ?? ''
const declaredModeIds = [...previewModeSource.matchAll(/id: '([^']+)'/g)].map((match) => match[1])
const explicitBranchIds = [...registrySource.matchAll(/if \(currentMode\.id === '([^']+)'\)/g)].map((match) => match[1])

testCase('admin visual mode registry keeps every declared mode on an explicit config branch', () => {
  assert.ok(declaredModeIds.length > 0)
  assert.ok(explicitBranchIds.length > 0)

  for (const modeId of declaredModeIds) {
    if (modeId === 'article') {
      continue
    }

    assert.ok(
      explicitBranchIds.includes(modeId),
      `Expected getAdminPreviewConfig to handle ${modeId} explicitly`,
    )
  }
})

testCase('admin visual mode registry still keeps the article fallback as the default branch', () => {
  assert.match(registrySource, /return \{\n\s+id: 'article'/)
  assert.match(registrySource, /routeKey: article \? `admin:article:\$\{article\.slug\}` : 'admin:article'/)
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
  throw new Error('admin visual mode tests failed')
}

console.log(`\n${cases.length} admin visual mode checks passed`)
