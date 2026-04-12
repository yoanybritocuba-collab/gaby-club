'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Instagram, 
  Facebook, 
  Phone, 
  Mail, 
  Clock, 
  Utensils, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  MessageCircle,
  Globe,
  Loader2
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

function HiddenLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return <Link href={href} className={className}>{children}</Link>
}

function HiddenExternalLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
}

export function Footer() {
  const [horarioAbierto, setHorarioAbierto] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [bgColor, setBgColor] = useState('#1a1a1a')
  const [textColor, setTextColor] = useState('#9ca3af')

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setConfig({
            restaurante: {
              nombre: data.nombre || "Gaby's Club",
              direccion: data.direccion || '',
              telefono: data.telefono || '',
              whatsapp: data.whatsapp || '',
              email: data.email || ''
            },
            redesSociales: {
              instagram: data.instagram || '',
              facebook: data.facebook || ''
            },
            horarioNormal: {
              lunes: { apertura: '12:00', cierre: '00:00' },
              martes: { apertura: '12:00', cierre: '00:00' },
              miercoles: { apertura: '12:00', cierre: '00:00' },
              jueves: { apertura: '12:00', cierre: '00:00' },
              viernes: { apertura: '12:00', cierre: '02:00' },
              sabado: { apertura: '12:00', cierre: '02:00' },
              domingo: { apertura: '12:00', cierre: '00:00' }
            }
          })
          setBgColor(data.footerBgColor || '#1a1a1a')
          setTextColor(data.footerTextColor || '#9ca3af')
        } else {
          setConfig({
            restaurante: {
              nombre: "Gaby's Club",
              direccion: 'Carrer del Tropazi, 24, Gràcia, 08012 Barcelona',
              telefono: '+34634492023',
              whatsapp: '+34634492023',
              email: 'info@gaviclub.com'
            },
            redesSociales: {
              instagram: '@gaviclub',
              facebook: ''
            },
            horarioNormal: {
              lunes: { apertura: '12:00', cierre: '00:00' },
              martes: { apertura: '12:00', cierre: '00:00' },
              miercoles: { apertura: '12:00', cierre: '00:00' },
              jueves: { apertura: '12:00', cierre: '00:00' },
              viernes: { apertura: '12:00', cierre: '02:00' },
              sabado: { apertura: '12:00', cierre: '02:00' },
              domingo: { apertura: '12:00', cierre: '00:00' }
            }
          })
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

  if (!config) return null

  const { restaurante, horarioNormal, redesSociales } = config

  const formatHorario = (apertura: string, cierre: string) => {
    if (apertura === 'Cerrado' || cierre === 'Cerrado') return 'Cerrado'
    return `${apertura} - ${cierre}`
  }

  return (
    <footer style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Columna 1: Restaurante */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="h-6 w-6" style={{ color: textColor }} />
              <h3 className="font-serif text-2xl font-bold" style={{ color: textColor }}>{restaurante.nombre}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" style={{ color: textColor }} />
                <span style={{ color: textColor }}>{restaurante.direccion}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" style={{ color: textColor }} />
                <span style={{ color: textColor }}>{restaurante.telefono}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" style={{ color: textColor }} />
                <span style={{ color: textColor }}>{restaurante.whatsapp}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" style={{ color: textColor }} />
                <span style={{ color: textColor }}>{restaurante.email}</span>
              </div>
            </div>
            
            {/* Redes Sociales */}
            <div className="flex gap-4 pt-2">
              {redesSociales.instagram && (
                <HiddenExternalLink 
                  href={`https://instagram.com/${redesSociales.instagram.replace('@', '')}`}
                  className="transition-all hover:scale-110 hover:text-pink-500"
                >
                  <Instagram className="h-5 w-5" style={{ color: textColor }} />
                </HiddenExternalLink>
              )}
              {redesSociales.facebook && (
                <HiddenExternalLink 
                  href={`https://facebook.com/${redesSociales.facebook}`}
                  className="transition-all hover:scale-110 hover:text-blue-600"
                >
                  <Facebook className="h-5 w-5" style={{ color: textColor }} />
                </HiddenExternalLink>
              )}
            </div>
          </div>

          {/* Columna 2: Horario */}
          <div className="space-y-4">
            <button
              onClick={() => setHorarioAbierto(!horarioAbierto)}
              className="flex items-center gap-2 font-semibold transition-colors hover:opacity-80"
              style={{ color: textColor }}
            >
              <Clock className="h-4 w-4" style={{ color: textColor }} />
              Horario
              {horarioAbierto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {horarioAbierto && (
              <ul className="space-y-2 text-sm">
                {Object.entries(horarioNormal).map(([dia, horas]: [string, any]) => (
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
              <li><HiddenLink href="/carta" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: textColor }}><Globe className="h-3 w-3" style={{ color: textColor }} /> <span style={{ color: textColor }}>Carta</span></HiddenLink></li>
              <li><HiddenLink href="/reservas" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: textColor }}><Globe className="h-3 w-3" style={{ color: textColor }} /> <span style={{ color: textColor }}>Reservas</span></HiddenLink></li>
              <li><HiddenLink href="/sugerencias" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: textColor }}><Globe className="h-3 w-3" style={{ color: textColor }} /> <span style={{ color: textColor }}>Sugerencias</span></HiddenLink></li>
              <li><HiddenLink href="/ubicacion" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: textColor }}><Globe className="h-3 w-3" style={{ color: textColor }} /> <span style={{ color: textColor }}>Ubicación</span></HiddenLink></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t pt-6" style={{ borderColor: `${textColor}30` }}>
          <p className="text-center text-sm" style={{ color: textColor }}>
            © {new Date().getFullYear()} {restaurante.nombre}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}