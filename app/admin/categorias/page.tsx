'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Eye, EyeOff, FolderTree, Search, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCategoriasGlobales, updateCategoriaGlobal, deleteCategoriaGlobal, type CategoriaGlobal } from '@/lib/firebase-services'
import { toast } from 'sonner'

export default function CategoriasPage() {
  const [categories, setCategories] = useState<CategoriaGlobal[]>([])
  const [filteredCategories, setFilteredCategories] = useState<CategoriaGlobal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => { loadData() }, [])
  useEffect(() => { filterCategories() }, [searchTerm, statusFilter, categories])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const categoriasData = await getCategoriasGlobales()
      setCategories(categoriasData)
      setFilteredCategories(categoriasData)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Error al cargar categorías')
    } finally {
      setIsLoading(false)
    }
  }

  const filterCategories = () => {
    let filtered = [...categories]
    if (searchTerm) {
      filtered = filtered.filter(category => category.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    if (statusFilter === 'active') {
      filtered = filtered.filter(category => category.activo === true)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(category => category.activo === false)
    }
    setFilteredCategories(filtered)
    setCurrentPage(1)
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    const loadingToast = toast.loading('Actualizando...')
    try {
      await updateCategoriaGlobal(id, { activo: !currentActive })
      setCategories(prev => prev.map(c => c.id === id ? { ...c, activo: !currentActive } : c))
      toast.success('Estado actualizado', { id: loadingToast })
    } catch (error) {
      console.error('Error toggling category:', error)
      toast.error('Error al actualizar', { id: loadingToast })
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      const loadingToast = toast.loading('Eliminando...')
      try {
        await deleteCategoriaGlobal(deleteId)
        await loadData()
        setDeleteId(null)
        toast.success('Categoría eliminada', { id: loadingToast })
      } catch (error) {
        console.error('Error deleting category:', error)
        toast.error('Error al eliminar', { id: loadingToast })
      }
    }
  }

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage)
  const clearFilters = () => { setSearchTerm(''); setStatusFilter('all') }

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-red-600/20 p-6 border border-blue-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <FolderTree className="h-5 w-5 text-blue-400" />
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Organización del menú</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">Categorías del Menú</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona las categorías que organizan tu carta</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/admin/categorias/nueva">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </Link>
      </div>

      <Card className="border border-gray-800 bg-gray-950/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-11 bg-gray-900 border-gray-700 text-white" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="inactive">Inactivas</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || statusFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="gap-2"><X className="h-4 w-4" />Limpiar filtros</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-800 bg-gray-950/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800 bg-gray-900/50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Orden</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paginatedCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="py-4 px-6"><span className="text-sm text-gray-300">{category.order || 0}</span></td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-white">{category.nombre}</p>
                        {category.nameEn && <p className="text-sm text-gray-400">{category.nameEn}</p>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button onClick={() => toggleActive(category.id, category.activo)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors bg-green-500/20 text-green-400 hover:bg-green-500/30">
                        {category.activo ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {category.activo ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/categorias/editar/${category.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit2 className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/50" onClick={() => setDeleteId(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-800 px-6 py-4">
              <div className="text-sm text-gray-400">Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredCategories.length)} de {filteredCategories.length}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm text-gray-400">Página {currentPage} de {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-gray-950 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">Esta acción no se puede deshacer. Los productos asociados a esta categoría quedarán sin categoría.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}