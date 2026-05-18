'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center py-24">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="font-display text-2xl font-bold text-white mb-2">Error al cargar</h2>
      <p className="text-brand-silver text-sm max-w-sm mb-6">
        No se pudo cargar esta sección. Verifica tu conexión e intenta de nuevo.
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reintentar
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-steel/20 text-brand-silver text-sm font-medium hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Inicio
        </Link>
      </div>
    </div>
  )
}
