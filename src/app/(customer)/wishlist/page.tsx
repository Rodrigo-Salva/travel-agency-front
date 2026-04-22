'use client'

import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, Package, ArrowRight, Trash2, Clock, MapPin, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { wishlistApi } from '@/lib/api/wishlist.api'
import { formatPrice, resolveImage } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'

export default function WishlistPage() {
  const qc = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.list(),
    staleTime: 2 * 60 * 1000,
  })

  const remove = useMutation({
    mutationFn: (id: number) => wishlistApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Eliminado de tu lista de deseos')
    },
    onError: () => toast.error('No se pudo eliminar'),
  })

  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest border-b border-brand-steel/10 pt-14 pb-10">
        <div className="container mx-auto px-4">
          <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-2">Mi cuenta</p>
          <h1 className="font-display text-4xl font-bold text-white">Lista de deseos</h1>
          {items.length > 0 && (
            <p className="text-brand-silver mt-1">{items.length} paquete{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-brand-dark animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <Heart className="h-16 w-16 text-brand-steel/30" />
            <h2 className="text-2xl font-bold text-white">Tu lista esta vacia</h2>
            <p className="text-brand-silver max-w-sm">Guarda paquetes que te interesen para verlos después.</p>
            <Link
              href={ROUTES.packages}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
            >
              <Package className="h-4 w-4" /> Explorar paquetes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => {
              const img = resolveImage(item.package_image)
              return (
                <div key={item.id} className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden hover:border-brand-wine/20 transition-all group flex flex-col">
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden bg-brand-darkest">
                    {img ? (
                      <img src={img} alt={item.package_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-brand-steel/30" />
                      </div>
                    )}
                    <button
                      onClick={() => remove.mutate(item.id)}
                      disabled={remove.isPending}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-brand-darkest/80 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      {remove.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <p className="font-semibold text-white leading-snug">{item.package_name}</p>
                    <div className="flex items-center gap-3 text-xs text-brand-steel">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-brand-wine" />{item.package_destination}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item.package_duration}d</span>
                    </div>
                    <p className="font-display text-xl font-bold text-white mt-auto">{formatPrice(item.package_price)}</p>
                    <Link
                      href={ROUTES.package(item.package)}
                      className="mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-wine/10 border border-brand-wine/20 text-brand-rose text-sm font-medium hover:bg-brand-wine hover:text-white transition-colors"
                    >
                      Ver paquete <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
