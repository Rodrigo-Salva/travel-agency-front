'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wifi, WifiOff, RefreshCw, LogOut, Loader2, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { whatsappApi } from '@/lib/api/whatsapp'
import { getAccessToken } from '@/lib/api/client'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; connected: boolean }> = {
  WORKING:      { label: 'Conectado',     color: 'text-emerald-400',  icon: <CheckCircle2 className="h-4 w-4" />,              connected: true  },
  SCAN_QR_CODE: { label: 'Esperando QR', color: 'text-amber-400',    icon: <Smartphone className="h-4 w-4" />,                connected: false },
  STARTING:     { label: 'Iniciando...',  color: 'text-blue-400',     icon: <Loader2 className="h-4 w-4 animate-spin" />,      connected: false },
  STOPPED:      { label: 'Desconectado', color: 'text-red-400',      icon: <WifiOff className="h-4 w-4" />,                   connected: false },
  FAILED:       { label: 'Error',         color: 'text-red-400',      icon: <AlertCircle className="h-4 w-4" />,               connected: false },
  ERROR:        { label: 'Sin conexión',  color: 'text-brand-steel',  icon: <WifiOff className="h-4 w-4" />,                   connected: false },
}

interface Props {
  onConnected: () => void
}

function QRImage({ refreshKey }: { refreshKey: number }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const prevBlobUrl = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    fetch(whatsappApi.getQrUrl(), {
      headers: {
        Authorization: `Bearer ${getAccessToken() ?? ''}`,
      },
      cache: 'no-store',
    })
      .then(r => {
        if (!r.ok) throw new Error('QR error')
        return r.blob()
      })
      .then(blob => {
        if (cancelled) return
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
        if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current)
        prevBlobUrl.current = url
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) { setError(true); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [refreshKey])

  if (loading) return <div className="w-56 h-56 flex items-center justify-center"><Loader2 className="h-8 w-8 text-gray-300 animate-spin" /></div>
  if (error)   return <div className="w-56 h-56 flex flex-col items-center justify-center gap-2 text-red-400 text-sm"><AlertCircle className="h-6 w-6" />No se pudo cargar el QR</div>
  return <img src={blobUrl!} alt="QR WhatsApp" className="w-56 h-56 object-contain" />
}

export function SessionManager({ onConnected }: Props) {
  const queryClient = useQueryClient()
  const [qrKey, setQrKey] = useState(0)
  const [showQr, setShowQr] = useState(false)

  const { data: session, isLoading } = useQuery({
    queryKey: ['whatsapp', 'session'],
    queryFn: whatsappApi.getSessionStatus,
    refetchInterval: 3000,
  })

  const startMutation = useMutation({
    mutationFn: whatsappApi.startSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'session'] })
      toast.success('Sesión iniciada — escanea el QR con tu teléfono')
      setShowQr(true)
      setQrKey(k => k + 1)
    },
    onError: () => toast.error('No se pudo iniciar la sesión'),
  })

  const logoutMutation = useMutation({
    mutationFn: whatsappApi.logoutSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'session'] })
      setShowQr(false)
      toast.success('Sesión cerrada')
    },
    onError: () => toast.error('Error al cerrar sesión'),
  })

  const sessionStatus = session?.status ?? 'ERROR'
  const cfg = STATUS_CONFIG[sessionStatus] ?? STATUS_CONFIG['ERROR']
  const isConnected = cfg.connected

  useEffect(() => {
    if (isConnected) { setShowQr(false); onConnected() }
  }, [isConnected, onConnected])

  useEffect(() => {
    if (sessionStatus === 'SCAN_QR_CODE') setShowQr(true)
  }, [sessionStatus])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 text-brand-steel animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
      {/* Estado */}
      <div className="text-center space-y-2">
        <div className={`flex items-center justify-center gap-2 text-lg font-semibold ${cfg.color}`}>
          {cfg.icon}
          {cfg.label}
        </div>
        <p className="text-brand-steel text-sm">
          {isConnected
            ? 'WhatsApp conectado y listo para recibir mensajes'
            : sessionStatus === 'SCAN_QR_CODE'
              ? 'Abre WhatsApp en tu teléfono → Dispositivos vinculados → Vincular'
              : 'Inicia la sesión para conectar tu número de WhatsApp'}
        </p>
      </div>

      {/* QR Code */}
      {showQr && sessionStatus === 'SCAN_QR_CODE' && (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-xl">
            <QRImage refreshKey={qrKey} />
          </div>
          <button
            onClick={() => setQrKey(k => k + 1)}
            className="flex items-center gap-1.5 text-xs text-brand-steel hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar QR
          </button>
          <p className="text-xs text-brand-steel/60 text-center max-w-xs">
            El QR expira en ~60 segundos. Si ya escaneaste, espera unos segundos.
          </p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {!isConnected && sessionStatus !== 'SCAN_QR_CODE' && (
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending || sessionStatus === 'STARTING'}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {startMutation.isPending || sessionStatus === 'STARTING'
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Wifi className="h-4 w-4" />}
            {startMutation.isPending ? 'Iniciando...' : 'Conectar WhatsApp'}
          </button>
        )}

        {sessionStatus === 'SCAN_QR_CODE' && (
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-brand-steel/20 text-brand-steel hover:text-white hover:border-brand-steel/40 text-sm transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerar QR
          </button>
        )}

        {isConnected && (
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
          >
            {logoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Cerrar sesión WhatsApp
          </button>
        )}
      </div>
    </div>
  )
}
