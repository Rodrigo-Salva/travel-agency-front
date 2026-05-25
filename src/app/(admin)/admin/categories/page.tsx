'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tag, Plus, Pencil, Trash2, X, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'

interface Category {
  id: number
  name: string
  slug: string
  description: string
  packages_count?: number
}

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

function CategoryModal({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!category

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? { name: category.name, description: category.description } : {},
  })

  const mutation = useMutation({
    mutationFn: (values: FormData) =>
      isEdit
        ? apiClient.patch(API.category(category.id), values)
        : apiClient.post(API.categories, values),
    onSuccess: () => {
      toast.success(isEdit ? 'Categoría actualizada' : 'Categoría creada')
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      onClose()
    },
    onError: () => toast.error(isEdit ? 'Error al actualizar' : 'Error al crear'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-brand-dark border border-brand-steel/20 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-steel/10">
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Categorías</p>
            <h2 className="font-display text-xl font-bold text-white">
              {isEdit ? `Editar: ${category.name}` : 'Nueva categoría'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-brand-silver text-xs">Nombre *</Label>
            <Input {...register('name')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-brand-silver text-xs">Descripción</Label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-xl bg-brand-darkest border border-brand-steel/20 text-white text-sm px-3 py-2 focus:outline-none focus:border-brand-wine resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-brand-steel/20 text-brand-silver text-sm hover:text-white hover:bg-brand-steel/10 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null })
  const [deleting, setDeleting] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await apiClient.get(API.categories)
      return res.data as Category[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(API.category(id)),
    onSuccess: () => {
      toast.success('Categoría eliminada')
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      setDeleting(null)
    },
    onError: () => toast.error('No se pudo eliminar'),
  })

  const filtered = (data ?? []).filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-brand-dark border-b border-brand-steel/10 px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Tag className="h-6 w-6 text-brand-wine" /> Categorías de paquetes
            </h1>
          </div>
          <button
            onClick={() => setModal({ open: true, category: null })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Nueva categoría
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar categorías..."
            className="pl-9 bg-brand-dark border-brand-steel/20 text-white"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-brand-wine animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="h-12 w-12 text-brand-steel/20 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No hay categorías</p>
            <p className="text-brand-steel text-sm">Crea la primera categoría para organizar los paquetes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(cat => (
              <div key={cat.id} className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 flex flex-col gap-3 hover:border-brand-steel/25 transition-colors group">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-brand-wine/10 border border-brand-wine/20 flex items-center justify-center flex-shrink-0">
                    <Tag className="h-4 w-4 text-brand-rose" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal({ open: true, category: cat })}
                      className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/15 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {deleting === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => deleteMutation.mutate(cat.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors" disabled={deleteMutation.isPending}>
                          {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="text-xs font-medium px-1">Sí</span>}
                        </button>
                        <button onClick={() => setDeleting(null)} className="p-1.5 rounded-lg text-brand-steel hover:text-white transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleting(cat.id)}
                        className="p-1.5 rounded-lg text-brand-steel hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white mb-0.5">{cat.name}</p>
                  <p className="text-xs text-brand-steel font-mono mb-1">/{cat.slug}</p>
                  {cat.description && (
                    <p className="text-xs text-brand-silver/70 leading-relaxed line-clamp-2">{cat.description}</p>
                  )}
                </div>
                {cat.packages_count !== undefined && (
                  <p className="text-xs text-brand-steel border-t border-brand-steel/10 pt-2">
                    {cat.packages_count} paquete{cat.packages_count !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modal.open && (
        <CategoryModal category={modal.category} onClose={() => setModal({ open: false, category: null })} />
      )}
    </div>
  )
}
