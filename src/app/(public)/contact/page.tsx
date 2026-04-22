'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Metadata } from 'next'

const schema = z.object({
  name:    z.string().min(2, 'Mínimo 2 caracteres'),
  email:   z.string().email('Email inválido'),
  subject: z.string().min(3, 'Mínimo 3 caracteres'),
  message: z.string().min(20, 'Mínimo 20 caracteres'),
})
type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const send = useMutation({
    mutationFn: (values: FormData) => apiClient.post(API.inquiries, values),
    onSuccess: () => {
      toast.success('¡Mensaje enviado! Te responderemos pronto.')
      reset()
    },
    onError: () => toast.error('No se pudo enviar el mensaje'),
  })

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero */}
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest border-b border-brand-steel/10 pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">Contáctanos</p>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Estamos aquí para ayudarte</h1>
          <p className="text-brand-silver text-lg max-w-xl mx-auto">
            ¿Tienes preguntas sobre nuestros paquetes? Escríbenos y te responderemos en menos de 24 horas.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-semibold text-white text-lg mb-6">Información de contacto</h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Dirección', value: 'Av. Larco 1301, Miraflores\nLima, Perú' },
                  { icon: Phone, label: 'Teléfono', value: '+51 999 999 999' },
                  { icon: Mail, label: 'Email', value: 'info@travelagency.com' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-wine/10 border border-brand-wine/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-brand-rose" />
                    </div>
                    <div>
                      <p className="text-xs text-brand-steel uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-white text-sm whitespace-pre-line">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
              <p className="text-xs text-brand-steel uppercase tracking-wider mb-3">Horario de atención</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-silver">Lunes – Viernes</span>
                  <span className="text-white">9:00 – 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-silver">Sábados</span>
                  <span className="text-white">9:00 – 13:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-silver">Domingos</span>
                  <span className="text-brand-steel">Cerrado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-8">
              <h2 className="font-semibold text-white text-lg mb-6">Envíanos un mensaje</h2>
              <form onSubmit={handleSubmit(v => send.mutate(v))} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-brand-silver text-sm">Nombre *</Label>
                    <Input {...register('name')} placeholder="Tu nombre"
                      className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel" />
                    {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-brand-silver text-sm">Email *</Label>
                    <Input {...register('email')} type="email" placeholder="tu@email.com"
                      className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel" />
                    {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-brand-silver text-sm">Asunto *</Label>
                  <Input {...register('subject')} placeholder="¿En qué podemos ayudarte?"
                    className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel" />
                  {errors.subject && <p className="text-xs text-red-400">{errors.subject.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-brand-silver text-sm">Mensaje *</Label>
                  <textarea
                    {...register('message')} rows={6}
                    placeholder="Cuéntanos más sobre lo que necesitas..."
                    className="w-full rounded-xl bg-brand-darkest/60 border border-brand-steel/20 text-white placeholder:text-brand-steel text-sm px-3 py-2.5 focus:outline-none focus:border-brand-wine resize-none"
                  />
                  {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={send.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50"
                >
                  {send.isPending
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                    : <><Send className="h-4 w-4" /> Enviar mensaje</>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
