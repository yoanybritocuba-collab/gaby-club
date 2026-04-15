'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, ArrowUp, ChevronLeft, ChevronRight, X, Maximize2, Star, Loader2, Wine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { getAllProductos, getCategoriasActivasGlobales, type Producto, type CategoriaGlobal } from '@/lib/firebase-services'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function MenuPage() {
  const { t, language } = useI18n()
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [activeCategory, setActiveCategory] = useState<string>('todo')
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const [expandedCategoryId, setExpandedCategoryId] = useState<string>('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [categories, setCategories] = useState<CategoriaGlobal[]>([])
  const [products, setProducts] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  
  const [cartaImagen, setCartaImagen] = useState('')
  const [cartaTitulo, setCartaTitulo] = useState('La Carta')
  const [cartaTituloEn, setCartaTituloEn] = useState('The Menu')
  const [cartaTituloFr, setCartaTituloFr] = useState('La Carte')
  const [cartaTituloDe, setCartaTituloDe] = useState('Die Karte')
  const [cartaTituloRu, setCartaTituloRu] = useState('Меню')
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const getTranslatedProductName = (product: Producto) => {
    if (language === 'en') return product.nameEn || product.nombre
    if (language === 'fr') return product.nameFr || product.nombre
    if (language === 'de') return product.nameDe || product.nombre
    if (language === 'ru') return product.nameRu || product.nombre
    return product.nombre
  }

  const getTranslatedProductDescription = (product: Producto) => {
    if (language === 'en') return product.descriptionEn || product.descripcion
    if (language === 'fr') return product.descriptionFr || product.descripcion
    if (language === 'de') return product.descriptionDe || product.descripcion
    if (language === 'ru') return product.descriptionRu || product.descripcion
    return product.descripcion
  }

  const getTranslatedCategoryName = (cat: any) => {
    if (language === 'en') return cat.nameEn || cat.nombre
    if (language === 'fr') return cat.nameFr || cat.nombre
    if (language === 'de') return cat.nameDe || cat.nombre
    if (language === 'ru') return cat.nameRu || cat.nombre
    return cat.nombre
  }

  const getAnuncioTexto = () => {
    if (language === 'en') return "Please order at the bar"
    if (language === 'fr') return "Veuillez commander au bar"
    if (language === 'de') return "Bitte an der Bar bestellen"
    if (language === 'ru') return "Пожалуйста, заказывайте у бара"
    return "Pedir en barra"
  }

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setCartaImagen(data.cartaImagen || '')
          setCartaTitulo(data.cartaTitulo || 'La Carta')
          setCartaTituloEn(data.cartaTituloEn || 'The Menu')
          setCartaTituloFr(data.cartaTituloFr || 'La Carte')
          setCartaTituloDe(data.cartaTituloDe || 'Die Karte')
          setCartaTituloRu(data.cartaTituloRu || 'Меню')
        }
      } catch (error) {
        console.error('Error cargando configuración carta:', error)
      } finally {
        setIsLoadingConfig(false)
      }
    }
    loadConfig()
    loadData()
  }, [language])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [cats, prods] = await Promise.all([
        getCategoriasActivasGlobales(),
        getAllProductos()
      ])
      setCategories(cats)
      setProducts(prods)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCartaTitulo = () => {
    if (language === 'en') return cartaTituloEn
    if (language === 'fr') return cartaTituloFr
    if (language === 'de') return cartaTituloDe
    if (language === 'ru') return cartaTituloRu
    return cartaTitulo
  }

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 10)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10)
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      checkScrollPosition()
      container.addEventListener('scroll', checkScrollPosition)
      window.addEventListener('resize', checkScrollPosition)
      return () => {
        container.removeEventListener('scroll', checkScrollPosition)
        window.removeEventListener('resize', checkScrollPosition)
      }
    }
  }, [categories])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const changeCategory = (categoryId: string) => {
    setActiveCategory(categoryId)
    const activeButton = document.getElementById(`cat-btn-${categoryId}`)
    if (activeButton && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const buttonLeft = activeButton.offsetLeft
      const buttonWidth = activeButton.offsetWidth
      const containerWidth = container.offsetWidth
      const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' })
    }
  }

  const scrollHorizontal = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    }
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const toggleExpand = (productId: string, categoryId: string) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null)
      setExpandedCategoryId('')
    } else {
      setExpandedProduct(productId)
      setExpandedCategoryId(categoryId)
    }
  }

  if (isLoading || isLoadingConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Wine className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  const activeProducts = products.filter(p => p.activo === true)
  const suggestedProducts = activeProducts.filter(p => p.destacado === true)

  if (activeProducts.length === 0) {
    return (
      <div className="bg-black min-h-screen">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">{t('menu.title')}</h2>
          <p className="text-gray-400">{t('menu.noProducts')}</p>
        </div>
      </div>
    )
  }

  interface MenuCategory { 
    id: string
    name: string
    nameEn: string
    nameFr?: string
    nameDe?: string
    nameRu?: string
    type: 'suggestion' | 'all' | 'normal'
  }
  
  const menuCategories: MenuCategory[] = [
    ...(suggestedProducts.length > 0 ? [{ 
      id: 'sugerencias', 
      name: t('menu.suggestionsCategory'), 
      nameEn: "Bartender's Suggestions",
      type: 'suggestion' as const 
    }] : []),
    { 
      id: 'todo', 
      name: t('menu.todo'), 
      nameEn: 'All', 
      type: 'all' as const 
    },
    ...categories.filter(cat => cat.activo === true).map(cat => ({ 
      id: cat.id, 
      name: cat.nombre,
      nameEn: cat.nameEn || '', 
      nameFr: cat.nameFr || '',
      nameDe: cat.nameDe || '',
      nameRu: cat.nameRu || '',
      type: 'normal' as const 
    }))
  ]

  const availableCategories = menuCategories.filter(cat => {
    if (cat.type === 'suggestion') return suggestedProducts.length > 0
    if (cat.type === 'all') return true
    return cat.type === 'normal'
  })

  const getGroupedProductsByCategory = () => {
    const grouped: { categoryId: string; categoryName: string; products: Producto[] }[] = []
    categories.forEach(cat => {
      const catProducts = activeProducts.filter(p => p.categoriaGlobalId === cat.id).sort((a, b) => (a.orden || 0) - (b.orden || 0))
      if (catProducts.length > 0) {
        grouped.push({ 
          categoryId: cat.id, 
          categoryName: getTranslatedCategoryName(cat), 
          products: catProducts 
        })
      }
    })
    return grouped
  }

  const getProductsByCategory = () => {
    if (activeCategory === 'sugerencias') return { type: 'single', data: suggestedProducts }
    if (activeCategory === 'todo') return { type: 'grouped', data: getGroupedProductsByCategory() }
    return { type: 'single', data: activeProducts.filter(p => p.categoriaGlobalId === activeCategory).sort((a, b) => (a.orden || 0) - (b.orden || 0)) }
  }

  const currentData = getProductsByCategory()
  const currentCategory = availableCategories.find(c => c.id === activeCategory)

  const getCategoryButtonName = (category: MenuCategory): string => {
    if (category.type === 'suggestion') return category.name
    if (category.type === 'all') return category.name
    if (language === 'en') return category.nameEn || category.name
    if (language === 'fr') return category.nameFr || category.name
    if (language === 'de') return category.nameDe || category.name
    if (language === 'ru') return category.nameRu || category.name
    return category.name
  }

  const renderProducts = (productsList: Producto[]) => {
    if (view === 'grid') {
      return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productsList.map((product) => {
            const productName = getTranslatedProductName(product)
            const productDescription = getTranslatedProductDescription(product)
            const isSuggested = product.destacado === true
            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer bg-gray-900/95 border-gray-800">
                {isSuggested && (
                  <div className="absolute top-2 right-2 z-10 flex gap-0.5 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                    <Star className="h-3 w-3 fill-gold text-gold" />
                    <Star className="h-3 w-3 fill-gold text-gold" />
                    <Star className="h-3 w-3 fill-gold text-gold" />
                  </div>
                )}
                <CardContent className="p-0">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-800">
                    {product.imagenUrl ? <img src={product.imagenUrl} alt={productName} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl bg-gray-800">🍽️</div>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base text-white mb-2">{productName}</h3>
                    {productDescription && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{productDescription}</p>}
                    <p className="font-bold text-xl text-gold mt-2">{product.precio.toFixed(2)}€</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )
    }
    return (
      <div className="space-y-4">
        {productsList.map((product) => {
          const productName = getTranslatedProductName(product)
          const productDescription = getTranslatedProductDescription(product)
          const isExpanded = expandedProduct === product.id
          const isSuggested = product.destacado === true
          const currentCategoryId = activeCategory === 'sugerencias' ? 'sugerencias' : product.categoriaGlobalId
          return (
            <div key={product.id} className={cn("bg-gray-900/95 rounded-xl border border-gray-800 transition-all duration-300 cursor-pointer relative overflow-hidden", isExpanded ? "shadow-xl" : "hover:shadow-md")} onClick={() => toggleExpand(product.id, currentCategoryId)}>
              {isSuggested && !isExpanded && (
                <div className="absolute top-2 right-2 z-10 flex gap-0.5 bg-black/50 rounded-full px-2 py-1">
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  <Star className="h-3 w-3 fill-gold text-gold" />
                </div>
              )}
              {!isExpanded && (
                <div className="flex">
                  <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] flex-shrink-0 bg-gray-800">
                    {product.imagenUrl ? <img src={product.imagenUrl} alt={productName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl">🍽️</div>}
                  </div>
                  <div className="flex-1 p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm sm:text-base text-white">{productName}</h3>
                        {productDescription && <p className="text-xs text-gray-400 line-clamp-2 mt-1">{productDescription}</p>}
                      </div>
                    </div>
                    <p className="font-bold text-base sm:text-lg text-gold text-right mt-2">{product.precio.toFixed(2)}€</p>
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <Button size="sm" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 text-gold hover:text-gold-dark hover:bg-gold/10" onClick={(e) => { e.stopPropagation(); toggleExpand(product.id, currentCategoryId); }}>
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {isExpanded && (
                <div className="p-4">
                  {isSuggested && (
                    <div className="flex justify-end mb-2 gap-0.5">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      <Star className="h-4 w-4 fill-gold text-gold" />
                    </div>
                  )}
                  <div className="aspect-[4/3] bg-gray-800 rounded-xl overflow-hidden mb-4">
                    {product.imagenUrl ? <img src={product.imagenUrl} alt={productName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl">🍽️</div>}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{productName}</h3>
                  {productDescription && <p className="text-sm text-gray-400 mb-4 leading-relaxed">{productDescription}</p>}
                  <p className="text-2xl font-bold text-gold mb-4">{product.precio.toFixed(2)}€</p>
                  <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-800">
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); toggleExpand(product.id, currentCategoryId); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderMainContent = () => {
    if (currentData.type === 'grouped') {
      return (
        <div className="space-y-12">
          {(currentData.data as { categoryId: string; categoryName: string; products: Producto[] }[]).map((group) => (
            <div key={group.categoryId}>
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gold/30 text-gold">{group.categoryName}</h2>
              {renderProducts(group.products)}
            </div>
          ))}
        </div>
      )
    }
    return renderProducts(currentData.data as Producto[])
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Imagen de portada */}
      {cartaImagen && (
        <div className="relative h-[45vh] min-h-[350px] md:h-[55vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${cartaImagen})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-lg">
              {getCartaTitulo()}
            </h1>
            <div className="w-24 h-0.5 bg-gold mt-6 mb-4 mx-auto" />
            <p className="text-sm md:text-base text-white/80 tracking-wider">Cócteles | Tapas | Música</p>
          </div>
        </div>
      )}

      {/* Anuncio sutil */}
      <div className="container mx-auto px-4 py-6 text-center">
        <div className="inline-block animate-pulse-slow">
          <p className="text-gold text-lg md:text-xl font-bold tracking-wide">
            🍸 {getAnuncioTexto()} 🍹
          </p>
        </div>
        <div className="w-20 h-px bg-gold/50 mx-auto mt-3" />
      </div>

      <div className="pt-2"></div>

      {/* Menú horizontal de categorías CON INDICADOR DE DESPLAZAMIENTO */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur border-b border-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="relative flex items-center">
            {/* Gradiente izquierdo */}
            {showLeftArrow && (
              <div className="absolute left-0 z-10 w-12 h-full bg-gradient-to-r from-black to-transparent pointer-events-none" />
            )}
            
            {/* Flecha izquierda */}
            {showLeftArrow && (
              <button 
                onClick={() => scrollHorizontal('left')} 
                className="absolute left-0 z-20 h-8 w-8 flex items-center justify-center rounded-full bg-gray-900 shadow-md border border-gold text-gold hover:scale-110 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            
            {/* Contenedor scrollable */}
            <div 
              ref={scrollContainerRef} 
              className="flex gap-2 overflow-x-auto scroll-smooth py-3 hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {availableCategories.map((category) => {
                const categoryName = getCategoryButtonName(category)
                const isActive = activeCategory === category.id
                return (
                  <Button 
                    key={category.id} 
                    id={`cat-btn-${category.id}`} 
                    onClick={() => changeCategory(category.id)} 
                    variant="outline"
                    size="default" 
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-300 ${
                      isActive 
                        ? 'bg-gold text-black border-gold' 
                        : 'bg-black border-2 border-gold text-gold hover:shadow-gold'
                    }`}
                  >
                    {category.type === 'suggestion' && (
                      <div className="flex gap-0.5 mr-1">
                        <Star className="h-3 w-3 fill-gold text-gold" />
                        <Star className="h-3 w-3 fill-gold text-gold" />
                        <Star className="h-3 w-3 fill-gold text-gold" />
                      </div>
                    )}
                    <span className={isActive ? "text-black font-medium" : "text-gold font-medium"}>{categoryName}</span>
                  </Button>
                )
              })}
            </div>
            
            {/* Gradiente derecho */}
            {showRightArrow && (
              <div className="absolute right-0 z-10 w-12 h-full bg-gradient-to-l from-black to-transparent pointer-events-none" />
            )}
            
            {/* Flecha derecha */}
            {showRightArrow && (
              <button 
                onClick={() => scrollHorizontal('right')} 
                className="absolute right-0 z-20 h-8 w-8 flex items-center justify-center rounded-full bg-gray-900 shadow-md border border-gold text-gold hover:scale-110 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end mb-3">
          <div className="flex items-center gap-2 bg-gray-900/30 rounded-lg p-1">
            <button 
              onClick={() => setView('grid')} 
              className={cn("h-8 w-8 rounded-md flex items-center justify-center transition-all", view === 'grid' ? "bg-gold text-black shadow-sm" : "text-gray-400 hover:bg-gray-800")}
              title={t('menu.gridView')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setView('list')} 
              className={cn("h-8 w-8 rounded-md flex items-center justify-center transition-all", view === 'list' ? "bg-gold text-black shadow-sm" : "text-gray-400 hover:bg-gray-800")}
              title={t('menu.listView')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {renderMainContent()}
        
        {currentData.type === 'single' && (currentData.data as Producto[]).length === 0 && (
          <div className="text-center py-12"><p className="text-gray-400">{t('menu.noProductsInCategory')}</p></div>
        )}
      </div>

      {showScrollTop && <Button className="fixed bottom-6 right-6 rounded-full shadow-lg z-50 h-10 w-10 bg-gold hover:bg-gold-dark text-black" size="icon" onClick={scrollToTop}><ArrowUp className="h-4 w-4" /></Button>}

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}