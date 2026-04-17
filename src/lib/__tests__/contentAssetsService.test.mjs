import assert from 'node:assert/strict'
import {
  __resetContentAssetsServiceClientResolver,
  __setContentAssetsServiceClientResolver,
  CONTENT_ASSET_MAX_SIZE_BYTES,
  archiveAsset,
  getAssetById,
  listAssets,
  syncContentAssetUsage,
  updateAssetMeta,
  uploadAsset,
} from '../contentAssetsService.js'

const cases = []

const CONTENT_ASSET_ID = '11111111-1111-4111-8111-111111111111'

const testCase = (name, fn) => {
  cases.push({ name, fn })
}

const createTableMock = (config = {}) => {
  const state = {
    selectArgs: [],
    eqArgs: [],
    orderArgs: [],
    orArgs: [],
    insertPayload: null,
    updatePayload: null,
    deleteCalled: false,
    rangeArgs: null,
  }

  const builder = {
    select(...args) {
      state.selectArgs.push(args)
      return builder
    },
    insert(payload) {
      state.insertPayload = payload
      return builder
    },
    update(payload) {
      state.updatePayload = payload
      return builder
    },
    delete() {
      state.deleteCalled = true
      return builder
    },
    eq(column, value) {
      state.eqArgs.push([column, value])
      return builder
    },
    order(column, options) {
      state.orderArgs.push([column, options])
      return builder
    },
    or(expression) {
      state.orArgs.push(expression)
      return builder
    },
    range(from, to) {
      state.rangeArgs = [from, to]
      return Promise.resolve(config.rangeResult ?? { data: [], count: 0, error: null })
    },
    maybeSingle() {
      return Promise.resolve(config.maybeSingleResult ?? { data: null, error: null })
    },
    single() {
      return Promise.resolve(config.singleResult ?? { data: null, error: null })
    },
  }

  return { builder, state }
}

const createClientMock = ({ tableMock, uploadResult, removeResult } = {}) => {
  const state = {
    fromCalls: [],
    storageBuckets: [],
    uploadCalls: [],
    removeCalls: [],
    signedUrlCalls: [],
  }

  return {
    state,
    client: {
      from(table) {
        state.fromCalls.push(table)
        return tableMock.builder
      },
      storage: {
        from(bucket) {
          state.storageBuckets.push(bucket)
          return {
            upload(path, file, options) {
              state.uploadCalls.push([path, file, options])
              return Promise.resolve(uploadResult ?? { data: { path }, error: null })
            },
            createSignedUrl(path, expiresIn) {
              state.signedUrlCalls.push([path, expiresIn])
              return Promise.resolve({
                data: {
                  signedUrl: `https://signed.example/${path}?expires=${expiresIn}`,
                },
                error: null,
              })
            },
            remove(paths) {
              state.removeCalls.push(paths)
              return Promise.resolve(removeResult ?? { data: paths, error: null })
            },
            getPublicUrl(path) {
              return { data: { publicUrl: `https://example.supabase.co/storage/v1/object/public/content-media/${path}` } }
            },
          }
        },
      },
    },
  }
}

const createAssetRow = (overrides = {}) => ({
  id: CONTENT_ASSET_ID,
  bucket: 'content-media',
  storage_path: '2026/04/09/example-asset.png',
  public_url: null,
  mime_type: 'image/png',
  size_bytes: 1234,
  width: 1200,
  height: 630,
  alt: 'Hero principal',
  caption: 'Banner home',
  usage_type: 'hero',
  status: 'active',
  created_by: 'user-1',
  created_at: '2026-04-09T09:00:00.000Z',
  updated_at: '2026-04-09T09:30:00.000Z',
  ...overrides,
})

testCase('uploadAsset valida mime allowlist', async () => {
  __setContentAssetsServiceClientResolver(() => ({ storage: { from: () => ({}) } }))

  await assert.rejects(
    () =>
      uploadAsset({
        name: 'foto.gif',
        type: 'image/gif',
        size: 512,
      }),
    /Tipo de archivo no soportado/,
  )
})

testCase('uploadAsset valida tamaño máximo', async () => {
  __setContentAssetsServiceClientResolver(() => ({ storage: { from: () => ({}) } }))

  await assert.rejects(
    () =>
      uploadAsset({
        name: 'foto.webp',
        type: 'image/webp',
        size: CONTENT_ASSET_MAX_SIZE_BYTES + 1,
      }),
    /supera el máximo permitido/,
  )
})

