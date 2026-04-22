'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  Package,
  Hotel,
  Plane,
  Zap,
  CalendarCheck,
  Star,
  MessageSquare,
  Tag,
  Users,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ROUTES } from '@/lib/constants/routes'

const NAV_ITEMS = [
  { label: 'Dashboard',   href: ROUTES.admin.dashboard,    icon: LayoutDashboard },
  { label: 'Destinos',    href: ROUTES.admin.destinations, icon: MapPin },
  { label: 'Paquetes',    href: ROUTES.admin.packages,     icon: Package },
  { label: 'Hoteles',     href: ROUTES.admin.hotels,       icon: Hotel },
  { label: 'Vuelos',      href: ROUTES.admin.flights,      icon: Plane },
  { label: 'Actividades', href: ROUTES.admin.activities,   icon: Zap },
  { label: 'Reservas',    href: ROUTES.admin.bookings,     icon: CalendarCheck },
  { label: 'Reseñas',     href: ROUTES.admin.reviews,      icon: Star },
  { label: 'Consultas',   href: ROUTES.admin.inquiries,    icon: MessageSquare },
  { label: 'Cupones',     href: ROUTES.admin.coupons,      icon: Tag },
  { label: 'Usuarios',    href: ROUTES.admin.users,        icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  function handleLogout() {
    clearAuth()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-brand-darkest flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-brand-dark border-r border-brand-steel/10 flex flex-col fixed top-0 left-0 h-full z-20">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-brand-steel/10">
          <Link href={ROUTES.admin.dashboard} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-wine flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">TravelAgency</p>
              <p className="text-brand-wine text-xs font-medium">Admin</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== ROUTES.admin.dashboard && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-wine/20 text-white border border-brand-wine/20'
                    : 'text-brand-steel hover:text-brand-silver hover:bg-brand-steel/5'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-brand-rose' : ''}`} />
                {label}
                {isActive && <ChevronRight className="h-3 w-3 ml-auto text-brand-wine" />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-brand-steel/10 p-3 space-y-2">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-brand-wine/30 flex items-center justify-center text-brand-rose text-xs font-bold flex-shrink-0">
              {user?.nombre_completo?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.nombre_completo ?? 'Admin'}</p>
              <p className="text-brand-steel text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-brand-steel hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main — offset by sidebar width */}
      <main className="flex-1 min-w-0 ml-56">
        {children}
      </main>
    </div>
  )
}
