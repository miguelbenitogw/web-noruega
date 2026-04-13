import assert from 'node:assert/strict'

import { __newsMvpTestables } from '../contentServices.js'

const {
  normalizeStatus,
  resolveFeaturedFlag,
  sortNewsItems,
  validateNewsPayload,
  prepareMetadata,
  prepareUpsertPayload,
} = __newsMvpTestables

const cases = []

const testCase = (name, fn) => {
  cases.push({ name, fn })
}

testCase('normalizeStatus mantiene workflow MVP draft/published', () => {
  assert.equal(normalizeStatus('published'), 'published')
  assert.equal(normalizeStatus('PUBLISHED'), 'published')
  assert.equal(normalizeStatus('draft'), 'draft')
  assert.equal(normalizeStatus('otro'), 'draft')
})

testCase('validateNewsPayload exige SEO solo al publicar', () => {
  assert.doesNotThrow(() => validateNewsPayload({ status: 'draft' }))
  assert.throws(
    () => validateNewsPayload({ status: 'published', seoDescription: 'desc' }),
    /SEO-tittel/i,
  )
  assert.throws(
    () => validateNewsPayload({ status: 'published', seoTitle: 'title' }),
    /SEO-beskrivelse/i,
  )
  assert.doesNotThrow(() => validateNewsPayload({
    status: 'published',
    seoTitle: 'title',
    seoDescription: 'description',
  }))
})

testCase('resolveFeaturedFlag tolera featured canónico con fallback metadata/content', () => {
  assert.equal(resolveFeaturedFlag({ featured: true }), true)
  assert.equal(resolveFeaturedFlag({ metadata: { featured: '1' } }), true)
  assert.equal(resolveFeaturedFlag({ metadata: { content: { featured: 'yes' } } }), true)
  assert.equal(resolveFeaturedFlag({ featured: false, metadata: { featured: 0 } }), false)
})

testCase('sortNewsItems ordena featured primero y luego fecha descendente', () => {
  const sorted = sortNewsItems([
    { slug: 'a', featured: false, publishAt: '2026-01-01T00:00:00.000Z' },
    { slug: 'b', featured: true, publishAt: '2024-01-01T00:00:00.000Z' },
    { slug: 'c', featured: false, publishAt: '2027-01-01T00:00:00.000Z' },
  ])

  assert.deepEqual(sorted.map((item) => item.slug), ['b', 'c', 'a'])
})

testCase('prepareMetadata preserva metadata/content y persiste featured boolean', () => {
  const metadata = prepareMetadata({
    metadata: {
      source: 'legacy',
      content: {
        blocks: ['uno'],
      },
    },
    content: {
      blocks: ['dos'],
      locale: 'no',
      coverImageAssetId: 'asset-123',
    },
    featured: true,
    coverImageAssetId: ' asset-456 ',
  })

  assert.equal(metadata.source, 'legacy')
  assert.deepEqual(metadata.content.blocks, ['dos'])
  assert.equal(metadata.content.locale, 'no')
  assert.equal(metadata.content.coverImageAssetId, 'asset-456')
  assert.equal(metadata.featured, true)
  assert.equal(metadata.content.featured, true)
})

testCase('prepareUpsertPayload aplica publish inmediato al publicar sin publishAt', async () => {
  const payload = await prepareUpsertPayload(null, {
    slug: 'nyhet-x',
    title: 'Nyhet X',
    status: 'published',
    seoTitle: 'SEO title',
    seoDescription: 'SEO description',
    metadata: { source: 'admin' },
    content: { body: 'ok' },
    coverImageAssetId: ' asset-789 ',
    featured: true,
  }, 'news')

  assert.equal(payload.status, 'published')
  assert.equal(typeof payload.publish_at, 'string')
  assert.equal(Number.isNaN(new Date(payload.publish_at).getTime()), false)
  assert.equal(payload.metadata.source, 'admin')
  assert.equal(payload.metadata.featured, true)
  assert.equal(payload.metadata.content.featured, true)
  assert.equal(payload.metadata.content.body, 'ok')
  assert.equal(payload.metadata.content.coverImageAssetId, 'asset-789')
})

let failed = false

for (const { name, fn } of cases) {
  try {
    await fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    failed = true
    console.error(`not ok - ${name}`)
    console.error(error)
  }
}

if (failed) {
  process.exitCode = 1
  throw new Error('news MVP contract tests failed')
}

console.log(`\n${cases.length} news MVP contract checks passed`)
