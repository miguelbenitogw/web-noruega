export const clampPageToTotalPages = (page, totalPages) => {
  const resolvedPage = Number.parseInt(page ?? 1, 10)
  const normalizedPage = Number.isInteger(resolvedPage) && resolvedPage > 0 ? resolvedPage : 1

  const resolvedTotalPages = Number.parseInt(totalPages ?? 0, 10)
  const normalizedTotalPages = Number.isInteger(resolvedTotalPages) && resolvedTotalPages > 0 ? resolvedTotalPages : 0

  if (normalizedTotalPages > 0) {
    return Math.min(normalizedPage, normalizedTotalPages)
  }

  return normalizedPage
}
