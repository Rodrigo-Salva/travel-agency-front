'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Globe, Plane, Hotel, Activity, MapPin, ChevronDown, User, BookOpen, Heart, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ROUTES } from '@/lib/constants/routes'

const NAV_LINKS = [
  { label: 'Destinos', href: ROUTES.destinations, icon: MapPin },
  { label: 'Paquetes', href: ROUTES.packages, icon: Globe },
  { label: 'Hoteles', href: ROUTES.hotels, icon: Hotel },
  { label: 'Actividades', href: ROUTES.activities, icon: Activity },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    clearAuth()
    router.push(ROUTES.home)
  }

  const initials = user
    ? user.nombre_completo
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-steel/20 bg-brand-darkest/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={ROUTES.home} className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-wine group-hover:bg-brand-wine/80 transition-colors">
            <Plane className="h-5 w-5 text-white rotate-45" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">
            Travel<span className="text-brand-rose">Agency</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-brand-silver hover:text-white hover:bg-brand-dark transition-all"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 text-brand-silver hover:text-white rounded-md px-2 py-1.5 hover:bg-brand-dark transition-colors"
              >
                <Avatar className="h-8 w-8 border border-brand-wine/50">
                  <AvatarFallback className="bg-brand-wine text-white text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm">{user.nombre_completo.split(' ')[0]}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-brand-dark border-brand-steel/20">
                {user.tipo_usuario === 'admin' ? (
                  <DropdownMenuItem
                    onClick={() => router.push(ROUTES.admin.dashboard)}
                    className="flex items-center gap-2 text-brand-silver cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    Panel Admin
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push(ROUTES.customer.dashboard)}
                      className="flex items-center gap-2 text-brand-silver cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      Mi Cuenta
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(ROUTES.customer.bookings)}
                      className="flex items-center gap-2 text-brand-silver cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4" />
                      Mis Reservas
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(ROUTES.customer.wishlist)}
                      className="flex items-center gap-2 text-brand-silver cursor-pointer"
                    >
                      <Heart className="h-4 w-4" />
                      Lista de Deseos
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-brand-steel/20" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-400 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={ROUTES.auth.login}
                className="inline-flex items-center justify-center px-4 h-9 rounded-lg text-sm font-medium text-brand-silver hover:text-white hover:bg-brand-dark transition-colors"
              >
                Iniciar Sesion
              </Link>
              <Link
                href={ROUTES.auth.register}
                className="inline-flex items-center justify-center px-4 h-9 rounded-lg text-sm font-medium bg-brand-wine hover:bg-brand-wine/90 text-white transition-colors"
              >
                Registrarse
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-brand-silver hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-steel/20 bg-brand-darkest">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-brand-silver hover:text-white hover:bg-brand-dark transition-all"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-brand-steel/20">
                <Link
                  href={ROUTES.auth.login}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center h-10 rounded-lg text-sm font-medium text-brand-silver hover:text-white hover:bg-brand-dark transition-colors"
                >
                  Iniciar Sesion
                </Link>
                <Link
                  href={ROUTES.auth.register}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center h-10 rounded-lg text-sm font-medium bg-brand-wine hover:bg-brand-wine/90 text-white transition-colors"
                >
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
