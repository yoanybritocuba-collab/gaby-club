'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Users, 
  Settings,
  LogOut,
  Menu,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen, isMobile])

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('firebase-token')
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login')
    } else if (token) {
      setIsAuthenticated(true)
    }
  }, [pathname, router])

  // Función para cerrar sesión e ir al home
  const handleLogoutAndGoHome = () => {
    localStorage.removeItem('firebase-token')
    window.location.href = '/'
  }

  const handleNavigation = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  if (isLoginPage) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">{children}</div>
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={cn(
          "fixed lg:relative z-50 flex h-full flex-col bg-gray-950 shadow-2xl transition-all duration-300",
          sidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:w-20 lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-gold to-amber-600">
              <span className="text-sm font-bold text-black">G</span>
            </div>
            {(sidebarOpen || !isMobile) && (
              <span className="font-display text-lg font-bold text-gold">
                Admin Panel
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-gray-400 hover:text-gold hover:bg-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavigation}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gold text-black shadow-lg"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gold"
                )}
              >
                <Icon className="h-5 w-5" />
                {(sidebarOpen || !isMobile) && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Botón Home con doble función: cerrar sesión + ir al home */}
        <div className="border-t border-gray-800 p-3">
          <Button
            onClick={handleLogoutAndGoHome}
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-3 text-gray-400 hover:text-gold hover:bg-gray-800"
          >
            <Home className="h-5 w-5" />
            {(sidebarOpen || !isMobile) && <span>Home</span>}
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-400 hover:text-gold hover:bg-gray-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-500">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLogoutAndGoHome}
              variant="outline"
              size="sm"
              className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}