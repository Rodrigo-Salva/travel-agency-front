'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Search, Loader2, UserCheck, UserX, ShieldCheck, User } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatDate } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'

interface AdminUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  user_type: 'admin' | 'customer'
  is_active: boolean
  phone?: string
  country?: string
  date_joined: string
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'admin' | 'customer'>('all')
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null)
  const qc = useQueryClient()

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['users', 'admin'],
    queryFn: async () => {
      const { data } = await apiClient.get(API.auth.users, { params: { page_size: 200 } })
      if ('results' in data) return data.results?.usuarios ?? data.results ?? []
      return data.usuarios ?? []
    },
    staleTime: 60 * 1000,
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(API.auth.user(id)),
    onSuccess: () => {
      toast.success('Usuario desactivado')
      qc.invalidateQueries({ queryKey: ['users'] })
      setDeactivatingId(null)
    },
    onError: () => { toast.error('Error al desactivar'); setDeactivatingId(null) },
  })

  const filtered = users.filter((u) => {
    if (typeFilter !== 'all' && u.user_type !== typeFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        u.username.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(s)
      )
    }
    return true
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="font-display text-3xl font-bold text-white">Usuarios</h1>
        <p className="text-brand-silver text-sm mt-1">{users.length} usuarios registrados</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
          <Input placeholder="Buscar usuario..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
        </div>
        <div className="flex gap-2">
          {(['all', 'admin', 'customer'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === t ? 'bg-brand-wine text-white' : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:text-white'}`}>
              {t === 'all' ? 'Todos' : t === 'admin' ? 'Admins' : 'Clientes'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Usuario', 'Email', 'Rol', 'País', 'Registro', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-brand-wine/20 flex items-center justify-center shrink-0">
                          {u.user_type === 'admin'
                            ? <ShieldCheck className="h-3.5 w-3.5 text-brand-wine" />
                            : <User className="h-3.5 w-3.5 text-brand-silver" />}
                        </div>
                        <div>
                          <p className="font-medium text-white text-xs">{u.first_name || u.username} {u.last_name}</p>
                          <p className="text-brand-steel text-xs">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-silver text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${u.user_type === 'admin' ? 'text-brand-wine' : 'text-brand-silver'}`}>
                        {u.user_type === 'admin' ? 'Admin' : 'Cliente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-steel text-xs">{u.country || '—'}</td>
                    <td className="px-4 py-3 text-brand-steel text-xs whitespace-nowrap">{formatDate(u.date_joined)}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${u.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                        {u.is_active ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_active && u.user_type !== 'admin' && (
                        deactivatingId === u.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => deactivateMutation.mutate(u.id)} disabled={deactivateMutation.isPending}
                              className="text-xs text-red-400 hover:text-red-300 font-medium">
                              {deactivateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                            </button>
                            <button onClick={() => setDeactivatingId(null)} className="text-xs text-brand-steel hover:text-white">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeactivatingId(u.id)}
                            className="text-xs text-brand-steel hover:text-red-400 font-medium transition-colors">
                            Desactivar
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
