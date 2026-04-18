export interface ApiEnvelope {
  exito: boolean
  mensaje: string
  [key: string]: unknown
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  exito: false
  mensaje: string
  errores?: Record<string, string[]>
  detalles?: string
}
