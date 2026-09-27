'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Layers, 
  UtensilsCrossed, 
  Gift, 
  Calendar, 
  Home,
  Settings,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

const adminLinks = [
  { href: '/admin', icon: LayoutDashboard, labelKey: 'admin.dashboard' },
  { href: '/admin/secciones', icon: Layers, labelKey: 'admin.sections' },
  { href: '/admin/productos', icon: UtensilsCrossed, labelKey: 'admin.products' },
  { href: '/admin/combos', icon: Gift, labelKey: 'admin.combos' },
  { href: '/admin/eventos', icon: Calendar, labelKey: 'admin.events' },
  { href: '/admin/dardos', icon: Target, labelKey: 'admin.dartReservations' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-sidebar-primary" />
          <span className="font-serif text-lg font-bold text-sidebar-foreground">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {adminLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || 
            (link.href !== '/admin' && pathname.startsWith(link.href))
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(link.labelKey)}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Home className="h-4 w-4" />
          Volver al sitio
        </Link>
      </div>
    </aside>
  )
}