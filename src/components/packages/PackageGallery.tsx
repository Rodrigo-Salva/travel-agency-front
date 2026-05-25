'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react'

interface Props {
  images: string[]
  alt: string
}

export function PackageGallery({ images, alt }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const prev = useCallback(() => setLightbox(i => i !== null ? (i - 1 + images.length) % images.length : null), [images.length])
  const next = useCallback(() => setLightbox(i => i !== null ? (i + 1) % images.length : null), [images.length])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') setLightbox(null)
  }, [prev, next])

  if (!images.length) return null

  const [main, ...thumbs] = images

  return (
    <>
      {/* Grid layout */}
      <div className={`grid gap-2 rounded-2xl overflow-hidden ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {/* Main image */}
        <div
          className={`relative overflow-hidden cursor-zoom-in group ${images.length > 1 ? 'col-span-2 row-span-2 h-[420px]' : 'h-[440px]'}`}
          onClick={() => setLightbox(0)}
        >
          <Image src={main} alt={alt} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-700" sizes="(max-width: 768px) 100vw, 66vw" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1.5 text-xs font-medium bg-black/60 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg">
              <ZoomIn className="h-3.5 w-3.5" /> Ampliar
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && thumbs.slice(0, 3).map((src, i) => {
          const isLast = i === 2 && images.length > 4
          return (
            <div key={i} className="relative h-[206px] overflow-hidden cursor-pointer group" onClick={() => setLightbox(i + 1)}>
              <Image src={src} alt={`${alt} ${i + 2}`} fill className="object-cover group-hover:scale-[1.05] transition-transform duration-500" sizes="33vw" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {isLast && (
                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-1">
                  <Images className="h-6 w-6 text-white" />
                  <span className="text-white font-semibold text-sm">+{images.length - 4} fotos</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
          onKeyDown={handleKey}
          tabIndex={0}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightbox + 1} / {images.length}
          </span>

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
              onClick={e => { e.stopPropagation(); prev() }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div className="relative w-full max-w-4xl max-h-[80vh] mx-16" onClick={e => e.stopPropagation()}>
            <Image
              src={images[lightbox]}
              alt={`${alt} ${lightbox + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[80vh] rounded-xl"
              sizes="90vw"
              priority
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
              onClick={e => { e.stopPropagation(); next() }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Thumbnail strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setLightbox(i) }}
                className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === lightbox ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'}`}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
