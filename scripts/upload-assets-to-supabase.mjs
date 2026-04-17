/**
 * One-time migration: upload all local src/assets images to Supabase content-media bucket.
 * Run with: node scripts/upload-assets-to-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, statSync } from 'fs'
import { resolve, join } from 'path'

const SUPABASE_URL = 'https://hahqimviirkkzkvmusga.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhaHFpbXZpaXJra3prdm11c2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzQ5ODAsImV4cCI6MjA4OTg1MDk4MH0.zCp1k_Wnb11GKgd9WymslWFQMc0Y4CI6N-pN_OI6W8U'
const BUCKET = 'content-media'
const ASSETS_DIR = resolve('./src/assets')

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const mime = (filename) => {
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg'
  if (filename.endsWith('.png')) return 'image/png'
  if (filename.endsWith('.webp')) return 'image/webp'
  return 'application/octet-stream'
}

const LOCAL_IMAGES = [
  { file: 'team-hero.jpg',                    key: 'team-hero.jpg',                   label: 'teamHero' },
  { file: 'home/metrics-team.jpg',            key: 'home/metrics-team.jpg',           label: 'homeMetricsTeam' },
  { file: 'alicante/hero-sunset.jpeg',        key: 'alicante/hero-sunset.jpeg',       label: 'spanskAlicanteHeroSunset' },
  { file: 'alicante/beach-palms.jpeg',        key: 'alicante/beach-palms.jpeg',       label: 'spanskAlicanteBeachPalms' },
  { file: 'alicante/promenade-lifestyle.jpg', key: 'alicante/promenade-lifestyle.jpg',label: 'spanskAlicantePromenade' },
  { file: 'alicante/city-view.jpeg',          key: 'alicante/city-view.jpeg',         label: 'spanskAlicanteCityView' },
  { file: 'alicante/castle-arch.jpeg',        key: 'alicante/castle-arch.jpeg',       label: 'spanskAlicanteCastleArch' },
  { file: 'team/miriam-svendsen.jpg',         key: 'team/miriam-svendsen.jpg',         label: 'contactMiriam' },
  { file: 'team/gro-anette.jpg',              key: 'team/gro-anette.jpg',             label: 'contactGro' },
  { file: 'team/pablo-ceo.webp',              key: 'team/pablo-ceo.webp',             label: 'ceoPhoto' },
  { file: 'office/alicante-office.webp',      key: 'office/alicante-office.webp',     label: 'alicanteOffice' },
  { file: 'team/team-group.webp',             key: 'team/team-group.webp',            label: 'teamGroup' },
  { file: 'office/oficina.webp',              key: 'office/oficina.webp',             label: 'oficina' },
  { file: 'clase-noruego.webp',               key: 'clase-noruego.webp',              label: 'claseNoruego' },
  { file: 'helse/nurses.webp',                key: 'helse/nurses.webp',               label: 'enfermeria' },
  { file: 'platform-hero.png',                key: 'platform-hero.png',               label: 'platformHero' },
  { file: 'rekruttering.png',                 key: 'rekruttering.png',                label: 'rekruttering' },
  { file: 'people-team.png',                  key: 'people-team.png',                 label: 'peopleTeam2' },
  { file: 'helse/health-team.jpg',            key: 'helse/health-team.jpg',           label: 'helseHealthTeam' },
]

// CDN images to fetch and re-upload
const CDN_IMAGES = [
  {
    url: 'https://images.squarespace-cdn.com/content/v1/5ec321c2af33de48734cc929/1615224238156-OY2QGA6E03LY3JALP4NL/Rectangle+16.jpg',
    key: 'cdn/people-hero.jpg', label: 'peopleHero', mimeType: 'image/jpeg',
  },
  {
    url: 'https://images.squarespace-cdn.com/content/v1/5ec321c2af33de48734cc929/1615224521708-2NJ8JNMIYIPO2KCL1RU2/Rectangle+16.jpg',
    key: 'cdn/people-cta.jpg', label: 'peopleCTA', mimeType: 'image/jpeg',
  },
  {
    url: 'https://images.squarespace-cdn.com/content/v1/699f19dee84d12556ca836b0/a00ac4da-b7a3-4ada-a655-84cb442ef431/Screenshot+2026-02-26+at+16.20.14.png',
    key: 'cdn/helsesektor.png', label: 'helsesektor', mimeType: 'image/png',
  },
]

const publicUrl = (key) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}`

const results = {}

async function uploadBuffer(key, buffer, mimeType) {
  const { error } = await supabase.storage.from(BUCKET).upload(key, buffer, {
    contentType: mimeType,
    upsert: true,
  })
  if (error) throw new Error(`Storage upload failed for ${key}: ${error.message}`)

  const url = publicUrl(key)

  const sizeBytes = buffer.length
  await supabase.from('content_assets').upsert({
    storage_path: key,
    public_url: url,
    bucket: BUCKET,
    mime_type: mimeType,
    size_bytes: sizeBytes,
    status: 'active',
  }, { onConflict: 'storage_path' })

  return url
}

console.log('⬆️  Uploading local assets...\n')
for (const { file, key, label } of LOCAL_IMAGES) {
  const filePath = join(ASSETS_DIR, file)
  try {
    const buffer = readFileSync(filePath)
    const url = await uploadBuffer(key, buffer, mime(file))
    results[label] = url
    console.log(`  ✅ ${label} → ${url}`)
  } catch (err) {
    console.error(`  ❌ ${label}: ${err.message}`)
  }
}

console.log('\n⬆️  Uploading CDN images...\n')
for (const { url, key, label, mimeType } of CDN_IMAGES) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadedUrl = await uploadBuffer(key, buffer, mimeType)
    results[label] = uploadedUrl
    console.log(`  ✅ ${label} → ${uploadedUrl}`)
  } catch (err) {
    console.error(`  ❌ ${label}: ${err.message}`)
  }
}

console.log('\n📋 Results map (paste into images.js):\n')
for (const [label, url] of Object.entries(results)) {
  console.log(`  ${label}: '${url}',`)
}
