interface PaginationMeta {
  total: number
  page: number
  limit: number
}

export function ok<T>(data: T, meta?: PaginationMeta) {
  return { success: true, data, ...(meta && { meta }) }
}

export function created<T>(data: T) {
  return { success: true, data }
}

export function noContent() {
  return { success: true, data: null }
}

export function fail(code: string, message: string, details?: unknown) {
  return { success: false, error: { code, message, ...(details ? { details } : {}) } }
}
