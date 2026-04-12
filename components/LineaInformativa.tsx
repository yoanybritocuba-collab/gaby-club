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
    velocidad: number
    tiempoEntre: number
    ancho: number
    posicion: 'left' | 'center' | 'right'
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
    }, (config.velocidad + config.tiempoEntre) * 1000)

    return () => {
      clearInterval(interval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [config.activo, config.velocidad, config.tiempoEntre])

  if (!config.activo || !config.texto) return null

  const marginStyle = {
    marginLeft: config.posicion === 'center' ? 'auto' : config.posicion === 'right' ? 'auto' : '0',
    marginRight: config.posicion === 'center' ? 'auto' : config.posicion === 'left' ? 'auto' : '0'
  }

  return (
    <div 
      className="w-full overflow-hidden"
      style={{ 
        backgroundColor: config.colorFondo,
        width: `${config.ancho}%`,
        ...marginStyle,
        borderRadius: '0px'
      }}
    >
      <div
        className={`whitespace-nowrap ${isVisible ? 'animate-marquee' : 'opacity-0'}`}
        style={{
          animationDuration: `${config.velocidad}s`,
          fontFamily: config.tipoLetra,
          fontSize: `${config.tamanioLetra}px`,
          color: config.colorTexto,
          padding: '8px 0',
          display: 'inline-block',
          animationIterationCount: isVisible ? 'infinite' : 0,
          animationTimingFunction: 'linear'
        }}
      >
        {config.texto}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation-name: marquee;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  )
}