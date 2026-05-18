'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
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
    <div className="min-h-screen bg-brand-darkest flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertTriangle className="h-10 w-10 text-red-400" />
      </div>
      <h1 className="font-display text-3xl font-bold text-white mb-3">Algo salió mal</h1>
      <p className="text-brand-silver text-base max-w-md mb-8">
        Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white font-semibold text-sm hover:bg-brand-wine/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Intentar de nuevo
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-steel/30 text-brand-silver font-semibold text-sm hover:text-white hover:border-brand-steel/60 transition-colors"
        >
          <Home className="h-4 w-4" /> Ir al inicio
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-brand-steel/40 font-mono">ID: {error.digest}</p>
      )}
    </div>
  )
}
