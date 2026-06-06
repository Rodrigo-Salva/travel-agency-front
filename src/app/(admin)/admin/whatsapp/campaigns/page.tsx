'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Rocket, Loader2, Users, Clock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { whatsappApi, type WACampaign } from '@/lib/api/whatsapp'
import { useWhatsAppSocket } from '@/hooks/useWhatsApp'

const STATUS_CONFIG: Record<WACampaign['status'], { label: string; color: string }> = {
  draft:     { label: 'Borrador',       color: 'text-brand-steel' },
  running:   { label: 'En ejecución',   color: 'text-amber-400' },
  paused:    { label: 'Pausada',        color: 'text-yellow-400' },
  completed: { label: 'Completada',     color: 'text-emerald-400' },
  failed:    { label: 'Fallida',        color: 'text-red-400' },
}

export default function CampaignsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', message_template: '', delay_between_ms: 5000 })
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set())

  useWhatsAppSocket()

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['whatsapp', 'campaigns'],
    queryFn: whatsappApi.getCampaigns,
  })

  const { data: contacts = [] } = useQuery({
    queryKey: ['whatsapp', 'contacts-for-campaign'],
    queryFn: async () => {
      const convs = await whatsappApi.getConversations()
      return convs.filter(c => c.contact?.id).map(c => c.contact)
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      return whatsappApi.createCampaign({
        name: form.name,
        message_template: form.message_template,
        contact_ids: Array.from(selectedContacts),
        delay_between_ms: form.delay_between_ms,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'campaigns'] })
      setOpen(false)
      setForm({ name: '', message_template: '', delay_between_ms: 5000 })
      setSelectedContacts(new Set())
      toast.success('Campaña creada')
    },
    onError: () => toast.error('Error al crear campaña'),
  })

  function toggleContact(id: number) {
    setSelectedContacts(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set())
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id)))
    }
  }

  function cleanPhone(phone: string | undefined) {
    return (phone ?? '').replace(/@.*/, '')
  }

  const launchMutation = useMutation({
    mutationFn: (id: number) => whatsappApi.launchCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'campaigns'] })
      toast.success('Campaña lanzada')
    },
    onError: () => toast.error('Error al lanzar campaña'),
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/whatsapp" className="text-brand-steel hover:text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold text-white">Campañas WhatsApp</h1>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva campaña
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 text-brand-steel animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-brand-steel">
          <Users className="h-10 w-10 opacity-30 mx-auto mb-3" />
          <p className="text-sm">Sin campañas. Crea una para comenzar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => {
            const cfg = STATUS_CONFIG[campaign.status] ?? { label: campaign.status, color: 'text-brand-steel' }
            return (
              <div key={campaign.id} className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white text-sm">{campaign.name}</h3>
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-brand-steel mt-1 line-clamp-2">{campaign.message_template}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-brand-steel/60">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {campaign.contacts.length} contactos
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.round(campaign.delay_between_ms / 1000)}s entre mensajes
                      </span>
                      <span>{format(new Date(campaign.created_at), "d MMM yyyy", { locale: es })}</span>
                    </div>
                  </div>
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => launchMutation.mutate(campaign.id)}
                      disabled={launchMutation.isPending}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-40 text-xs font-medium transition-colors"
                    >
                      {launchMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
                      Lanzar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-brand-dark border-brand-steel/20 text-white max-w-md">
          <h2 className="text-lg font-semibold mb-4">Nueva Campaña</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-brand-steel text-xs mb-1">Nombre</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Promo Verano 2025"
                className="bg-brand-surface border-brand-steel/20 text-white"
              />
            </div>
            <div>
              <Label className="text-brand-steel text-xs mb-1">Mensaje</Label>
              <Textarea
                value={form.message_template}
                onChange={e => setForm(f => ({ ...f, message_template: e.target.value }))}
                placeholder="Hola, tenemos una oferta especial para ti..."
                className="bg-brand-surface border-brand-steel/20 text-white min-h-[100px] resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-brand-steel text-xs">
                  Contactos ({selectedContacts.size} de {contacts.length} seleccionados)
                </Label>
                {contacts.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {selectedContacts.size === contacts.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </button>
                )}
              </div>
              {contacts.length === 0 ? (
                <div className="rounded-xl border border-brand-steel/20 bg-brand-surface/50 px-4 py-6 text-center text-xs text-brand-steel">
                  No tienes conversaciones aún. Envía un mensaje primero para que aparezcan los contactos.
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 max-h-48 overflow-y-auto divide-y divide-white/5">
                  {contacts.map(contact => {
                    const checked = selectedContacts.has(contact.id)
                    const phone = cleanPhone(contact.phone)
                    const displayName = contact.name || phone
                    return (
                      <label
                        key={contact.id}
                        onClick={() => toggleContact(contact.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                          checked ? 'bg-emerald-500/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          checked ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
                        }`}>
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white leading-tight truncate">{displayName}</p>
                          {contact.name && phone && (
                            <p className="text-[10px] text-white/40 truncate">{phone}</p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
            <div>
              <Label className="text-brand-steel text-xs mb-1">Delay entre mensajes</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1000}
                  step={1000}
                  value={form.delay_between_ms / 1000}
                  onChange={e => setForm(f => ({ ...f, delay_between_ms: parseInt(e.target.value) * 1000 }))}
                  className="bg-brand-surface border-brand-steel/20 text-white w-24"
                />
                <span className="text-brand-steel text-sm">segundos</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-xl border border-brand-steel/20 text-brand-steel hover:text-white hover:border-brand-steel/40 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.name || !form.message_template || selectedContacts.size === 0}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Crear campaña'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
