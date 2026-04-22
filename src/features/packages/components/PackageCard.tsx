'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, MapPin, ArrowRight, Heart } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { wishlistApi } from '@/lib/api/wishlist.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { PackageSummary } from '../types/package.types'

interface Props {
  pkg: PackageSummary
}

export function PackageCard({ pkg }: Props) {
  const { isAuthenticated } = useAuthStore()
  const qc = useQueryClient()

  const imageUrl = pkg.image
    ? pkg.image.startsWith('http') ? pkg.image : `${(process.env.NEXT_PUBLIC_API_URL ?? '').replace('/api/', '') || 'http://localhost:8000'}${pkg.image}`
    : null

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.list(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  })

  const wishlistItem = wishlist.find(w => w.package === pkg.id)

  const toggleWishlist = useMutation({
    mutationFn: () => wishlistApi.toggle(pkg.id, wishlistItem?.id),
    onSuccess: ({ added }) => {
      qc.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success(added ? 'Agregado a tu lista de deseos' : 'Eliminado de tu lista de deseos')
    },
    onError: () => toast.error('Inicia sesión para guardar paquetes'),
  })

  return (
    <Link
      href={ROUTES.package(pkg.id)}
      className="group flex flex-col rounded-2xl overflow-hidden border border-brand-steel/10 bg-brand-dark hover:border-brand-wine/40 hover:shadow-lg hover:shadow-brand-wine/10 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-brand-darkest">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={pkg.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark to-brand-darkest flex items-center justify-center">
            <MapPin className="h-10 w-10 text-brand-steel/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest/80 to-transparent" />

        {/* Wishlist button */}
        <button
          onClick={e => { e.preventDefault(); toggleWishlist.mutate() }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${wishlistItem ? 'bg-brand-wine text-white' : 'bg-brand-darkest/70 text-brand-steel hover:text-brand-rose'}`}
        >
          <Heart className={`h-4 w-4 ${wishlistItem ? 'fill-white' : ''}`} />
        </button>

        {/* Featured badge */}
        {pkg.is_featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-brand-wine/90 text-white border-0 text-xs">Destacado</Badge>
          </div>
        )}

        {/* Category */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <Badge variant="secondary" className="bg-brand-darkest/80 text-brand-silver border-brand-steel/20 text-xs">
            {pkg.category_name}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Destination */}
        <div className="flex items-center gap-1 text-brand-wine text-xs font-medium mb-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {pkg.destination_name}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-rose transition-colors">
          {pkg.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-brand-silver line-clamp-2 mb-3 flex-1">{pkg.short_description}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-brand-steel mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {pkg.duration_days}d / {pkg.duration_nights}n
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-steel/10">
          <div>
            <p className="text-xs text-brand-steel">Desde</p>
            <p className="font-display text-lg font-bold text-white">
              {formatPrice(pkg.price_adult)}
            </p>
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-wine/20 group-hover:bg-brand-wine text-brand-rose group-hover:text-white transition-all">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export function PackageCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-brand-steel/10 bg-brand-dark animate-pulse">
      <div className="h-48 bg-brand-steel/10" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-20 bg-brand-steel/20 rounded" />
        <div className="h-4 w-3/4 bg-brand-steel/20 rounded" />
        <div className="h-3 w-full bg-brand-steel/10 rounded" />
        <div className="h-3 w-2/3 bg-brand-steel/10 rounded" />
        <div className="h-8 w-full bg-brand-wine/10 rounded mt-2" />
      </div>
    </div>
  )
}
