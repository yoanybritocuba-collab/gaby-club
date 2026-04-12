'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Star, Sparkles, Heart, Shield, Truck, Coffee, Utensils, Wine, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SuggestionCard } from '@/components/suggestion-card'
import { useI18n } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { LineaInformativa } from '@/components/LineaInformativa'

const WHATSAPP_NUMBER = "34634492023"
const WHATSAPP_MESSAGE = "Hola, me gustaría hacer una reserva"

export default function HomePage() {
  const { t } = useI18n()
  const { getSuggestions, isLoading } = useStore()
  const [portadaUrl, setPortadaUrl] = useState<string>('')
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [isLoadingPortada, setIsLoadingPortada] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState('34634492023')
  const [lineaConfig, setLineaConfig] = useState<any>(null)

  useEffect(() => {
    const loadPortada = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setPortadaUrl(data.portada || '')
          setTitulo(data.titulo || "Gaby's Club")
          setSubtitulo(data.subtitulo || 'Cócteles y picaderas')
          
          if (data.whatsapp) {
            const cleanNumber = data.whatsapp.replace(/[^0-9]/g, '')
            setWhatsappNumber(cleanNumber)
          }
          
          setLineaConfig({
            activo: data.lineaActiva || false,
            texto: data.lineaTexto || '',
            colorTexto: data.lineaColorTexto || '#ffffff',
            colorFondo: data.lineaColorFondo || '#000000',
            tamanioLetra: data.lineaTamanioLetra || 16,
            tipoLetra: data.lineaTipoLetra || 'Arial',
            velocidad: data.lineaVelocidad || 10,
            tiempoEntre: data.lineaTiempoEntre || 2,
            ancho: data.lineaAncho || 100,
            posicion: data.lineaPosicion || 'center'
          })
        }
      } catch (error) {
        console.error('Error cargando portada:', error)
      } finally {
        setIsLoadingPortada(false)
      }
    }
    loadPortada()
  }, [])

  const suggestions = getSuggestions().slice(0, 6)
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  if (isLoading || isLoadingPortada) {
    return <div className="flex min-h-screen items-center justify-center bg-black"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Línea Informativa */}
      {lineaConfig && <LineaInformativa config={lineaConfig} />}

      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${portadaUrl || '/default-bg.jpg'})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6"><Sparkles className="h-4 w-4 text-amber-400" /><span className="text-xs uppercase tracking-wider">Bienvenido</span></div>
          <h1 className="mb-4 font-display text-5xl md:text-7xl lg:text-8xl font-bold">{titulo}</h1>
          <div className="h-0.5 w-20 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 mx-auto my-6 rounded-full" />
          <p className="mb-8 max-w-2xl text-lg md:text-xl text-white/90">{subtitulo}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/carta"><Button variant="default" size="lg" className="text-lg px-8 rounded-full">Ver Carta <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"><Button variant="default" size="lg" className="text-lg px-8 rounded-full">Reservar <ArrowRight className="ml-2 h-5 w-5" /></Button></a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group"><div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600/10 flex items-center justify-center group-hover:scale-110"><Truck className="h-8 w-8 text-blue-600" /></div><h3 className="font-semibold mb-1 text-white">Delivery</h3><p className="text-sm text-gray-400">Envío a domicilio</p></div>
            <div className="text-center group"><div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-600/10 flex items-center justify-center group-hover:scale-110"><Heart className="h-8 w-8 text-red-600" /></div><h3 className="font-semibold mb-1 text-white">Casero</h3><p className="text-sm text-gray-400">Recetas tradicionales</p></div>
            <div className="text-center group"><div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600/10 flex items-center justify-center group-hover:scale-110"><Shield className="h-8 w-8 text-blue-600" /></div><h3 className="font-semibold mb-1 text-white">Calidad</h3><p className="text-sm text-gray-400">Ingredientes frescos</p></div>
            <div className="text-center group"><div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-600/10 flex items-center justify-center group-hover:scale-110"><Clock className="h-8 w-8 text-red-600" /></div><h3 className="font-semibold mb-1 text-white">Horario flexible</h3><p className="text-sm text-gray-400">Todos los días</p></div>
          </div>
        </div>
      </section>

      {/* Suggestions Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 rounded-full px-4 py-1.5 mb-5"><Star className="h-4 w-4 text-amber-500 fill-amber-500" /><span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Los más pedidos</span></div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4"><span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Especialidades</span><span className="text-red-600 mx-3">de la casa</span></h2>
            <div className="flex items-center justify-center gap-3 my-4"><div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-600"></div><div className="flex gap-1"><Coffee className="h-4 w-4 text-amber-500" /><Utensils className="h-4 w-4 text-red-600" /><Wine className="h-4 w-4 text-blue-600" /></div><div className="h-px w-16 bg-gradient-to-l from-transparent to-red-600"></div></div>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Nuestros platos más solicitados por los clientes</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{suggestions.map((product) => (<SuggestionCard key={product.id} product={product} />))}</div>
          <div className="mt-12 text-center"><Link href="/carta"><Button variant="outline" size="lg" className="rounded-full px-8">Descubrir toda la carta <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-r from-blue-600 to-red-600">
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">¿Listo para disfrutar?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90">Reserva tu mesa o pide a domicilio</p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button variant="default" size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 rounded-full shadow-xl">Reservar ahora <ArrowRight className="ml-2 h-5 w-5" /></Button>
          </a>
        </div>
      </section>
    </div>
  )
}