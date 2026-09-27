'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Target, Star, Sparkles, Coffee, Utensils, Wine, Loader2, PartyPopper, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SuggestionCard } from '@/components/suggestion-card'
import { useI18n } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const HERO_IMAGENES = [
  { url: '/imagenes/422737-dart-454186_1920.jpg', titulo: 'Reservado VIP de Dardos', subtitulo: 'Juega, compite y disfruta con tus amigos' },
  { url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1600&q=80', titulo: 'Cócteles Premium', subtitulo: 'La mejor coctelería de Barcelona' },
  { url: '/imagenes/ds-foto-darts-673229_1920.jpg', titulo: 'Dianas Electrónicas', subtitulo: 'Puntuación automática en pantalla' },
  { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=1600&q=80', titulo: 'Ambiente Único', subtitulo: 'El mejor rollo de la ciudad' },
  { url: '/imagenes/grvault-darts-2966934_1920.jpg', titulo: 'Zona Privada', subtitulo: 'Tu espacio exclusivo para grupos' },
  { url: '/imagenes/photoshopzen-darts-5760240_1920.jpg', titulo: 'Compite con Amigos', subtitulo: 'Diversión garantizada' }
]

export default function HomePage() {
  const { language, t } = useI18n()
  const { getSuggestions, isLoading } = useStore()
  const [portadaUrl, setPortadaUrl] = useState<string>('')
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [isLoadingPortada, setIsLoadingPortada] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState('34634492023')
  const [slideActual, setSlideActual] = useState(0)

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
        }
      } catch (error) {
        console.error('Error cargando portada:', error)
      } finally {
        setIsLoadingPortada(false)
      }
    }
    loadPortada()
  }, [language])

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideActual((prev) => (prev + 1) % HERO_IMAGENES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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
      {/* HERO */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        {HERO_IMAGENES.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === slideActual ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img.url} alt={img.titulo} className="w-full h-full object-cover object-center" />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm border border-gold/40 rounded-full px-4 py-1.5 mb-6">
            <Target className="h-4 w-4 text-gold" />
            <span className="text-xs uppercase tracking-widest text-gold font-bold">
              Nueva Zona VIP
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-2xl max-w-4xl">
            {HERO_IMAGENES[slideActual].titulo}
          </h1>

          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-gold to-transparent rounded-full mb-6" />

          <p className="text-base md:text-xl text-white/90 max-w-2xl mb-8 drop-shadow-lg">
            {HERO_IMAGENES[slideActual].subtitulo}
          </p>

          {/* BOTONES PRINCIPALES */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href="/dardos">
              <Button
                size="lg"
                className="btn-gold text-base md:text-lg px-8 md:px-10 py-6 md:py-7"
              >
                <Target className="mr-2 h-5 w-5" />
                Reservar Dardos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/carta">
              <Button
                size="lg"
                className="btn-gold text-base md:text-lg px-8 py-6 md:py-7"
              >
                <Wine className="mr-2 h-5 w-5" />
                Ver Carta
              </Button>
            </Link>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {HERO_IMAGENES.map((_, index) => (
              <button
                key={index}
                onClick={() => setSlideActual(index)}
                className={`h-2 rounded-full transition-all ${index === slideActual ? 'w-10 bg-gold' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* VENTAJAS */}
      <section className="py-12 bg-gradient-to-b from-black to-gray-950 border-y border-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-semibold mb-1 text-white text-sm">Dianas Electrónicas</h3>
              <p className="text-xs text-gray-400">Puntuación automática</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-semibold mb-1 text-white text-sm">Grupos</h3>
              <p className="text-xs text-gray-400">Sin límite de personas</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-semibold mb-1 text-white text-sm">Duración Flexible</h3>
              <p className="text-xs text-gray-400">Hasta el cierre</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wine className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-semibold mb-1 text-white text-sm">Coctelería</h3>
              <p className="text-xs text-gray-400">Servicio en la mesa</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN EXPERIENCIA VIP */}
      <section className="py-20 md:py-28 bg-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-1.5 mb-5">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">Experiencia VIP</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-white">
              Mucho más que <span className="text-gold">dardos</span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
              Reserva nuestro espacio privado. Disfruta de cócteles mientras compites
              con tus amigos en un ambiente único.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="group relative rounded-2xl overflow-hidden shadow-2xl h-[350px] md:col-span-2 md:row-span-2 md:h-[500px]">
              <img src="/imagenes/422737-dart-454186_1920.jpg" alt="Reservado VIP" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-flex items-center gap-2 bg-gold text-black rounded-full px-3 py-1 mb-3">
                  <Target className="h-3 w-3" />
                  <span className="text-xs font-bold uppercase tracking-wider">Zona Privada</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Tu espacio, tus reglas</h3>
                <p className="text-gray-300 text-sm">Reservado exclusivo con dianas electrónicas y monitores</p>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden shadow-xl h-[250px] md:h-[240px]">
              <img src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80" alt="Cócteles premium" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Wine className="h-5 w-5 text-gold mb-1" />
                <p className="text-white text-sm font-semibold">Cócteles Premium</p>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden shadow-xl h-[250px] md:h-[240px]">
              <img src="https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80" alt="Ambiente único" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <PartyPopper className="h-5 w-5 text-gold mb-1" />
                <p className="text-white text-sm font-semibold">Ambiente Único</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/dardos">
              <Button size="lg" className="btn-gold text-base md:text-lg px-10 py-7">
                <Target className="mr-2 h-5 w-5" />
                Reservar Zona de Dardos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SUGERENCIAS */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-black to-gray-950">
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
              <Button size="lg" className="btn-gold px-8 py-6">
                {t('home.discoverMenu')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-r from-gray-900 to-black">
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{t('home.cta.title')}</h2>
          <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto text-gray-300">{t('home.cta.subtitle')}</p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="btn-gold text-base md:text-lg px-8 py-6">
              {t('home.cta.button')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}