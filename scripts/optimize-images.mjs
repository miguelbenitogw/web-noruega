import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const ASSETS_DIR = path.resolve('src/assets')

const convertToWebP = async (inputPath) => {
  const ext = path.extname(inputPath)
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return null

  const outputPath = inputPath.replace(ext, '.webp')

  try {
    await stat(outputPath)
    return null
  } catch {
    // File doesn't exist, convert
  }

  const inputStat = await stat(inputPath)
  const info = await sharp(inputPath)
    .webp({ quality: 80, effort: 6 })
    .toFile(outputPath)

  const saved = ((1 - info.size / inputStat.size) * 100).toFixed(1)
  console.log(`  ${path.basename(inputPath)} → ${path.basename(outputPath)} (${saved}% smaller)`)
  return outputPath
}

const scanDir = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  let converted = 0

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      converted += await scanDir(fullPath)
    } else if (entry.isFile()) {
      const result = await convertToWebP(fullPath)
      if (result) converted++
    }
  }

  return converted
}

const run = async () => {
  console.log('Optimizing images...')
  const count = await scanDir(ASSETS_DIR)
  if (count > 0) {
    console.log(`Optimized ${count} images to WebP.`)
  } else {
    console.log('All images already optimized.')
  }
}

run().catch((error) => {
  console.error('Image optimization failed:', error)
  process.exit(1)
})
