'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Instagram, Facebook, Phone, Mail, Clock, Wine, ChevronDown, ChevronUp, MapPin, MessageCircle, Globe, Loader2
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export function Footer() {
  const [horarioAbierto, setHorarioAbierto] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [bgColor, setBgColor] = useState('#000000')
  const [textColor, setTextColor] = useState('#d1b275')

  const negocio = {
    nombre: "Gaby's Club",
    direccion: "Carrer del Tropazi, 24, Gracia, 08012 Barcelona",
    telefono: "+34634492023",
    whatsapp: "+34634492023",
    email: "info@gabysclub.com",
    instagram: "gabys_club",
    tiktok: "GABYSCLUB",
    horarioNormal: {
      lunes: { apertura: '12:00', cierre: '00:00' },
      martes: { apertura: '12:00', cierre: '00:00' },
      miercoles: { apertura: '12:00', cierre: '00:00' },
      jueves: { apertura: '12:00', cierre: '00:00' },
      viernes: { apertura: '12:00', cierre: '02:00' },
      sabado: { apertura: '12:00', cierre: '02:00' },
      domingo: { apertura: '12:00', cierre: '00:00' }
    }
  }

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setBgColor(data.footerBgColor || '#000000')
          setTextColor(data.footerTextColor || '#d1b275')
        }
      } catch (error) {
        console.error('Error cargando configuración:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadConfig()
  }, [])

  const dayNames: Record<string, string> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  }

  if (isLoading) {
    return (
      <footer style={{ backgroundColor: bgColor }} className="py-8">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" style={{ color: textColor }} />
        </div>
      </footer>
    )
  }

  const formatHorario = (apertura: string, cierre: string) => {
    if (apertura === 'Cerrado' || cierre === 'Cerrado') return 'Cerrado'
    return `${apertura} - ${cierre}`
  }

  const instagramUrl = `https://instagram.com/${negocio.instagram.replace('@', '')}`
  const tiktokUrl = `https://tiktok.com/@${negocio.tiktok.replace('@', '')}`
  const whatsappUrl = `https://wa.me/${negocio.whatsapp.replace(/[^0-9]/g, '')}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.direccion)}`
  const reservasWhatsappUrl = "https://wa.me/34634492023?text=Hola%2C%20me%20gustar%C3%ADa%20hacer%20una%20reserva"

  return (
    <footer style={{ backgroundColor: bgColor }} className="border-t border-gold/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Columna 1: Información del negocio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wine className="h-6 w-6" style={{ color: textColor }} />
              <h3 className="font-serif text-2xl font-bold" style={{ color: textColor }}>{negocio.nombre}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <a 
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:opacity-80 transition-opacity"
                style={{ color: textColor }}
              >
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{negocio.direccion}</span>
              </a>
              <a 
                href={`tel:${negocio.telefono}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                style={{ color: textColor }}
              >
                <Phone className="h-4 w-4" />
                <span>{negocio.telefono}</span>
              </a>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                style={{ color: textColor }}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{negocio.whatsapp}</span>
              </a>
              <a 
                href={`mailto:${negocio.email}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                style={{ color: textColor }}
              >
                <Mail className="h-4 w-4" />
                <span>{negocio.email}</span>
              </a>
            </div>
            
            {/* Redes Sociales */}
            <div className="flex gap-4 pt-2">
              <a 
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:scale-110 hover:text-pink-500"
                style={{ color: textColor }}
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:scale-110 hover:text-white"
                style={{ color: textColor }}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Columna 2: Horario */}
          <div className="space-y-4">
            <button
              onClick={() => setHorarioAbierto(!horarioAbierto)}
              className="flex items-center gap-2 font-semibold transition-colors hover:opacity-80"
              style={{ color: textColor }}
            >
              <Clock className="h-4 w-4" />
              Horario
              {horarioAbierto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {horarioAbierto && (
              <ul className="space-y-2 text-sm">
                {Object.entries(negocio.horarioNormal).map(([dia, horas]: [string, any]) => (
                  <li key={dia} className="flex justify-between">
                    <span style={{ color: textColor }}>{dayNames[dia] || dia}</span>
                    <span className="font-medium" style={{ color: textColor }}>
                      {formatHorario(horas.apertura, horas.cierre)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Columna 3: Enlaces rápidos */}
          <div className="space-y-4">
            <h4 className="font-semibold" style={{ color: textColor }}>Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/carta" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: textColor }}>
                  <Globe className="h-3 w-3" /> Carta
                </Link>
              </li>
              <li>
                <a 
                  href={reservasWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:opacity-80"
                  style={{ color: textColor }}
                >
                  <MessageCircle className="h-3 w-3" /> Reservas
                </a>
              </li>
              <li>
                <Link href="/sugerencias" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: textColor }}>
                  <Globe className="h-3 w-3" /> Sugerencias
                </Link>
              </li>
              <li>
                <Link href="/ubicacion" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: textColor }}>
                  <Globe className="h-3 w-3" /> Ubicación
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6" style={{ borderColor: `${textColor}30` }}>
          <p className="text-center text-sm" style={{ color: textColor }}>
            © {new Date().getFullYear()} {negocio.nombre}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}