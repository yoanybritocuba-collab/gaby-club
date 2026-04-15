'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Instagram, Facebook, Phone, Mail, Clock, Wine, ChevronDown, ChevronUp, MapPin, MessageCircle, Globe, Loader2
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useI18n } from '@/lib/i18n'

export function Footer() {
  const { t } = useI18n()
  const [horarioAbierto, setHorarioAbierto] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [bgColor, setBgColor] = useState('#000000')
  const [textColor, setTextColor] = useState('#d1b275')
  const [horario, setHorario] = useState({
    lunes: { apertura: '20:00', cierre: '02:30' },
    martes: { apertura: '20:00', cierre: '02:30' },
    miercoles: { apertura: '20:00', cierre: '02:30' },
    jueves: { apertura: '20:00', cierre: '02:30' },
    viernes: { apertura: '20:00', cierre: '03:00' },
    sabado: { apertura: '20:00', cierre: '03:00' },
    domingo: { apertura: '20:00', cierre: '03:00' }
  })

  const negocio = {
    nombre: "Gaby's Club",
    direccion: "Carrer del Tropazi, 24, Gracia, 08012 Barcelona",
    telefono: "+34634492023",
    whatsapp: "+34634492023",
    email: "info@gabysclub.com",
    instagram: "https://www.instagram.com/gabys_club24",
    tiktok: "https://www.tiktok.com/@gabysclub_24"
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
          
          if (data.horario) {
            setHorario(data.horario)
          }
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
    lunes: t('day.monday'),
    martes: t('day.tuesday'),
    miercoles: t('day.wednesday'),
    jueves: t('day.thursday'),
    viernes: t('day.friday'),
    sabado: t('day.saturday'),
    domingo: t('day.sunday')
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
    if (apertura === 'Cerrado' || cierre === 'Cerrado') return t('day.closed')
    return `${apertura} - ${cierre}`
  }

  const whatsappUrl = `https://wa.me/${negocio.whatsapp.replace(/[^0-9]/g, '')}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocio.direccion)}`

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
                href={negocio.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:scale-110 hover:text-pink-500"
                style={{ color: textColor }}
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href={negocio.tiktok}
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
              {t('location.hours')}
              {horarioAbierto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {horarioAbierto && (
              <ul className="space-y-2 text-sm">
                {Object.entries(horario).map(([dia, horas]: [string, any]) => (
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
            <h4 className="font-semibold" style={{ color: textColor }}>{t('footer.links') || 'Enlaces'}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/carta" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: textColor }}>
                  <Globe className="h-3 w-3" /> {t('nav.menu')}
                </Link>
              </li>
              <li>
                <Link href="/reservas" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: textColor }}>
                  <MessageCircle className="h-3 w-3" /> {t('nav.reservations')}
                </Link>
              </li>
              <li>
                <Link href="/sugerencias" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: textColor }}>
                  <Globe className="h-3 w-3" /> {t('nav.suggestions')}
                </Link>
              </li>
              <li>
                <Link href="/ubicacion" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: textColor }}>
                  <Globe className="h-3 w-3" /> {t('nav.location')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6" style={{ borderColor: `${textColor}30` }}>
          <p className="text-center text-sm" style={{ color: textColor }}>
            © {new Date().getFullYear()} {negocio.nombre}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}