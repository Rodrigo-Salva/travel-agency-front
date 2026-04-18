import Link from 'next/link'
import { Plane } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-darkest px-4">
      {/* Logo */}
      <Link href={ROUTES.home} className="flex items-center gap-2 mb-8 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-wine group-hover:bg-brand-wine/80 transition-colors">
          <Plane className="h-5 w-5 text-white rotate-45" />
        </div>
        <span className="font-display text-2xl font-bold text-white">
          Travel<span className="text-brand-rose">Agency</span>
        </span>
      </Link>

      {/* Auth card */}
      <div className="w-full max-w-md rounded-2xl border border-brand-steel/20 bg-brand-dark p-8 shadow-2xl">
        {children}
      </div>
    </div>
  )
}
