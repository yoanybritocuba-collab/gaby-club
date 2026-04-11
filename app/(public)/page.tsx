'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight, Star, Sparkles, Heart, Shield, Truck, Coffee, Utensils, Wine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SuggestionCard } from '@/components/suggestion-card'
import { useI18n } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const WHATSAPP_NUMBER = "34682491444"
const WHATSAPP_MESSAGE = "Hola, me gustaría hacer una reserva"
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

// Carrusel de imágenes (para las otras diapositivas)
const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
    titleKey: "carousel.meat.title",
    subtitleKey: "carousel.meat.subtitle"
  },
  {
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    titleKey: "carousel.salads.title",
    subtitleKey: "carousel.salads.subtitle"
  },
  {
    url: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81",
    titleKey: "carousel.desserts.title",
    subtitleKey: "carousel.desserts.subtitle"
  },
  {
    url: "https://images.unsplash.com/photo-1544025162-d76694265947",
    titleKey: "carousel.grilled.title",
    subtitleKey: "carousel.grilled.subtitle"
  }
]

function HiddenLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
  }

  return (
    <Link href={href} className={className} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  )
}

function HiddenWhatsAppLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onMouseEnter={handleMouseEnter} className={className}>
      {children}
    </a>
  )
}

export default function HomePage() {
  const { t } = useI18n()
  const { getSuggestions, isLoading } = useStore()
  const [currentImage, setCurrentImage] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [portadaUrl, setPortadaUrl] = useState<string>('')
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')

  // Cargar configuración de portada desde Firestore
  useEffect(() => {
    const loadPortada = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setPortadaUrl(data.portada || '')
          setTitulo(data.titulo || 'Gavi-Club')
          setSubtitulo(data.subtitulo || 'Cócteles y picaderas')
        }
      } catch (error) {
        console.error('Error cargando portada:', error)
      }
    }
    loadPortada()
  }, [])

  const suggestions = getSuggestions().slice(0, 6)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % carouselImages.length)
        setTimeout(() => setIsTransitioning(false), 50)
      }, 50)
    }, 5000)
    return () => clearInterval(interval)
  }, [currentImage])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500 border-t-amber-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Utensils className="h-6 w-6 text-amber-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Carrusel - Primera imagen usa la portada de Firestore */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: isTransitioning ? 0 : 1 }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentImage === 0 && portadaUrl ? portadaUrl : carouselImages[currentImage].url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>

          <div 
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: isTransitioning ? 1 : 0 }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${carouselImages[(currentImage + 1) % carouselImages.length].url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>
        </div>

        {/* Indicadores de página */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => {
                  setCurrentImage(index)
                  setTimeout(() => setIsTransitioning(false), 50)
                }, 50)
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentImage 
                  ? 'w-8 bg-gradient-to-r from-blue-600 to-red-600' 
                  : 'w-4 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>

        {/* Texto central - Usa título y subtítulo desde Firestore en la primera diapositiva */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <div className={`transform transition-all duration-700 delay-100 ${isTransitioning ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
            {currentImage === 0 && portadaUrl ? (
              <>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-xs uppercase tracking-wider">Bienvenido</span>
                </div>
                <h1 className="mb-4 font-display text-5xl md:text-7xl lg:text-8xl font-bold">
                  {titulo}
                </h1>
                <div className="h-0.5 w-20 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 mx-auto my-6 rounded-full" />
                <p className="mb-8 max-w-2xl text-lg md:text-xl text-white/90">
                  {subtitulo}
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-xs uppercase tracking-wider">{t('common.since') || 'Desde 1985'}</span>
                </div>
                <h1 className="mb-4 font-display text-5xl md:text-7xl lg:text-8xl font-bold">
                  {t(carouselImages[currentImage].titleKey)}
                </h1>
                <div className="h-0.5 w-20 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 mx-auto my-6 rounded-full" />
                <p className="mb-8 max-w-2xl text-lg md:text-xl text-white/90">
                  {t(carouselImages[currentImage].subtitleKey)}
                </p>
              </>
            )}
            <div className="flex gap-4 justify-center flex-wrap">
              <HiddenLink href="/carta">
                <Button variant="default" size="lg" className="text-lg px-8 rounded-full">
                  {t('hero.cta.menu')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </HiddenLink>
              <HiddenWhatsAppLink href={WHATSAPP_LINK}>
                <Button variant="default" size="lg" className="text-lg px-8 rounded-full">
                  {t('hero.cta.reserve')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </HiddenWhatsAppLink>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600/10 to-red-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1 text-foreground">{t('features.delivery.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('features.delivery.subtitle')}</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600/10 to-red-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold mb-1 text-foreground">{t('features.homemade.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('features.homemade.subtitle')}</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600/10 to-red-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1 text-foreground">{t('features.quality.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('features.quality.subtitle')}</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600/10 to-red-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold mb-1 text-foreground">{t('features.flexible.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('features.flexible.subtitle')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Suggestions Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-red-600/10 rounded-full px-4 py-1.5 mb-5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {t('home.mostRequested')}
              </span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {t('home.specialties')}
              </span>
              <span className="text-red-600 mx-3">{t('home.ofTheHouse')}</span>
            </h2>
            
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-600"></div>
              <div className="flex gap-1">
                <Coffee className="h-4 w-4 text-amber-500" />
                <Utensils className="h-4 w-4 text-red-600" />
                <Wine className="h-4 w-4 text-blue-600" />
              </div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-600"></div>
            </div>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.favoritesDescription')}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((product) => (
              <SuggestionCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <HiddenLink href="/carta">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8 transition-all duration-300"
              >
                <span>{t('home.discoverMenu')}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </HiddenLink>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-r from-blue-600 to-red-600">
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90">
            {t('home.cta.subtitle')}
          </p>
          <HiddenWhatsAppLink href={WHATSAPP_LINK}>
            <Button variant="default" size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
              {t('home.cta.button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </HiddenWhatsAppLink>
        </div>
      </section>
    </div>
  )
}