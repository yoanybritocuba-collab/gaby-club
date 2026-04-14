'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home } from 'lucide-react'

export function BackToHomeButton() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Mostrar el botón solo en páginas que NO son el home
    // y que tienen más de 1 nivel o son páginas internas
    const isHome = pathname === '/'
    const isAdmin = pathname.startsWith('/admin')
    const showButton = !isHome && !isAdmin && pathname !== '/'
    setShow(showButton)
  }, [pathname])

  if (!show) return null

  return (
    <Link
      href="/"
      className="fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gold text-black shadow-lg transition-all duration-300 hover:scale-110 hover:bg-gold-dark focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black"
      aria-label="Volver al inicio"
    >
      <Home className="h-4 w-4" />
    </Link>
  )
}