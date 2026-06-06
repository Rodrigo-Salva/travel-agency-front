import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb { label: string; href?: string }

interface Props { items: Crumb[] }

export function Breadcrumbs({ items }: Props) {
  return (
    <nav className="flex items-center gap-1 text-xs text-brand-steel mb-4" aria-label="Breadcrumb">
      <Link href="/" className="flex items-center gap-1 hover:text-brand-silver transition-colors">
        <Home className="h-3 w-3" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-brand-steel/50" />
          {item.href ? (
            <Link href={item.href} className="hover:text-brand-silver transition-colors">{item.label}</Link>
          ) : (
            <span className="text-brand-silver/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
