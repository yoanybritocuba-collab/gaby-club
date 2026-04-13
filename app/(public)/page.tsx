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

export default function HomePage() {
  const { language, t } = useI18n()
  const { getSuggestions, isLoading } = useStore()
  const [portadaUrl, setPortadaUrl] = useState<string>('')
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [isLoadingPortada, setIsLoadingPortada] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState('34634492023')
  const [tickerConfig, setTickerConfig] = useState<any>(null)

  useEffect(() => {
    const loadPortada = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setPortadaUrl(data.portada || '')
          
          if (language === 'en') {
            setTitulo(data.tituloEn || data.titulo || "Gaby's Club")
            setSubtitulo(data.subtituloEn || data.subtitulo || 'The best cocktails in the city')
          } else if (language === 'fr') {
            setTitulo(data.tituloFr || data.titulo || "Gaby's Club")
            setSubtitulo(data.subtituloFr || data.subtitulo || 'Les meilleurs cocktails de la ville')
          } else if (language === 'de') {
            setTitulo(data.tituloDe || data.titulo || "Gaby's Club")
            setSubtitulo(data.subtituloDe || data.subtitulo || 'Die besten Cocktails der Stadt')
          } else if (language === 'ru') {
            setTitulo(data.tituloRu || data.titulo || "Gaby's Club")
            setSubtitulo(data.subtituloRu || data.subtitulo || 'Лучшие коктейли в городе')
          } else {
            setTitulo(data.titulo || "Gaby's Club")
            setSubtitulo(data.subtitulo || 'Los mejores cócteles de la ciudad')
          }
          
          if (data.whatsapp) {
            const cleanNumber = data.whatsapp.replace(/[^0-9]/g, '')
            setWhatsappNumber(cleanNumber)
          }
          
          setTickerConfig({
            activo: data.tickerActivo || false,
            texto: data.tickerTexto || '',
            colorTexto: data.tickerColorTexto || '#d1b275',
            colorFondo: data.tickerColorFondo || '#000000',
            velocidad: data.tickerVelocidad || 15,
            altura: data.tickerAltura || 40,
            posicion: data.tickerPosicion || 'top'
          })
        }
      } catch (error) {
        console.error('Error cargando portada:', error)
      } finally {
        setIsLoadingPortada(false)
      }
    }
    loadPortada()
  }, [language])

  const suggestions = getSuggestions().slice(0, 6)
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, me gustaría hacer una reserva")}`

  if (isLoading || isLoadingPortada) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {tickerConfig && <LineaInformativa config={tickerConfig} />}

      <section className="relative h-[40vh] min-h-[350px] md:h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${portadaUrl || '/default-bg.jpg'})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-xs uppercase tracking-wider">{t('hero.welcome')}</span>
          </div>
          <h1 className="mb-4 font-display text-4xl md:text-6xl lg:text-7xl font-bold">{titulo}</h1>
          <div className="h-0.5 w-20 bg-gold mx-auto my-6 rounded-full" />
          <p className="mb-8 max-w-2xl text-base md:text-lg text-white/90">{subtitulo}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/carta">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-base md:text-lg px-6 md:px-8 rounded-full bg-black border-2 border-gold text-gold hover:shadow-gold transition-all duration-300"
              >
                {t('hero.cta.menu')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-base md:text-lg px-6 md:px-8 rounded-full bg-black border-2 border-gold text-gold hover:shadow-gold transition-all duration-300"
              >
                {t('hero.cta.reserve')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-black to-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Icono 1: Sabor Casero */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-gold" />
              </div>
              <h3 className="font-semibold mb-1 text-white">{t('features.homemade.title')}</h3>
              <p className="text-sm text-gray-400">{t('features.homemade.subtitle')}</p>
            </div>
            {/* Icono 2: Calidad */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-gold" />
              </div>
              <h3 className="font-semibold mb-1 text-white">{t('features.quality.title')}</h3>
              <p className="text-sm text-gray-400">{t('features.quality.subtitle')}</p>
            </div>
            {/* Icono 3: Horario Flexible */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-gold" />
              </div>
              <h3 className="font-semibold mb-1 text-white">{t('features.flexible.title')}</h3>
              <p className="text-sm text-gray-400">{t('features.flexible.subtitle')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-1.5 mb-5">
              <Star className="h-4 w-4 text-gold fill-gold" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">{t('home.mostRequested')}</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-white">{t('home.specialties')}</span>
              <span className="text-gold mx-3">{t('home.ofTheHouse')}</span>
            </h2>
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
              <div className="flex gap-1">
                <Coffee className="h-4 w-4 text-gold" />
                <Utensils className="h-4 w-4 text-gold" />
                <Wine className="h-4 w-4 text-gold" />
              </div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
            </div>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">{t('home.favoritesDescription')}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((product) => (
              <SuggestionCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/carta">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-gold text-gold hover:shadow-gold transition-all duration-300">
                {t('home.discoverMenu')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-r from-gray-900 to-black">
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{t('home.cta.title')}</h2>
          <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto text-gray-300">{t('home.cta.subtitle')}</p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="bg-black border-2 border-gold text-gold hover:shadow-gold transition-all duration-300 text-base md:text-lg px-8 rounded-full">
              {t('home.cta.button')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}