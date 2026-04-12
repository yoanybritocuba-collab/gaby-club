'use client'

import { useState, useEffect, useRef } from 'react'
import { LayoutGrid, List, Plus, Minus, ArrowUp, ChevronLeft, ChevronRight, X, Maximize2, Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { addToCart } from '@/lib/cart-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getAllProductos, getCategoriasActivasGlobales, type Producto, type CategoriaGlobal } from '@/lib/firebase-services'
import { useI18n } from '@/lib/i18n'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function MenuPage() {
  const { t, language, getLocalizedField } = useI18n()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [activeCategory, setActiveCategory] = useState<string>('todo')
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const [expandedCategoryId, setExpandedCategoryId] = useState<string>('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [categories, setCategories] = useState<CategoriaGlobal[]>([])
  const [products, setProducts] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  
  // Configuración de la carta desde Firestore
  const [cartaTitulo, setCartaTitulo] = useState('La Carta')
  const [cartaImagen, setCartaImagen] = useState('')
  const [lineaActiva, setLineaActiva] = useState(false)
  const [lineaTexto, setLineaTexto] = useState('')
  const [lineaColor, setLineaColor] = useState('#ffffff')
  const [lineaAncho, setLineaAncho] = useState('100')
  const [lineaPosicion, setLineaPosicion] = useState('center')
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setCartaTitulo(data.cartaTitulo || 'La Carta')
          setCartaImagen(data.cartaImagen || '')
          setLineaActiva(data.lineaActiva || false)
          setLineaTexto(data.lineaTexto || '')
          setLineaColor(data.lineaColor || '#ffffff')
          setLineaAncho(data.lineaAncho || '100')
          setLineaPosicion(data.lineaPosicion || 'center')
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
  const updateQuantity = (productId: string, delta: number) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(0, (prev[productId] || 0) + delta) }))
  }

  const handleAddToCart = (product: Producto, productId: string) => {
    const quantity = quantities[productId] || 1
    if (quantity > 0) {
      const productName = getLocalizedField(product, 'nombre')
      addToCart({ id: product.id, name: productName, price: product.precio, image: product.imagenUrl }, quantity)
      toast.success(`${productName} agregado`, { duration: 2000 })
      setQuantities(prev => ({ ...prev, [productId]: 0 }))
      setExpandedProduct(null)
    }
  }

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
    return <div className="flex min-h-screen items-center justify-center bg-black"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  const activeProducts = products.filter(p => p.activo === true)
  const suggestedProducts = activeProducts.filter(p => p.destacado === true)

  if (activeProducts.length === 0) {
    return <div className="bg-black min-h-screen"><div className="container mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Carta</h2><p className="text-gray-400">No hay productos disponibles</p></div></div>
  }

  interface MenuCategory { id: string; name: string; nameEn: string; type: 'suggestion' | 'all' | 'normal' }
  const menuCategories: MenuCategory[] = [
    ...(suggestedProducts.length > 0 ? [{ id: 'sugerencias', name: 'Sugerencias del Chef', nameEn: "Chef's Suggestions", type: 'suggestion' as const }] : []),
    { id: 'todo', name: 'Todo', nameEn: 'All', type: 'all' as const },
    ...categories.filter(cat => cat.activo === true).map(cat => ({ id: cat.id, name: cat.nombre, nameEn: cat.nameEn || '', type: 'normal' as const }))
  ]

  const availableCategories = menuCategories.filter(cat => {
    if (cat.type === 'suggestion') return suggestedProducts.length > 0
    if (cat.type === 'all') return activeProducts.length > 0
    return activeProducts.some(p => p.categoriaGlobalId === cat.id)
  })

  const getGroupedProductsByCategory = () => {
    const grouped: { categoryId: string; categoryName: string; products: Producto[] }[] = []
    categories.forEach(cat => {
      const catProducts = activeProducts.filter(p => p.categoriaGlobalId === cat.id).sort((a, b) => (a.orden || 0) - (b.orden || 0))
      if (catProducts.length > 0) grouped.push({ categoryId: cat.id, categoryName: getLocalizedField(cat, 'name'), products: catProducts })
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
  const getCategoryName = (category: MenuCategory) => language === 'en' ? category.nameEn : category.name

  const renderProducts = (productsList: Producto[]) => {
    if (view === 'grid') {
      return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productsList.map((product) => {
            const quantity = quantities[product.id] || 0
            const productName = getLocalizedField(product, 'nombre')
            const productDescription = getLocalizedField(product, 'descripcion')
            const isSuggested = product.destacado === true
            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer bg-gray-900/95 border-gray-800">
                {isSuggested && <div className="absolute top-2 right-2 z-10 flex gap-0.5 bg-black/50 rounded-full px-2 py-1"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /></div>}
                <CardContent className="p-0">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-800">
                    {product.imagenUrl ? <img src={product.imagenUrl} alt={productName} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl bg-gray-800">🍽️</div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2"><h3 className="font-bold text-base text-white">{productName}</h3><p className="font-bold text-lg text-primary">€{product.precio.toFixed(2)}</p></div>
                    {productDescription && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{productDescription}</p>}
                    <div className="flex items-center justify-end gap-2 mt-2">
                      {quantity > 0 && <><Button size="icon" variant="outline" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }}><Minus className="h-3 w-3" /></Button><span className="w-6 text-center font-medium text-white">{quantity}</span></>}
                      <Button size={quantity > 0 ? "icon" : "default"} className={cn(quantity > 0 ? "h-8 w-8" : "gap-1")} onClick={(e) => { e.stopPropagation(); if (quantity === 0) updateQuantity(product.id, 1); else handleAddToCart(product, product.id); }}>
                        {quantity === 0 ? <>Agregar <Plus className="h-3 w-3" /></> : <Plus className="h-3 w-3" />}
                      </Button>
                    </div>
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
          const quantity = quantities[product.id] || 0
          const productName = getLocalizedField(product, 'nombre')
          const productDescription = getLocalizedField(product, 'descripcion')
          const isExpanded = expandedProduct === product.id
          const isSuggested = product.destacado === true
          const currentCategoryId = activeCategory === 'sugerencias' ? 'sugerencias' : product.categoriaGlobalId
          return (
            <div key={product.id} className={cn("bg-gray-900/95 rounded-xl border border-gray-800 transition-all duration-300 cursor-pointer relative overflow-hidden", isExpanded ? "shadow-xl" : "hover:shadow-md")} onClick={() => toggleExpand(product.id, currentCategoryId)}>
              {isSuggested && !isExpanded && <div className="absolute top-2 right-2 z-10 flex gap-0.5 bg-black/50 rounded-full px-2 py-1"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /></div>}
              {!isExpanded && (
                <div className="flex">
                  <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] flex-shrink-0 bg-gray-800">
                    {product.imagenUrl ? <img src={product.imagenUrl} alt={productName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl">🍽️</div>}
                  </div>
                  <div className="flex-1 p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2"><div className="flex-1"><h3 className="font-semibold text-sm sm:text-base text-white">{productName}</h3>{productDescription && <p className="text-xs text-gray-400 line-clamp-2 mt-1">{productDescription}</p>}</div><p className="font-bold text-base sm:text-lg text-primary whitespace-nowrap">€{product.precio.toFixed(2)}</p></div>
                    <div className="flex items-center justify-end gap-2 mt-3">
                      {quantity > 0 && <><Button size="icon" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8" onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }}><Minus className="h-3 w-3" /></Button><span className="w-6 text-center font-medium text-white text-sm">{quantity}</span></>}
                      <Button size={quantity > 0 ? "icon" : "sm"} className={cn(quantity > 0 ? "h-7 w-7 sm:h-8 sm:w-8" : "gap-1 h-7 sm:h-8 text-xs sm:text-sm")} onClick={(e) => { e.stopPropagation(); if (quantity === 0) updateQuantity(product.id, 1); else handleAddToCart(product, product.id); }}>
                        {quantity === 0 ? <>Agregar <Plus className="h-3 w-3" /></> : <Plus className="h-3 w-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8" onClick={(e) => { e.stopPropagation(); toggleExpand(product.id, currentCategoryId); }}><Maximize2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              )}
              {isExpanded && (
                <div className="p-4">
                  {isSuggested && <div className="flex justify-end mb-2 gap-0.5"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /></div>}
                  <div className="aspect-[4/3] bg-gray-800 rounded-xl overflow-hidden mb-4">
                    {product.imagenUrl ? <img src={product.imagenUrl} alt={productName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl">🍽️</div>}
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-2"><h3 className="text-xl font-bold text-white">{productName}</h3><p className="text-2xl font-bold text-primary">€{product.precio.toFixed(2)}</p></div>
                  {productDescription && <p className="text-sm text-gray-400 mb-4 leading-relaxed">{productDescription}</p>}
                  <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-gray-800">
                    {quantity > 0 && <><Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }}><Minus className="h-3 w-3" /></Button><span className="w-8 text-center font-semibold text-white">{quantity}</span></>}
                    <Button size="default" onClick={(e) => { e.stopPropagation(); if (quantity === 0) updateQuantity(product.id, 1); else handleAddToCart(product, product.id); }} className="gap-2">
                      {quantity === 0 ? "Agregar al pedido" : `Confirmar ${quantity} x €${product.precio.toFixed(2)}`} <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); toggleExpand(product.id, currentCategoryId); }}><X className="h-4 w-4" /></Button>
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
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-primary/30 text-white">{group.categoryName}</h2>
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
      {/* Hero Banner */}
      {cartaImagen && (
        <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${cartaImagen})` }} />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">{cartaTitulo}</h1>
            {lineaActiva && (
              <div className="mt-4" style={{ textAlign: lineaPosicion as any, width: `${lineaAncho}%`, marginLeft: 'auto', marginRight: 'auto' }}>
                <p className="text-sm md:text-base" style={{ color: lineaColor }}>{lineaTexto}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Menú horizontal de categorías */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur border-b border-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="relative flex items-center gap-2">
            {showLeftArrow && <button onClick={() => scrollHorizontal('left')} className="hidden md:flex absolute left-0 z-10 h-8 w-8 items-center justify-center rounded-full bg-gray-900 shadow-md border border-gray-700"><ChevronLeft className="h-4 w-4 text-white" /></button>}
            <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto scroll-smooth py-3" style={{ scrollbarWidth: 'thin' }}>
              {availableCategories.map((category) => {
                const categoryName = getCategoryName(category)
                const isActive = activeCategory === category.id
                return (
                  <Button key={category.id} id={`cat-btn-${category.id}`} onClick={() => changeCategory(category.id)} variant={isActive ? "default" : "outline"} size="default" className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0">
                    {category.type === 'suggestion' && <Star className="inline-block h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />}
                    {categoryName}
                  </Button>
                )
              })}
            </div>
            {showRightArrow && <button onClick={() => scrollHorizontal('right')} className="hidden md:flex absolute right-0 z-10 h-8 w-8 items-center justify-center rounded-full bg-gray-900 shadow-md border border-gray-700"><ChevronRight className="h-4 w-4 text-white" /></button>}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-2 bg-gray-900/30 rounded-lg p-1">
            <button onClick={() => setView('grid')} className={cn("h-8 w-8 rounded-md flex items-center justify-center", view === 'grid' ? "bg-primary text-white shadow-sm" : "text-gray-400 hover:bg-gray-800")}><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView('list')} className={cn("h-8 w-8 rounded-md flex items-center justify-center", view === 'list' ? "bg-primary text-white shadow-sm" : "text-gray-400 hover:bg-gray-800")}><List className="h-4 w-4" /></button>
          </div>
        </div>

        {currentCategory && activeCategory !== 'todo' && (
          <div className="mb-6"><h2 className="text-2xl font-bold pb-2 border-b border-primary/30 text-white">{getCategoryName(currentCategory)}</h2></div>
        )}

        {renderMainContent()}
        
        {currentData.type === 'single' && (currentData.data as Producto[]).length === 0 && (
          <div className="text-center py-12"><p className="text-gray-400">No hay productos en esta categoría</p></div>
        )}
      </div>

      {showScrollTop && <Button className="fixed bottom-6 right-6 rounded-full shadow-lg z-50 h-10 w-10" size="icon" onClick={scrollToTop}><ArrowUp className="h-4 w-4" /></Button>}
    </div>
  )
}