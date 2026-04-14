'use client'

import { useState, useEffect, useRef } from 'react'

interface LineaInformativaProps {
  config: {
    activo: boolean
    texto: string
    colorTexto: string
    colorFondo: string
    tamanioLetra: number
    tipoLetra: string
    velocidad: number      // segundos para cruzar la pantalla (3-30)
    tiempoEntre: number    // segundos de pausa después de desaparecer (1-20)
    altura: number
    posicion?: 'top' | 'bottom'
  }
}

export function LineaInformativa({ config }: LineaInformativaProps) {
  const [isClient, setIsClient] = useState(false)
  const [navbarHeight, setNavbarHeight] = useState(70)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const [key, setKey] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Controlar el ciclo de animación
  useEffect(() => {
    if (!config.activo || !config.texto) return

    const velocidadMs = config.velocidad * 1000
    const pausaMs = (config.tiempoEntre || 2) * 1000

    const startCycle = () => {
      // Mostrar el texto y animar
      setIsVisible(true)
      
      // Después de que termina la animación (el texto sale completo)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        // Ocultar el texto durante la pausa
        setIsVisible(false)
        
        // Después de la pausa, reiniciar el ciclo con una nueva key
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setKey(prev => prev + 1)
        }, pausaMs)
      }, velocidadMs)
    }

    startCycle()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [config.activo, config.texto, config.velocidad, config.tiempoEntre, key])

  if (!isClient) return null
  if (!config.activo || !config.texto) return null

  const topPosition = isNavbarVisible ? navbarHeight : 0

  return (
    <div 
      key={key}
      className="fixed left-0 right-0 z-40 overflow-hidden transition-all duration-300"
      style={{ 
        backgroundColor: config.colorFondo,
        height: `${config.altura}px`,
        lineHeight: `${config.altura}px`,
        top: `${topPosition}px`,
        width: '100%'
      }}
    >
      {isVisible && (
        <div
          className="whitespace-nowrap"
          style={{
            animation: `marquee ${config.velocidad}s linear forwards`,
            fontFamily: config.tipoLetra,
            fontSize: `${config.tamanioLetra}px`,
            color: config.colorTexto,
            display: 'inline-block',
            paddingRight: '20px',
            transform: 'translateX(0)'
          }}
        >
          {config.texto}
        </div>
      )}
      <style jsx global>{`
        @keyframes marquee {
          0% { 
            transform: translateX(0);
          }
          100% { 
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}