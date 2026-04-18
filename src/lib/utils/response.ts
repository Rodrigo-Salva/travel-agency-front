import type { ApiEnvelope } from '@/types/api.types'

/**
 * Extracts data from Django's response envelope:
 * { exito: true, mensaje: "...", [dataKey]: data }
 *
 * The data key is dynamic (e.g. "usuario", "paquetes", "reservas")
 */
export function extractData<T>(envelope: ApiEnvelope, knownKey?: string): T {
  if (!envelope.exito) {
    throw new Error(envelope.mensaje || 'Error en la solicitud')
  }

  if (knownKey && knownKey in envelope) {
    return envelope[knownKey] as T
  }

  // Auto-detect: first key that is not a meta field
  const META_KEYS = new Set(['exito', 'mensaje', 'count', 'next', 'previous', 'errores', 'detalles'])
  const dataKey = Object.keys(envelope).find((k) => !META_KEYS.has(k))

  if (!dataKey) {
    throw new Error('No se encontro data en la respuesta')
  }

  return envelope[dataKey] as T
}
