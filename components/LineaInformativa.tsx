'use client'

import { useState, useEffect } from 'react'

interface LineaInformativaProps {
  config: {
    activo: boolean
    texto: string
    colorTexto: string
    colorFondo: string
    tamanioLetra: number
    tipoLetra: string
    velocidad: number      // segundos para cruzar la pantalla
    tiempoEntre: number    // segundos de pausa entre ciclos
    altura: number
    posicion?: 'top' | 'bottom'
  }
}

export function LineaInformativa({ config }: LineaInformativaProps) {
  const [isClient, setIsClient] = useState(false)
  const [navbarHeight, setNavbarHeight] = useState(70)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const [shouldAnimate, setShouldAnimate] = useState(true)

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

  // Controlar la animación con pausa
  useEffect(() => {
    if (!config.activo || !config.texto) return

    // Ciclo de animación: se activa, se pausa, se reactiva
    const animate = () => {
      setShouldAnimate(true)
      
      // Duración de la animación = velocidad
      const animationDuration = config.velocidad * 1000
      
      // Después de la animación, pausar
      setTimeout(() => {
        setShouldAnimate(false)
        
        // Después de la pausa, reiniciar el ciclo
        const pauseDuration = (config.tiempoEntre || 2) * 1000
        setTimeout(() => {
          animate()
        }, pauseDuration)
      }, animationDuration)
    }
    
    animate()
    
    return () => {
      setShouldAnimate(false)
    }
  }, [config.activo, config.texto, config.velocidad, config.tiempoEntre])

  if (!isClient) return null
  if (!config.activo || !config.texto) return null

  const topPosition = isNavbarVisible ? navbarHeight : 0

  return (
    <div 
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
          animation: shouldAnimate ? `marquee ${config.velocidad}s linear forwards` : 'none',
          fontFamily: config.tipoLetra,
          fontSize: `${config.tamanioLetra}px`,
          color: config.colorTexto,
          display: 'inline-block',
          paddingRight: '20px',
          transform: shouldAnimate ? 'translateX(0)' : 'translateX(100%)',
          opacity: shouldAnimate ? 1 : 0
        }}
      >
        {config.texto}
      </div>
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