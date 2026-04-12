'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff, 
  Package, 
  Search, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAllProductos, updateProducto, deleteProducto, getCategoriasGlobales, type Producto, type CategoriaGlobal } from '@/lib/firebase-services'
import toast from 'react-hot-toast'

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Producto[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([])
  const [categories, setCategories] = useState<CategoriaGlobal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const itemsPerPage = 10

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, statusFilter, products])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [productosData, categoriasData] = await Promise.all([
        getAllProductos(),
        getCategoriasGlobales()
      ])
      setProducts(productosData)
      setFilteredProducts(productosData)
      setCategories(categoriasData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoriaGlobalId === selectedCategory)
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(product => product.activo === true)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(product => product.activo === false)
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }

  const toggleAvailable = async (id: string, currentActive: boolean) => {
    const loadingToast = toast.loading('Actualizando...')
    try {
      await updateProducto(id, { activo: !currentActive })
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, activo: !currentActive } : p
      ))
      toast.success('Estado actualizado', { id: loadingToast })
    } catch (error) {
      console.error('Error toggling product:', error)
      toast.error('Error al actualizar', { id: loadingToast })
    }
  }

  const toggleSuggestion = async (id: string, currentSuggestion: boolean) => {
    const loadingToast = toast.loading('Actualizando...')
    try {
      await updateProducto(id, { destacado: !currentSuggestion })
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, destacado: !currentSuggestion } : p
      ))
      toast.success('Producto destacado actualizado', { id: loadingToast })
    } catch (error) {
      console.error('Error toggling suggestion:', error)
      toast.error('Error al actualizar', { id: loadingToast })
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      const loadingToast = toast.loading('Eliminando...')
      try {
        await deleteProducto(deleteId)
        await loadData()
        setDeleteId(null)
        toast.success('Producto eliminado', { id: loadingToast })
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error('Error al eliminar', { id: loadingToast })
      }
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.nombre || 'Sin categoría'
  }

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setStatusFilter('all')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-red-600/20 p-6 border border-blue-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-blue-400" />
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Gestión de productos</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
            Productos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gestiona todos los productos de tu carta
          </p>
        </div>
      </div>

      {/* Botón agregar */}
      <div className="flex justify-end">
        <Link href="/admin/productos/nuevo">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/20">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card className="border border-blue-800/30 bg-gray-950 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px] bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="all">📁 Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="all">📊 Todos</SelectItem>
                  <SelectItem value="active">✅ Activos</SelectItem>
                  <SelectItem value="inactive">❌ Inactivos</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || selectedCategory !== 'all' || statusFilter !== 'all') && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2 text-gray-400 hover:text-white hover:bg-gray-800">
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>{filteredProducts.length} productos encontrados</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <Card className="border border-blue-800/30 bg-gray-950 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-white">No hay productos</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'No se encontraron productos con los filtros aplicados'
                : 'Comienza creando tu primer producto'}
            </p>
            {!searchTerm && selectedCategory === 'all' && statusFilter === 'all' && (
              <Link href="/admin/productos/nuevo" className="mt-4">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear producto
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 bg-gray-950 rounded-lg border border-gray-800 p-3 hover:border-blue-500/50 transition-all duration-200">
                {/* Foto pequeña */}
                <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-900">
                  {product.imagenUrl ? (
                    <img
                      src={product.imagenUrl}
                      alt={product.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-white text-sm">{product.nombre}</h3>
                    {product.destacado && (
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    )}
                    {!product.activo && (
                      <span className="text-xs text-red-400">(Oculto)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-sm font-semibold text-blue-400">
                      €{product.precio.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getCategoryName(product.categoriaGlobalId)}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                    onClick={() => toggleSuggestion(product.id, product.destacado || false)}
                    title={product.destacado ? 'Quitar destacado' : 'Destacar producto'}
                  >
                    {product.destacado ? (
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                    onClick={() => toggleAvailable(product.id, product.activo)}
                    title={product.activo ? 'Ocultar producto' : 'Mostrar producto'}
                  >
                    {product.activo ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-red-500" />
                    )}
                  </Button>

                  <Link href={`/admin/productos/editar/${product.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800" title="Editar">
                      <Edit2 className="h-4 w-4 text-blue-500" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                    onClick={() => setDeleteId(product.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0",
                        currentPage === pageNum 
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white" 
                          : "border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                      )}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-gray-900 border border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}