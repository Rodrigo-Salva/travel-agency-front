'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Globe, Hotel, Activity, Loader2, X, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { ROUTES } from '@/lib/constants/routes'

interface Result {
  id: number
  name: string
  type: 'destination' | 'package' | 'hotel' | 'activity'
  sub?: string
}

const TYPE_CONFIG = {
  destination: { icon: MapPin,   label: 'Destino',   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  package:     { icon: Globe,    label: 'Paquete',   color: 'text-brand-rose',  bg: 'bg-brand-wine/10'  },
  hotel:       { icon: Hotel,    label: 'Hotel',     color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
  activity:    { icon: Activity, label: 'Actividad', color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
}

function getRoute(r: Result): string {
  switch (r.type) {
    case 'destination': return ROUTES.destination(r.id)
    case 'package':     return ROUTES.package(r.id)
    case 'hotel':       return ROUTES.hotel(r.id)
    case 'activity':    return ROUTES.activity(r.id)
  }
}

function extract(res: PromiseSettledResult<{ data: any }>, ...keys: string[]): any[] {
  if (res.status !== 'fulfilled') return []
  const d = res.value.data
  const inner = d?.results ?? d
  for (const k of keys) {
    if (Array.isArray(inner?.[k])) return inner[k]
  }
  return Array.isArray(inner) ? inner : []
}

async function fetchResults(q: string): Promise<Result[]> {
  if (!q.trim()) return []
  const params = { search: q, page_size: 4 }

  const [dest, pkgs, hotels, acts] = await Promise.allSettled([
    apiClient.get('destinations/', { params }),
    apiClient.get('packages/',     { params }),
    apiClient.get('hotels/',       { params }),
    apiClient.get('activities/',   { params }),
  ])

  const out: Result[] = []

  extract(dest, 'destinos').slice(0, 3).forEach((d: any) =>
    out.push({ id: d.id, type: 'destination', name: d.name, sub: d.country }))

  extract(pkgs, 'paquetes').slice(0, 3).forEach((p: any) =>
    out.push({ id: p.id, type: 'package', name: p.name, sub: p.destination_name }))

  extract(hotels, 'hoteles').slice(0, 3).forEach((h: any) =>
    out.push({ id: h.id, type: 'hotel', name: h.name, sub: h.destination?.name ?? h.destination_name }))

  extract(acts, 'actividades').slice(0, 3).forEach((a: any) =>
    out.push({ id: a.id, type: 'activity', name: a.name, sub: a.activity_type }))

  return out
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen]     = useState(false)
  const [query, setQuery]   = useState('')
  const [active, setActive] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn:  () => fetchResults(debouncedQuery),
    enabled:  debouncedQuery.length >= 2,
    staleTime: 30_000,
  })

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') { setOpen(false); setQuery('') }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function navigate(r: Result) {
    router.push(getRoute(r))
    setOpen(false)
    setQuery('')
    setActive(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter') {
      if (active >= 0) navigate(results[active])
      else if (query.trim()) {
        router.push(`${ROUTES.packages}?search=${encodeURIComponent(query.trim())}`)
        setOpen(false); setQuery('')
      }
    }
  }

  const showResults = query.length >= 2

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg text-sm min-w-[200px] bg-brand-dark/80 border border-brand-steel/20 text-brand-steel hover:border-brand-wine/40 hover:text-brand-silver transition-all"
      >
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="flex-1 text-left text-xs">Buscar destinos, paquetes...</span>
        <kbd className="text-[10px] rounded px-1.5 py-0.5 font-mono bg-brand-steel/10 border border-brand-steel/20">⌘K</kbd>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-brand-steel hover:text-brand-silver hover:bg-brand-dark/80 transition-colors"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setOpen(false); setQuery('') }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden card-depth bg-brand-dark border border-brand-steel/20">
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-brand-steel/10">
              {isFetching
                ? <Loader2 className="h-5 w-5 text-brand-rose animate-spin flex-shrink-0" />
                : <Search className="h-5 w-5 text-brand-steel flex-shrink-0" />}
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setActive(-1) }}
                onKeyDown={handleKeyDown}
                placeholder="Destinos, paquetes, hoteles, actividades..."
                className="flex-1 bg-transparent text-white text-base placeholder:text-brand-steel/50 focus:outline-none"
                autoComplete="off"
              />
              {query ? (
                <button onClick={() => setQuery('')} className="text-brand-steel hover:text-brand-silver transition-colors p-1">
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <kbd className="text-[10px] rounded px-1.5 py-0.5 font-mono text-brand-steel bg-brand-steel/10 border border-brand-steel/20 hidden sm:block">
                  Esc
                </kbd>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!showResults && (
                <div className="py-8 text-center">
                  <p className="text-brand-steel text-sm">Escribe al menos 2 caracteres para buscar</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4 px-4">
                    {['Machu Picchu', 'Caribe', 'Europa', 'Cusco'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="text-xs text-brand-silver bg-brand-darkest border border-brand-steel/20 hover:border-brand-wine/40 rounded-full px-3 py-1.5 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showResults && !isFetching && results.length === 0 && (
                <div className="py-10 text-center">
                  <Search className="h-10 w-10 text-brand-steel/20 mx-auto mb-3" />
                  <p className="text-brand-silver text-sm">Sin resultados para "{query}"</p>
                  <button
                    onClick={() => {
                      router.push(`${ROUTES.packages}?search=${encodeURIComponent(query)}`)
                      setOpen(false); setQuery('')
                    }}
                    className="mt-3 text-xs text-brand-rose hover:text-white transition-colors underline"
                  >
                    Buscar "{query}" en todos los paquetes
                  </button>
                </div>
              )}

              {showResults && results.length > 0 && (
                <div className="py-1">
                  {(['destination', 'package', 'hotel', 'activity'] as const).map(type => {
                    const group = results.filter(r => r.type === type)
                    if (!group.length) return null
                    const cfg = TYPE_CONFIG[type]
                    return (
                      <div key={type}>
                        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-brand-steel uppercase tracking-widest">
                          {cfg.label}s
                        </p>
                        {group.map((r) => {
                          const idx = results.indexOf(r)
                          const Icon = cfg.icon
                          return (
                            <button
                              key={r.id}
                              onClick={() => navigate(r)}
                              onMouseEnter={() => setActive(idx)}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                active === idx ? 'bg-brand-wine/10' : 'hover:bg-brand-darkest/60'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                                <Icon className={`h-4 w-4 ${cfg.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{r.name}</p>
                                {r.sub && <p className="text-brand-steel text-xs truncate capitalize">{r.sub}</p>}
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-brand-steel/40 flex-shrink-0" />
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-brand-steel/10 bg-brand-darkest/50">
              <span className="text-[10px] text-brand-steel/50 flex items-center gap-1">
                <kbd className="font-mono bg-brand-steel/10 border border-brand-steel/20 rounded px-1">↑↓</kbd> navegar
              </span>
              <span className="text-[10px] text-brand-steel/50 flex items-center gap-1">
                <kbd className="font-mono bg-brand-steel/10 border border-brand-steel/20 rounded px-1">↵</kbd> abrir
              </span>
              <span className="text-[10px] text-brand-steel/50 flex items-center gap-1">
                <kbd className="font-mono bg-brand-steel/10 border border-brand-steel/20 rounded px-1">Esc</kbd> cerrar
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
