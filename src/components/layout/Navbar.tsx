'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Menu, X, Globe, Plane, Hotel, Activity, MapPin, ChevronDown,
  User, BookOpen, Heart, Star, LogOut, Bell, CheckCheck,
  CreditCard, Calendar, MessageSquare, Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ROUTES } from '@/lib/constants/routes'
import { notificationsApi, type AppNotification } from '@/features/notifications/notifications.api'
import { formatDate } from '@/lib/utils/format'
import { GlobalSearch } from '@/components/search/GlobalSearch'

const NAV_LINKS = [
  { label: 'Destinos',    href: ROUTES.destinations, icon: MapPin },
  { label: 'Paquetes',    href: ROUTES.packages,     icon: Globe },
  { label: 'Hoteles',     href: ROUTES.hotels,        icon: Hotel },
  { label: 'Actividades', href: ROUTES.activities,    icon: Activity },
  { label: 'Ofertas',     href: ROUTES.ofertas,       icon: Flame, highlight: true },
  { label: 'Nosotros',    href: ROUTES.about,         icon: Star },
  { label: 'Cotizar',     href: ROUTES.cotizar,       icon: Star, highlight: true },
]

const NOTIF_ICONS: Record<string, typeof Bell> = {
  booking: Calendar, payment: CreditCard,
  review: MessageSquare, promo: Star, system: Bell,
}

function NotificationBell() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const markOne = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const unread = data?.unread ?? 0
  const notifications = data?.notifications ?? []

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center h-9 w-9 rounded-lg text-brand-silver hover:text-white hover:bg-brand-dark transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-wine text-[10px] font-bold text-white leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 rounded-2xl bg-brand-dark border border-brand-steel/15 shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-steel/10">
            <p className="text-white font-semibold text-sm">Notificaciones</p>
            {unread > 0 && (
              <button onClick={() => markAll.mutate()} className="flex items-center gap-1 text-xs text-brand-wine hover:text-brand-rose transition-colors">
                <CheckCheck className="h-3.5 w-3.5" /> Marcar todas leídas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-brand-steel/10">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 text-brand-steel/30 mx-auto mb-2" />
                <p className="text-brand-steel text-sm">Sin notificaciones</p>
              </div>
            ) : notifications.slice(0, 8).map((n: AppNotification) => {
              const Icon = NOTIF_ICONS[n.type] ?? Bell
              return (
                <button key={n.id} onClick={() => { markOne.mutate(n.id); setOpen(false) }}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-brand-darkest/50 transition-colors ${!n.is_read ? 'bg-brand-wine/5' : ''}`}>
                  <div className={`flex-shrink-0 mt-0.5 rounded-lg p-1.5 ${!n.is_read ? 'bg-brand-wine/20' : 'bg-brand-steel/10'}`}>
                    <Icon className={`h-3.5 w-3.5 ${!n.is_read ? 'text-brand-rose' : 'text-brand-steel'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${!n.is_read ? 'text-white' : 'text-brand-silver'}`}>{n.title}</p>
                    <p className="text-xs text-brand-steel truncate">{n.message}</p>
                    <p className="text-xs text-brand-steel/60 mt-0.5">{formatDate(n.created_at)}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-brand-wine flex-shrink-0 mt-1.5" />}
                </button>
              )
            })}
          </div>
          <div className="border-t border-brand-steel/10 px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-brand-wine hover:text-brand-rose font-medium transition-colors py-1"
            >
              Ver todas las notificaciones →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => { clearAuth(); router.push(ROUTES.home) }
  const initials = user
    ? user.nombre_completo.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-steel/15 bg-brand-darkest/90 backdrop-blur-md"
      style={{ boxShadow: '0 1px 24px rgba(0,0,0,0.5)' }}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={ROUTES.home} className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-wine to-brand-wine/80 group-hover:from-brand-wine/90 transition-all shadow-lg glow-wine-sm">
            <Plane className="h-5 w-5 text-white rotate-45" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">
            Travel<span className="text-gradient-brand">Agency</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium border transition-all ${
                (link as { highlight?: boolean }).highlight
                  ? 'text-brand-rose border-brand-wine/25 bg-brand-wine/8 hover:bg-brand-wine/20 hover:text-white'
                  : 'text-brand-silver hover:text-white hover:bg-brand-dark/80 border-transparent hover:border-brand-steel/20'
              }`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <GlobalSearch />

        {/* Right */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-brand-silver hover:text-white rounded-md px-2 py-1.5 hover:bg-brand-dark transition-colors">
                  <Avatar className="h-8 w-8 border border-brand-wine/50">
                    <AvatarFallback className="bg-brand-wine text-white text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm">{user.nombre_completo.split(' ')[0]}</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-brand-dark border-brand-steel/20">
                  {user.tipo_usuario === 'admin' ? (
                    <DropdownMenuItem onClick={() => router.push(ROUTES.admin.dashboard)} className="flex items-center gap-2 text-brand-silver cursor-pointer">
                      <User className="h-4 w-4" /> Panel Admin
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.customer.dashboard)} className="flex items-center gap-2 text-brand-silver cursor-pointer">
                        <User className="h-4 w-4" /> Mi Cuenta
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.customer.bookings)} className="flex items-center gap-2 text-brand-silver cursor-pointer">
                        <BookOpen className="h-4 w-4" /> Mis Reservas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.customer.wishlist)} className="flex items-center gap-2 text-brand-silver cursor-pointer">
                        <Heart className="h-4 w-4" /> Lista de Deseos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.customer.reviews)} className="flex items-center gap-2 text-brand-silver cursor-pointer">
                        <Star className="h-4 w-4" /> Mis Reseñas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.customer.notifications)} className="flex items-center gap-2 text-brand-silver cursor-pointer">
                        <Bell className="h-4 w-4" /> Notificaciones
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-brand-steel/20" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-400 cursor-pointer">
                    <LogOut className="h-4 w-4" /> Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href={ROUTES.auth.login} className="inline-flex items-center justify-center px-4 h-9 rounded-lg text-sm font-medium text-brand-silver hover:text-white hover:bg-brand-dark transition-colors">
                Iniciar Sesión
              </Link>
              <Link href={ROUTES.auth.register} className="inline-flex items-center justify-center px-4 h-9 rounded-lg text-sm font-medium bg-brand-wine hover:bg-brand-wine/90 text-white transition-colors">
                Registrarse
              </Link>
            </div>
          )}
          <Button variant="ghost" size="icon" className="md:hidden text-brand-silver hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-steel/20 bg-brand-darkest">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-brand-silver hover:text-white hover:bg-brand-dark transition-all">
                <link.icon className="h-4 w-4" /> {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-brand-steel/20">
                <Link href={ROUTES.auth.login} onClick={() => setMobileOpen(false)} className="flex items-center justify-center h-10 rounded-lg text-sm font-medium text-brand-silver hover:text-white hover:bg-brand-dark transition-colors">
                  Iniciar Sesión
                </Link>
                <Link href={ROUTES.auth.register} onClick={() => setMobileOpen(false)} className="flex items-center justify-center h-10 rounded-lg text-sm font-medium bg-brand-wine hover:bg-brand-wine/90 text-white transition-colors">
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
