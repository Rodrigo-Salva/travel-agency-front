'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Users, Search, Loader2, UserCheck, UserX,
  ShieldCheck, User, Plus, Pencil, X,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatDate } from '@/lib/utils/format'

const PAGE_SIZE = 8

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
  city?: string
  date_joined: string
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  user_type: z.enum(['admin', 'customer']),
})

const editSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  user_type: z.enum(['admin', 'customer']),
  is_active: z.boolean(),
})

type CreateForm = z.infer<typeof createSchema>
type EditForm = z.infer<typeof editSchema>

// ── Modal ─────────────────────────────────────────────────────────────────────

function UserModal({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!user

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { user_type: 'customer' },
  })

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: isEdit ? {
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      email: user.email,
      phone: user.phone ?? '',
      country: user.country ?? '',
      city: user.city ?? '',
      user_type: user.user_type,
      is_active: user.is_active,
    } : undefined,
  })

  const mutation = useMutation({
    mutationFn: (values: CreateForm | EditForm) => {
      if (isEdit) {
        const payload = { ...values, is_active: !!(values as EditForm).is_active }
        return apiClient.patch(API.auth.user(user.id), payload)
      }
      return apiClient.post(API.auth.users, values)
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Usuario actualizado' : 'Usuario creado')
      qc.invalidateQueries({ queryKey: ['users'] })
      onClose()
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      if (data?.errores) {
        const first = Object.values(data.errores as Record<string, string[]>).flat()[0]
        toast.error(first ?? 'Error')
      } else if (data?.detail) {
        toast.error(String(data.detail))
      } else {
        toast.error(isEdit ? 'Error al actualizar' : 'Error al crear')
      }
    },
  })

  const fc = 'bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine'

  const Fields = ({ form, withPassword }: { form: typeof createForm | typeof editForm; withPassword?: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {withPassword && (
          <>
            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Usuario *</Label>
              <Input {...(form as typeof createForm).register('username')} className={fc} />
              {(form as typeof createForm).formState.errors.username && (
                <p className="text-red-400 text-xs">{(form as typeof createForm).formState.errors.username?.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Email *</Label>
              <Input type="email" {...(form as typeof createForm).register('email')} className={fc} />
              {(form as typeof createForm).formState.errors.email && (
                <p className="text-red-400 text-xs">{(form as typeof createForm).formState.errors.email?.message}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-brand-silver text-xs">Contraseña *</Label>
              <Input type="password" {...(form as typeof createForm).register('password')} className={fc} />
              {(form as typeof createForm).formState.errors.password && (
                <p className="text-red-400 text-xs">{(form as typeof createForm).formState.errors.password?.message}</p>
              )}
            </div>
          </>
        )}
        {!withPassword && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-brand-silver text-xs">Email *</Label>
            <Input type="email" {...(form as typeof editForm).register('email')} className={fc} />
            {(form as typeof editForm).formState.errors.email && (
              <p className="text-red-400 text-xs">{(form as typeof editForm).formState.errors.email?.message}</p>
            )}
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-brand-silver text-xs">Nombre</Label>
          <Input {...form.register('first_name' as never)} className={fc} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-brand-silver text-xs">Apellido</Label>
          <Input {...form.register('last_name' as never)} className={fc} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-brand-silver text-xs">Teléfono</Label>
          <Input {...form.register('phone' as never)} className={fc} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-brand-silver text-xs">País</Label>
          <Input {...form.register('country' as never)} className={fc} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-brand-silver text-xs">Ciudad</Label>
          <Input {...form.register('city' as never)} className={fc} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-brand-silver text-xs">Rol</Label>
          <select {...form.register('user_type' as never)} className="w-full bg-brand-darkest border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-wine">
            <option value="customer">Cliente</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      {!withPassword && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...(form as typeof editForm).register('is_active')} className="w-4 h-4 accent-brand-wine" />
          <span className="text-sm text-brand-silver">Usuario activo</span>
        </label>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-brand-dark border border-brand-steel/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-steel/10 shrink-0">
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Usuarios</p>
            <h2 className="font-display text-xl font-bold text-white">
              {isEdit ? `Editar: ${user.username}` : 'Nuevo usuario'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={isEdit
            ? editForm.handleSubmit((d) => mutation.mutate(d))
            : createForm.handleSubmit((d) => mutation.mutate(d))}
          className="overflow-y-auto flex-1"
        >
          <div className="p-6">
            {isEdit
              ? <Fields form={editForm} withPassword={false} />
              : <Fields form={createForm} withPassword={true} />
            }
          </div>
          <div className="px-6 py-4 border-t border-brand-steel/10 flex gap-3 shrink-0">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-60 text-sm">
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white transition-colors text-sm font-medium">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-brand-steel/10">
      <p className="text-xs text-brand-steel">
        Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | '...')[]>((acc, p, i, arr) => {
            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === '...' ? (
              <span key={`e${i}`} className="px-2 text-brand-steel text-xs">…</span>
            ) : (
              <button key={p} onClick={() => onChange(p as number)}
                className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-brand-wine text-white' : 'text-brand-steel hover:text-white hover:bg-brand-steel/10'}`}>
                {p}
              </button>
            )
          )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'admin' | 'customer'>('all')
  const [page, setPage] = useState(1)
  const [modalUser, setModalUser] = useState<AdminUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<{ users: AdminUser[]; count: number }>({
    queryKey: ['users', 'admin', page, search, typeFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (typeFilter !== 'all') params.user_type = typeFilter
      const { data } = await apiClient.get(API.auth.users, { params })
      if ('results' in data) {
        return {
          count: data.count ?? 0,
          users: data.results?.usuarios ?? data.results ?? [],
        }
      }
      const list = data.usuarios ?? []
      return { count: list.length, users: list }
    },
    staleTime: 2 * 60 * 1000,
  })

  const users = data?.users ?? []
  const total = data?.count ?? 0

  // Reset to page 1 when filters change
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleType = (t: typeof typeFilter) => { setTypeFilter(t); setPage(1) }

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiClient.patch(API.auth.user(id), { is_active }),
    onSuccess: (_, { is_active }) => {
      toast.success(is_active ? 'Usuario activado' : 'Usuario desactivado')
      qc.invalidateQueries({ queryKey: ['users'] })
      setTogglingId(null)
    },
    onError: () => { toast.error('Error'); setTogglingId(null) },
  })

  return (
    <div className="p-6 space-y-6">
      {modalOpen && <UserModal user={modalUser} onClose={() => setModalOpen(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
          <h1 className="font-display text-3xl font-bold text-white">Usuarios</h1>
          <p className="text-brand-silver text-sm mt-1">{total} usuarios registrados</p>
        </div>
        <button onClick={() => { setModalUser(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
          <Input placeholder="Buscar usuario..." value={search} onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
        </div>
        <div className="flex gap-2">
          {(['all', 'admin', 'customer'] as const).map((t) => (
            <button key={t} onClick={() => handleType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === t ? 'bg-brand-wine text-white' : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:text-white'}`}>
              {t === 'all' ? 'Todos' : t === 'admin' ? 'Admins' : 'Clientes'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay usuarios</p>
          </div>
        ) : (
          <>
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
                  {users.map((u) => (
                    <tr key={u.id} className={`transition-colors ${!u.is_active ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-brand-steel/5'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${u.user_type === 'admin' ? 'bg-brand-wine/20' : 'bg-brand-steel/10'}`}>
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
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {u.is_active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {u.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setModalUser(u); setModalOpen(true) }}
                            className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {u.user_type !== 'admin' && (
                            togglingId === u.id ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => toggleMutation.mutate({ id: u.id, is_active: !u.is_active })}
                                  disabled={toggleMutation.isPending}
                                  className={`text-xs font-medium ${u.is_active ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                                >
                                  {toggleMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                                </button>
                                <button onClick={() => setTogglingId(null)} className="text-xs text-brand-steel hover:text-white">No</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setTogglingId(u.id)}
                                className={`text-xs font-medium transition-colors ${u.is_active ? 'text-brand-steel hover:text-red-400' : 'text-brand-steel hover:text-emerald-400'}`}
                              >
                                {u.is_active ? 'Desactivar' : 'Activar'}
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
