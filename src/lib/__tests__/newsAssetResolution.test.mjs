import assert from 'node:assert/strict'

import { __newsTestables } from '../news.js'

const { applyCoverImageAsset, createTimedPromiseCache, extractCoverImageAssetId } = __newsTestables

const cases = []

const testCase = (name, fn) => {
  cases.push({ name, fn })
}

testCase('extractCoverImageAssetId finds nested and top-level values', () => {
  assert.equal(extractCoverImageAssetId({ coverImageAssetId: ' asset-1 ' }), 'asset-1')
  assert.equal(extractCoverImageAssetId({ metadata: { coverImageAssetId: 'asset-2' } }), 'asset-2')
  assert.equal(extractCoverImageAssetId({ metadata: { content: { coverImageAssetId: 'asset-3' } } }), 'asset-3')
})

testCase('applyCoverImageAsset prefers the resolved asset url over legacy coverImage', () => {
  const article = {
    slug: 'nyhet-1',
    coverImage: '/legacy/cover.jpg',
    coverImageAssetId: 'asset-1',
  }

  const asset = {
    id: 'asset-1',
    publicUrl: 'https://cdn.example/assets/cover.jpg',
    alt: 'Cover',
  }

  assert.deepEqual(applyCoverImageAsset(article, asset), {
    ...article,
    coverImage: 'https://cdn.example/assets/cover.jpg',
    coverImageAsset: asset,
    coverImageAssetUrl: 'https://cdn.example/assets/cover.jpg',
  })
})

testCase('createTimedPromiseCache refreshes entries after ttl expiry', async () => {
  let now = 0
  let loaderCalls = 0
  const cache = createTimedPromiseCache(100, () => now)

  const loadValue = async () => {
    loaderCalls += 1
    return `value-${loaderCalls}`
  }

  assert.equal(await cache.get('item', loadValue), 'value-1')
  assert.equal(await cache.get('item', loadValue), 'value-1')

  now = 101

  assert.equal(await cache.get('item', loadValue), 'value-2')
  assert.equal(loaderCalls, 2)
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
  throw new Error('news asset resolution tests failed')
}

console.log(`\n${cases.length} news asset resolution checks passed`)
