const WHITESPACE_RE = /\s/
const BLOCKED_PROTOCOL_RE = /^(?:javascript|data|vbscript)\s*:/i
const SAFE_FRAGMENT_RE = /^#[A-Za-z0-9._:-]+$/
const SAFE_PATH_RE = /^\/(?!\/)[A-Za-z0-9._~%-]+(?:\/[A-Za-z0-9._~%-]+)*(?:#[A-Za-z0-9._:-]+)?$/

const isValidMarkdownLinkText = (text) => typeof text === 'string' && text.length > 0

const hasControlCharacters = (value) => {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code <= 31 || code === 127) return true
  }

  return false
}

export function isSafeInlineLinkTarget(target) {
  if (typeof target !== 'string') return false

  if (target.trim() !== target) return false
  if (!target || WHITESPACE_RE.test(target) || hasControlCharacters(target)) return false
  if (BLOCKED_PROTOCOL_RE.test(target)) return false
  if (target.startsWith('//')) return false

  return SAFE_FRAGMENT_RE.test(target) || SAFE_PATH_RE.test(target)
}

function parseInlineLinkCandidateAtIndex(source, startIndex) {
  if (source[startIndex] !== '[') return null

  const previousChar = startIndex > 0 ? source[startIndex - 1] : ''
  if (previousChar === '!' || previousChar === '\\') return null

  const closeBracketIndex = source.indexOf('](', startIndex + 1)
  if (closeBracketIndex === -1) return null

  const linkText = source.slice(startIndex + 1, closeBracketIndex)
  if (!isValidMarkdownLinkText(linkText)) return null

  const targetStartIndex = closeBracketIndex + 2
  let closeParenIndex = -1
  let nestedParens = 0

  for (let index = targetStartIndex; index < source.length; index += 1) {
    const character = source[index]

    if (character === '(') {
      nestedParens += 1
      continue
    }

    if (character !== ')') continue

    if (nestedParens === 0) {
      closeParenIndex = index
      break
    }

    nestedParens -= 1
  }

  if (closeParenIndex === -1) return null

  return {
    endIndex: closeParenIndex + 1,
    href: source.slice(targetStartIndex, closeParenIndex),
    text: linkText,
  }
}

function parseInlineLinkAtIndex(source, startIndex) {
  const candidate = parseInlineLinkCandidateAtIndex(source, startIndex)
  if (!candidate) return null
  if (!isSafeInlineLinkTarget(candidate.href)) return null
  return candidate
}

export function sanitizeInlineLinkMarkdown(value, isAllowedDestination = () => true) {
  const source = value == null ? '' : String(value)
  let sanitized = ''
  let index = 0

  while (index < source.length) {
    if (source[index] === '[') {
      const candidate = parseInlineLinkCandidateAtIndex(source, index)

      if (candidate) {
        const isAllowed = isSafeInlineLinkTarget(candidate.href) && isAllowedDestination(candidate.href)
        sanitized += isAllowed ? source.slice(index, candidate.endIndex) : candidate.text
        index = candidate.endIndex

        if (!isAllowed && candidate.href.includes('(') && source[index] === ')') {
          index += 1
        }
        continue
      }
    }

    sanitized += source[index]
    index += 1
  }

  return sanitized
}

export function parseInlineLinkTokens(value) {
  const source = value == null ? '' : String(value)
  const tokens = []
  let buffer = ''
  let index = 0

  while (index < source.length) {
    if (source[index] === '[') {
      const parsedLink = parseInlineLinkAtIndex(source, index)

      if (parsedLink) {
        if (buffer) {
          tokens.push({ type: 'text', value: buffer })
          buffer = ''
        }

        tokens.push({
          type: 'link',
          href: parsedLink.href,
          value: parsedLink.text,
        })

        index = parsedLink.endIndex
        continue
      }
    }

    buffer += source[index]
    index += 1
  }

  if (buffer) {
    tokens.push({ type: 'text', value: buffer })
  }

  return tokens
}

export default parseInlineLinkTokens
