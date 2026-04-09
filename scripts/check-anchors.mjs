import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const SRC_DIR = path.resolve('src')
const SCAN_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx'])
const ANCHOR_VALUE_PATTERN = '[A-Za-z0-9._:-]+'

const hrefAnchorRegex = new RegExp(`href="(\\/[^"]*?)#(${ANCHOR_VALUE_PATTERN})"`, 'g')
const rawHrefRegex = new RegExp(`href="#(${ANCHOR_VALUE_PATTERN})"`, 'g')
const idRegex = new RegExp(`id="(${ANCHOR_VALUE_PATTERN})"`, 'g')
const allowedRawAnchors = new Set(['main-content'])

const readAllFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue
      files.push(...await readAllFiles(fullPath))
      continue
    }
    if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length

const run = async () => {
  const files = await readAllFiles(SRC_DIR)
  const ids = new Set()
  const references = []
  const rawRefs = []

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf8')
    const relative = path.relative(process.cwd(), filePath)
    const fileIds = new Set()

    for (const match of content.matchAll(idRegex)) {
      ids.add(match[1])
      fileIds.add(match[1])
    }
    for (const match of content.matchAll(hrefAnchorRegex)) {
      references.push({
        target: match[2],
        path: match[1],
        file: relative,
        line: lineOf(content, match.index),
      })
    }
    for (const match of content.matchAll(rawHrefRegex)) {
      if (allowedRawAnchors.has(match[1])) continue
      if (fileIds.has(match[1])) continue
      rawRefs.push({
        target: match[1],
        file: relative,
        line: lineOf(content, match.index),
      })
    }
  }

  const missing = references.filter(ref => !ids.has(ref.target))
  let hasErrors = false

  if (rawRefs.length) {
    hasErrors = true
    console.error('Found raw in-page anchors without a matching id in the same file:')
    for (const ref of rawRefs) {
      console.error(`- ${ref.file}:${ref.line} -> #${ref.target}`)
    }
  }

  if (missing.length) {
    hasErrors = true
    console.error('Found anchor links without matching id:')
    for (const ref of missing) {
      console.error(`- ${ref.file}:${ref.line} -> ${ref.path}#${ref.target}`)
    }
  }

  if (hasErrors) {
    process.exit(1)
  }

  console.log(`Anchor check passed (${references.length} links / ${ids.size} ids).`)
}

run().catch((error) => {
  console.error('Anchor validation failed:', error)
  process.exit(1)
})
