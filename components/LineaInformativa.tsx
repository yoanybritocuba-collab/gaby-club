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
    velocidad: number      // segundos para cruzar la pantalla
    tiempoEntre: number    // segundos de pausa (1-20)
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

  // Detectar altura del navbar y scroll
  useEffect(() => {
    setIsClient(true)
    const navbar = document.querySelector('header')
    if (navbar) setNavbarHeight(navbar.offsetHeight)

    const handleScroll = () => setIsNavbarVisible(window.scrollY <= 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Controlar ciclo de animación
  useEffect(() => {
    if (!config.activo || !config.texto) return

    const velocidadMs = config.velocidad * 1000
    const pausaMs = (config.tiempoEntre || 2) * 1000

    const startCycle = () => {
      setIsVisible(true) // Muestra el texto y comienza la animación

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false) // Oculta el texto tras la animación

        timeoutRef.current = setTimeout(() => {
          setKey(prev => prev + 1) // Reinicia el ciclo
        }, pausaMs)
      }, velocidadMs)
    }

    startCycle()
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
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
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}