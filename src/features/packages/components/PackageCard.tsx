'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Clock, MapPin, ArrowRight, Heart, Users } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { wishlistApi } from '@/lib/api/wishlist.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { PackageSummary } from '../types/package.types'

interface Props { pkg: PackageSummary; listMode?: boolean }

export function PackageCard({ pkg, listMode }: Props) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
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
    onError: () => toast.error('No se pudo actualizar la lista de deseos'),
  })

  const hasDiscount = pkg.discount_percentage && parseFloat(String(pkg.discount_percentage)) > 0
  const discountPct = hasDiscount ? parseFloat(String(pkg.discount_percentage)).toFixed(0) : null

  if (listMode) return (
    <Link href={ROUTES.package(pkg.id)}
      className="group flex flex-row rounded-2xl overflow-hidden border border-brand-steel/10 bg-brand-dark hover:border-brand-wine/35 transition-all duration-300">
      <div className="relative w-40 sm:w-52 shrink-0 overflow-hidden bg-brand-darkest">
        {imageUrl ? (
          <Image src={imageUrl} alt={pkg.name} fill
            className="object-cover group-hover:scale-[1.05] transition-transform duration-700"
            sizes="208px" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-wine/20 to-brand-darkest flex items-center justify-center">
            <MapPin className="h-8 w-8 text-brand-steel/30" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white">
            -{discountPct}% OFF
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-4 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-brand-rose text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {pkg.destination_name}
          </span>
          <span className="text-[11px] text-brand-steel flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" /> {pkg.duration_days}d/{pkg.duration_nights}n
          </span>
        </div>
        <h3 className="font-bold text-white text-sm leading-snug mb-1 group-hover:text-brand-rose transition-colors line-clamp-1">
          {pkg.name}
        </h3>
        <p className="text-xs text-brand-silver/80 line-clamp-2 mb-3 flex-1">{pkg.short_description}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-brand-steel uppercase tracking-widest">Desde</p>
            <p className="font-display text-lg font-bold text-white leading-none">
              {formatPrice(hasDiscount ? (pkg.discounted_price_adult ?? pkg.price_adult) : pkg.price_adult)}
            </p>
          </div>
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-wine/10 border border-brand-wine/20 text-brand-rose text-xs font-semibold group-hover:bg-brand-wine group-hover:text-white transition-colors">
            Ver más <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )

  return (
    <Link href={ROUTES.package(pkg.id)}
      className="group flex flex-col rounded-2xl overflow-hidden border border-brand-steel/10 bg-brand-dark card-depth hover:card-depth-hover hover:border-brand-wine/35 hover:-translate-y-1 transition-all duration-300">

      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-brand-darkest">
        {imageUrl ? (
          <Image src={imageUrl} alt={pkg.name} fill
            className="object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-wine/20 via-brand-dark to-brand-darkest flex items-center justify-center">
            <MapPin className="h-12 w-12 text-brand-steel/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest/90 via-brand-darkest/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darkest/30 to-transparent" />

        {/* Wishlist */}
        <button onClick={e => {
          e.preventDefault()
          if (!isAuthenticated) { router.push(ROUTES.auth.login); return }
          toggleWishlist.mutate()
        }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${
            wishlistItem ? 'bg-brand-wine text-white glow-wine-sm' : 'bg-brand-darkest/80 backdrop-blur-sm text-brand-steel hover:text-brand-rose hover:bg-brand-darkest border border-white/10'
          }`}>
          <Heart className={`h-4 w-4 ${wishlistItem ? 'fill-white' : ''}`} />
        </button>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {pkg.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-wine px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
              Destacado
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
              -{discountPct}% OFF
            </span>
          )}
        </div>

        {/* Bottom pills */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-darkest/80 backdrop-blur-sm border border-brand-steel/20 text-brand-silver">
            {pkg.category_name}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-darkest/80 backdrop-blur-sm border border-brand-steel/20 text-brand-silver">
            <Clock className="h-3 w-3" /> {pkg.duration_days}d/{pkg.duration_nights}n
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-1.5 text-brand-rose text-xs font-semibold mb-2 uppercase tracking-wide">
          <MapPin className="h-3.5 w-3.5" /> {pkg.destination_name}
        </div>
        <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-rose transition-colors">
          {pkg.name}
        </h3>
        <p className="text-xs text-brand-silver/80 line-clamp-2 mb-4 flex-1 leading-relaxed">{pkg.short_description}</p>

        <div className="flex items-end justify-between pt-3 border-t border-brand-steel/10">
          <div>
            <p className="text-[11px] text-brand-steel uppercase tracking-widest mb-0.5">Desde</p>
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <p className="font-display text-xl font-bold text-white leading-none">
                  {formatPrice(pkg.discounted_price_adult ?? pkg.price_adult)}
                </p>
                <span className="text-xs text-brand-steel line-through">{formatPrice(pkg.price_adult)}</span>
              </div>
            ) : (
              <p className="font-display text-xl font-bold text-white leading-none">{formatPrice(pkg.price_adult)}</p>
            )}
            <p className="text-[11px] text-brand-steel mt-1 flex items-center gap-1">
              <Users className="h-3 w-3" /> por persona
            </p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-wine/15 group-hover:bg-brand-wine border border-brand-wine/20 group-hover:border-brand-wine text-brand-rose group-hover:text-white transition-all duration-300">
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export function PackageCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-brand-steel/10 bg-brand-dark card-depth animate-pulse">
      <div className="h-52 bg-gradient-to-b from-brand-steel/10 to-brand-darkest/50" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 w-20 bg-brand-wine/20 rounded-full" />
        <div className="h-4 w-3/4 bg-brand-steel/20 rounded" />
        <div className="h-3 w-full bg-brand-steel/10 rounded" />
        <div className="h-px w-full bg-brand-steel/10" />
        <div className="flex justify-between items-end">
          <div className="space-y-1.5">
            <div className="h-2 w-12 bg-brand-steel/10 rounded" />
            <div className="h-6 w-24 bg-brand-steel/20 rounded" />
          </div>
          <div className="h-10 w-10 bg-brand-wine/10 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
