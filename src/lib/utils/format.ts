import { format, formatDistance } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatPrice(
  value: string | number,
  currency = 'USD',
  locale = 'es-PE'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(dateStr: string, pattern = 'dd MMM yyyy'): string {
  return format(new Date(dateStr), pattern, { locale: es })
}

export function formatDateRelative(dateStr: string): string {
  return formatDistance(new Date(dateStr), new Date(), {
    addSuffix: true,
    locale: es,
  })
}

export function formatDuration(days: number, nights: number): string {
  return `${days} día${days !== 1 ? 's' : ''} / ${nights} noche${nights !== 1 ? 's' : ''}`
}

const _BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

export function resolveImage(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${_BASE}${path}`
}
