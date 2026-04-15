'use client'

import { useState, useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n'

interface LineaInformativaProps {
  config: {
    activo: boolean
    texto: string
    textoEn?: string
    textoFr?: string
    textoDe?: string
    textoRu?: string
    colorTexto: string
    colorFondo: string
    tamanioLetra: number
    tipoLetra: string
    velocidad: number
    tiempoEntre: number
    altura: number
    posicion?: 'top' | 'bottom'
  }
}

export function LineaInformativa({ config }: LineaInformativaProps) {
  const { language } = useI18n()
  const [isClient, setIsClient] = useState(false)
  const [navbarHeight, setNavbarHeight] = useState(70)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(true)
  const [cycleKey, setCycleKey] = useState(0)

  // Obtener el texto traducido según el idioma actual
  const getTranslatedText = () => {
    if (!config) return ''
    if (language === 'en' && config.textoEn) return config.textoEn
    if (language === 'fr' && config.textoFr) return config.textoFr
    if (language === 'de' && config.textoDe) return config.textoDe
    if (language === 'ru' && config.textoRu) return config.textoRu
    return config.texto || ''
  }

  const textoTraducido = getTranslatedText()

  useEffect(() => {
    setIsClient(true)
    
    const navbar = document.querySelector('header')
    if (navbar) {
      const height = navbar.offsetHeight
      setNavbarHeight(height)
    }
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const navbarVisible = currentScrollY <= 10
      setIsNavbarVisible(navbarVisible)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!config?.activo || !textoTraducido) return

    const velocidadMs = config.velocidad * 1000
    const pausaMs = (config.tiempoEntre || 2) * 1000

    const runCycle = () => {
      setIsAnimating(true)
      
      setTimeout(() => {
        setIsAnimating(false)
        
        setTimeout(() => {
          setCycleKey(prev => prev + 1)
        }, pausaMs)
      }, velocidadMs)
    }

    runCycle()
  }, [config?.activo, textoTraducido, config?.velocidad, config?.tiempoEntre, cycleKey])

  if (!isClient) return null
  if (!config?.activo || !textoTraducido) return null

  const topPosition = isNavbarVisible ? navbarHeight : 0

  return (
    <div 
      key={cycleKey}
      className="fixed left-0 right-0 z-40 overflow-hidden transition-all duration-300"
      style={{ 
        backgroundColor: config.colorFondo,
        height: `${config.altura}px`,
        lineHeight: `${config.altura}px`,
        top: `${topPosition}px`,
        width: '100%'
      }}
    >
      <div
        className="whitespace-nowrap"
        style={{
          animation: isAnimating ? `marquee ${config.velocidad}s linear forwards` : 'none',
          fontFamily: config.tipoLetra,
          fontSize: `${config.tamanioLetra}px`,
          color: config.colorTexto,
          display: 'inline-block',
          paddingRight: '20px',
          transform: isAnimating ? 'translateX(100%)' : 'translateX(100%)',
          opacity: isAnimating ? 1 : 0
        }}
      >
        {textoTraducido}
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% { 
            transform: translateX(100%);
          }
          100% { 
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  )
}