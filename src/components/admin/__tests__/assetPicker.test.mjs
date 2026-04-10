import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const cases = []

const testCase = (name, fn) => {
  cases.push({ name, fn })
}

const pickerPath = fileURLToPath(new URL('../AssetPicker.jsx', import.meta.url))
const pickerSource = readFileSync(pickerPath, 'utf8')

testCase('AssetPicker compone uploader y library panel para cubrir ambos flujos', () => {
  assert.match(pickerSource, /import AssetLibraryPanel from '\.\/AssetLibraryPanel'/)
  assert.match(pickerSource, /import AssetUploader from '\.\/AssetUploader'/)
})

testCase('AssetPicker devuelve assetId y asset completos al seleccionar desde librería', () => {
  assert.match(pickerSource, /onSelect\?\.\(\{ assetId: asset\.id, asset \}\)/)
})

testCase('AssetPicker expone limpieza explícita de selección para cover image legacy-safe', () => {
  assert.match(pickerSource, /onClear\?\.\(\)/)
  assert.match(pickerSource, /Limpiar selección/)
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
  throw new Error('asset picker tests failed')
}

console.log(`\n${cases.length} asset picker checks passed`)
