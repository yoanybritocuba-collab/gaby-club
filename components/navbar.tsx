'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Shield, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const navLinks = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/carta', labelKey: 'nav.menu' },
  { href: '/dardos', labelKey: 'nav.dartos' },
  { href: '/sugerencias', labelKey: 'nav.suggestions' },
  { href: '/ubicacion', labelKey: 'nav.location' },
  { href: '/admin/login', labelKey: 'nav.admin' },
]

function HiddenLink({ href, children, className, onClick }: { href: string; children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  )
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const pathname = usePathname()
  const { t } = useI18n()
  const [logoUrl, setLogoUrl] = useState('/logo.png')
  const [logoTamaño, setLogoTamaño] = useState('h-12 sm:h-14 md:h-16')
  const [logoPosicion, setLogoPosicion] = useState('justify-start')
  const [nombreWeb, setNombreWeb] = useState("Gaby's Club")

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setLogoUrl(data.logoUrl || '/logo.png')
          setNombreWeb(data.nombreWeb || "Gaby's Club")
          
          const tamaño = data.logoTamaño || 'medio'
          const tamaños: Record<string, string> = {
            pequeño: 'h-10 sm:h-12 md:h-14',
            medio: 'h-12 sm:h-14 md:h-16',
            grande: 'h-16 sm:h-20 md:h-24'
          }
          setLogoTamaño(tamaños[tamaño] || tamaños.medio)
          
          const posicion = data.logoPosicion || 'izquierda'
          const posiciones: Record<string, string> = {
            izquierda: 'justify-start',
            centro: 'justify-center',
            derecha: 'justify-end'
          }
          setLogoPosicion(posiciones[posicion] || posiciones.izquierda)
        }
      } catch (error) {
        console.error('Error cargando configuración navbar:', error)
      }
    }
    loadConfig()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY <= 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true)
      }
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={cn("fixed top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80 transition-transform duration-300", isVisible ? "translate-y-0" : "-translate-y-full")}>
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between py-1.5 sm:py-2">
            <HiddenLink href="/" className={`flex items-center gap-0 flex-shrink-0 ${logoPosicion}`}>
              <img src={logoUrl} alt={nombreWeb} className={`${logoTamaño} object-contain`} />
              <div className="flex flex-col leading-none">
                <span className="font-serif text-base sm:text-lg md:text-xl font-bold text-gold">
                  Gaby's
                </span>
                <span className="font-serif text-base sm:text-lg md:text-xl font-bold text-gold -ml-0.5">
                  Club
                </span>
              </div>
            </HiddenLink>

            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <HiddenLink href="/admin/login">
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-gold hover:text-gold-light hover:bg-gold/10">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </HiddenLink>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-gold hover:text-gold-light hover:bg-gold/10" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {isOpen && (
            <div className="border-t border-gray-800 mt-1 py-3">
              <div className="flex flex-col space-y-1.5 px-2">
                {navLinks.map((link) => (
                  <HiddenLink 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setIsOpen(false)} 
                    className={cn(
                      'block rounded-md px-3 py-2.5 text-sm font-medium transition-all', 
                      pathname === link.href ? 'bg-gold text-black' : 'text-gray-300 hover:bg-gold/10 hover:text-gold'
                    )}
                  >
                    {t(link.labelKey)}
                  </HiddenLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
      {/* Espaciador reducido para que no tape el hero */}
      <div className="h-[60px] sm:h-[68px] md:h-[76px]" />
    </>
  )
}