testCase('uploadAsset sube al bucket y crea la fila con metadata saneada', async () => {
  const tableMock = createTableMock({
    singleResult: { data: createAssetRow(), error: null },
  })
  const { client, state } = createClientMock({ tableMock })
  __setContentAssetsServiceClientResolver(() => client)

  const file = {
    name: ' Hero Banner.PNG ',
    type: 'image/png',
    size: 1024,
  }

  const asset = await uploadAsset(file, {
    alt: '  Hero   principal ',
    caption: '  Banner   home ',
    usage: '  Hero Banner ',
    width: '1200',
    height: 630,
  })

  assert.equal(state.storageBuckets[0], 'content-media')
  assert.equal(state.uploadCalls.length, 1)
  assert.match(state.uploadCalls[0][0], /hero-banner\.png$/)
  assert.equal(state.uploadCalls[0][2].contentType, 'image/png')
  assert.equal(tableMock.state.insertPayload.bucket, 'content-media')
  assert.equal(tableMock.state.insertPayload.mime_type, 'image/png')
  assert.equal(tableMock.state.insertPayload.size_bytes, 1024)
  assert.equal(tableMock.state.insertPayload.alt, 'Hero principal')
  assert.equal(tableMock.state.insertPayload.caption, 'Banner home')
  assert.equal(tableMock.state.insertPayload.usage_type, 'hero-banner')
  assert.equal(tableMock.state.insertPayload.width, 1200)
  assert.equal(tableMock.state.insertPayload.height, 630)
  assert.equal(asset.storagePath, '2026/04/09/example-asset.png')
  assert.equal(asset.usageType, 'hero')
})

testCase('uploadAsset limpia el objeto subido si falla el insert de metadata', async () => {
  const tableMock = createTableMock({
    singleResult: { data: null, error: { message: 'insert failed' } },
  })
  const { client, state } = createClientMock({ tableMock })
  __setContentAssetsServiceClientResolver(() => client)

  await assert.rejects(
    () =>
      uploadAsset(
        {
          name: 'asset.png',
          type: 'image/png',
          size: 1024,
        },
        { alt: 'Asset' },
      ),
    /falló la creación del registro del asset: insert failed/,
  )

  assert.equal(state.removeCalls.length, 1)
  assert.equal(state.removeCalls[0].length, 1)
})

testCase('listAssets aplica filtros, paginación y devuelve totales', async () => {
  const tableMock = createTableMock({
    rangeResult: {
      data: [
        createAssetRow(),
        createAssetRow({
          id: '22222222-2222-4222-8222-222222222222',
          storage_path: '2026/04/09/secondary.png',
          status: 'inactive',
        }),
      ],
      count: 7,
      error: null,
    },
  })
  const { client } = createClientMock({ tableMock })
  __setContentAssetsServiceClientResolver(() => client)

  const response = await listAssets({
    search: ' hero, principal ',
    usageType: ' HERO ',
    status: 'inactive',
    page: 2,
    pageSize: 3,
  })

  assert.deepEqual(tableMock.state.eqArgs, [
    ['usage_type', 'hero'],
    ['status', 'inactive'],
  ])
  assert.equal(tableMock.state.rangeArgs[0], 3)
  assert.equal(tableMock.state.rangeArgs[1], 5)
  assert.match(tableMock.state.orArgs[0], /alt\.ilike\.%hero  principal%/)
  assert.equal(response.page, 2)
  assert.equal(response.pageSize, 3)
  assert.equal(response.total, 7)
  assert.equal(response.totalPages, 3)
  assert.equal(response.items.length, 2)
})

testCase('getAssetById devuelve null cuando no existe', async () => {
  const tableMock = createTableMock({
    maybeSingleResult: { data: null, error: null },
  })
  const { client } = createClientMock({ tableMock })
  __setContentAssetsServiceClientResolver(() => client)

  const asset = await getAssetById(CONTENT_ASSET_ID)

  assert.equal(asset, null)
  assert.deepEqual(tableMock.state.eqArgs, [['id', CONTENT_ASSET_ID]])
})

testCase('getAssetById hidrata publicUrl con signed URL cuando el bucket es privado', async () => {
  const tableMock = createTableMock({
    maybeSingleResult: {
      data: createAssetRow({ public_url: null, storage_path: '2026/04/09/signed.png' }),
      error: null,
    },
  })
  const { client, state } = createClientMock({ tableMock })
  __setContentAssetsServiceClientResolver(() => client)

  const asset = await getAssetById(CONTENT_ASSET_ID)

  assert.equal(state.signedUrlCalls.length, 1)
  assert.deepEqual(state.signedUrlCalls[0], ['2026/04/09/signed.png', 3600])
  assert.equal(asset.publicUrl, 'https://signed.example/2026/04/09/signed.png?expires=3600')
})

