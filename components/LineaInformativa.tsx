'use client'

import { useState, useEffect, useRef } from 'react'

interface LineaInformativaProps {
  config: {
    activo: boolean
    texto: string
    colorTexto: string
    colorFondo: string
    velocidad: number
    altura: number
    posicion: 'top' | 'bottom'
  }
}

export function LineaInformativa({ config }: LineaInformativaProps) {
  const [isVisible, setIsVisible] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!config.activo) return

    const interval = setInterval(() => {
      setIsVisible(false)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, 100)
    }, (config.velocidad + 2) * 1000)

    return () => {
      clearInterval(interval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [config.activo, config.velocidad])

  if (!config.activo || !config.texto) return null

  const positionClass = config.posicion === 'top' ? 'top-0' : 'bottom-0'

  return (
    <div 
      className={`fixed left-0 right-0 ${positionClass} z-40 w-full overflow-hidden`}
      style={{ 
        backgroundColor: config.colorFondo,
        height: `${config.altura}px`,
        lineHeight: `${config.altura}px`
      }}
    >
      <div
        className="whitespace-nowrap"
        style={{
          animation: `marquee ${config.velocidad}s linear infinite`,
          color: config.colorTexto,
          display: 'inline-block',
          opacity: isVisible ? 1 : 0,
          paddingRight: '20px'
        }}
      >
        {config.texto}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}