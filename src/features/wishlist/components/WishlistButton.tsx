'use client'

import { Heart, Loader2 } from 'lucide-react'
import { useWishlistToggle } from '../hooks/useWishlist'

interface Props {
  packageId: number
  className?: string
  size?: 'sm' | 'md'
}

export function WishlistButton({ packageId, className = '', size = 'md' }: Props) {
  const { isWishlisted, toggle, isPending } = useWishlistToggle(packageId)

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const btnSize = size === 'sm' ? 'p-1.5' : 'p-2'

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle()
      }}
      disabled={isPending}
      title={isWishlisted ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`${btnSize} rounded-full transition-all disabled:opacity-60 ${
        isWishlisted
          ? 'bg-brand-wine text-white shadow-lg shadow-brand-wine/30'
          : 'bg-black/40 backdrop-blur-sm text-white/70 hover:bg-brand-wine/80 hover:text-white'
      } ${className}`}
    >
      {isPending
        ? <Loader2 className={`${iconSize} animate-spin`} />
        : <Heart className={`${iconSize} ${isWishlisted ? 'fill-current' : ''} transition-all`} />
      }
    </button>
  )
}