testCase('syncContentAssetUsage limpia y reemplaza el registro del asset asociado', async () => {
  const tableMock = createTableMock({
    maybeSingleResult: {
      data: {
        id: 'usage-1',
        asset_id: CONTENT_ASSET_ID,
        entity_type: 'news',
        entity_id: 'news-1',
        field_path: 'coverImageAssetId',
        locale: 'nb',
        notes: 'Nyhetsartikkel',
      },
      error: null,
    },
    singleResult: {
      data: {
        id: 'usage-2',
        asset_id: CONTENT_ASSET_ID,
        entity_type: 'news',
        entity_id: 'news-1',
        field_path: 'coverImageAssetId',
        locale: 'nb',
        notes: 'Nyhetsartikkel',
      },
      error: null,
    },
  })
  const { client } = createClientMock({ tableMock })
  __setContentAssetsServiceClientResolver(() => client)

  const usage = await syncContentAssetUsage({
    assetId: CONTENT_ASSET_ID,
    entityType: 'news',
    entityId: 'news-1',
    fieldPath: 'coverImageAssetId',
    locale: 'nb',
    notes: 'Nyhetsartikkel',
  })

  assert.equal(tableMock.state.deleteCalled, true)
  assert.equal(usage.assetId, CONTENT_ASSET_ID)
  assert.equal(usage.entityType, 'news')
  assert.equal(usage.entityId, 'news-1')
  assert.equal(usage.fieldPath, 'coverImageAssetId')
  assert.equal(usage.locale, 'nb')
})

testCase('updateAssetMeta actualiza metadata saneada', async () => {
  const tableMock = createTableMock({
    maybeSingleResult: {
      data: createAssetRow({
        alt: 'Nuevo alt',
        caption: null,
        usage_type: 'gallery-home',
        status: 'inactive',
      }),
      error: null,
    },
  })
  const { client } = createClientMock({ tableMock })
  __setContentAssetsServiceClientResolver(() => client)

  const asset = await updateAssetMeta(CONTENT_ASSET_ID, {
    alt: ' Nuevo alt ',
    caption: '   ',
    usageType: ' Gallery Home ',
    status: 'inactive',
  })

  assert.deepEqual(tableMock.state.updatePayload, {
    alt: 'Nuevo alt',
    caption: null,
    usage_type: 'gallery-home',
    status: 'inactive',
  })
  assert.equal(asset.alt, 'Nuevo alt')
  assert.equal(asset.caption, null)
  assert.equal(asset.status, 'inactive')
})

testCase('updateAssetMeta rechaza archived en patch porque eso va por archiveAsset', async () => {
  __setContentAssetsServiceClientResolver(() => ({ from: () => ({}) }))

  await assert.rejects(
    () => updateAssetMeta(CONTENT_ASSET_ID, { status: 'archived' }),
    /Valores permitidos: active, inactive/,
  )
})

testCase('archiveAsset marca el asset como archived', async () => {
  const tableMock = createTableMock({
    maybeSingleResult: {
      data: createAssetRow({ status: 'archived' }),
      error: null,
    },
  })
  const { client } = createClientMock({ tableMock })
  __setContentAssetsServiceClientResolver(() => client)

  const asset = await archiveAsset(CONTENT_ASSET_ID)

  assert.deepEqual(tableMock.state.updatePayload, { status: 'archived' })
  assert.equal(asset.status, 'archived')
})

testCase('archiveAsset propaga errores útiles de Supabase', async () => {
  const tableMock = createTableMock({
    maybeSingleResult: {
      data: null,
      error: { message: 'permission denied' },
    },
  })
  const { client } = createClientMock({ tableMock })
  __setContentAssetsServiceClientResolver(() => client)

  await assert.rejects(
    () => archiveAsset(CONTENT_ASSET_ID),
    /No se pudo archivar el asset .*permission denied/,
  )
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
  } finally {
    __resetContentAssetsServiceClientResolver()
  }
}

if (failed) {
  process.exitCode = 1
  throw new Error('content assets service tests failed')
}

console.log(`\n${cases.length} content assets checks passed`)
