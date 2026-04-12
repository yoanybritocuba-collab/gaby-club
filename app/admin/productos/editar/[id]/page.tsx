'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Upload, X, Eye, Loader2, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getCategoriasGlobales, getProductoById, updateProducto, uploadImage, type CategoriaGlobal } from '@/lib/firebase-services'
import { translateText } from '@/lib/translate'
import { toast } from 'sonner'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [categories, setCategories] = useState<CategoriaGlobal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    nameEn: '',
    descripcion: '',
    descriptionEn: '',
    precio: '',
    categoriaGlobalId: '',
    activo: true,
    destacado: false,
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [productoData, categoriasData] = await Promise.all([
        getProductoById(id),
        getCategoriasGlobales()
      ])
      
      if (!productoData) {
        toast.error('Producto no encontrado')
        router.push('/admin/productos')
        return
      }
      
      setImagePreview(productoData.imagenUrl || null)
      setFormData({
        nombre: productoData.nombre || '',
        nameEn: productoData.nameEn || '',
        descripcion: productoData.descripcion || '',
        descriptionEn: productoData.descriptionEn || '',
        precio: productoData.precio?.toString() || '',
        categoriaGlobalId: productoData.categoriaGlobalId || '',
        activo: productoData.activo ?? true,
        destacado: productoData.destacado ?? false,
      })
      setCategories(categoriasData)
    } catch (error) {
      console.error('Error loading product:', error)
      toast.error('Error al cargar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTranslateAndSave = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre en español es obligatorio')
      return
    }

    if (!formData.categoriaGlobalId) {
      toast.error('Selecciona una categoría')
      return
    }

    setIsTranslating(true)
    toast.loading('Traduciendo y guardando...', { id: 'saving' })
    
    try {
      const [translatedName, translatedDescription] = await Promise.all([
        translateText(formData.nombre, 'en'),
        formData.descripcion ? translateText(formData.descripcion, 'en') : Promise.resolve('')
      ])
      
      let imagenUrl = imagePreview
      if (imageFile) {
        const timestamp = Date.now()
        const cleanName = formData.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        const path = `productos/${timestamp}_${cleanName}`
        imagenUrl = await uploadImage(imageFile, path)
      }

      await updateProducto(id, {
        nombre: formData.nombre,
        nameEn: translatedName,
        descripcion: formData.descripcion,
        descriptionEn: translatedDescription,
        precio: parseFloat(formData.precio),
        categoriaGlobalId: formData.categoriaGlobalId,
        activo: formData.activo,
        destacado: formData.destacado,
        imagenUrl: imagenUrl,
      })

      toast.success('Producto actualizado correctamente', { id: 'saving' })
      router.push('/admin/productos')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Error al actualizar el producto', { id: 'saving' })
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.precio || !formData.categoriaGlobalId) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setIsSaving(true)
    const loadingToast = toast.loading('Actualizando producto...')

    try {
      let imagenUrl = imagePreview
      
      if (imageFile) {
        const timestamp = Date.now()
        const cleanName = formData.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        const path = `productos/${timestamp}_${cleanName}`
        imagenUrl = await uploadImage(imageFile, path)
      }

      await updateProducto(id, {
        nombre: formData.nombre,
        nameEn: formData.nameEn,
        descripcion: formData.descripcion,
        descriptionEn: formData.descriptionEn,
        precio: parseFloat(formData.precio),
        categoriaGlobalId: formData.categoriaGlobalId,
        activo: formData.activo,
        destacado: formData.destacado,
        imagenUrl: imagenUrl,
      })

      toast.success('Producto actualizado correctamente', { id: loadingToast })
      router.push('/admin/productos')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Error al actualizar el producto', { id: loadingToast })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            Editar Producto
          </h1>
        </div>
        {imagePreview && (
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver imagen
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-gray-800 bg-gray-950/50">
          <CardContent className="p-4">
            <Label className="text-white">Imagen del producto</Label>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-3">
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 rounded-lg object-cover border-2 border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setImageFile(null)
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-950/50">
          <CardContent className="space-y-4 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">🇪🇸 Nombre (Español) *</Label>
                <Input
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">🇺🇸 Nombre (Inglés)</Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                  placeholder="English name"
                />
                <p className="text-xs text-gray-500 mt-1">Si lo dejas vacío, se traducirá automáticamente al guardar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">🇪🇸 Descripción (Español)</Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                  placeholder="Descripción del producto"
                />
              </div>
              <div>
                <Label className="text-white">🇺🇸 Descripción (Inglés)</Label>
                <Textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={3}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                  placeholder="English description"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Precio (€) *</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Categoría *</Label>
                <select
                  required
                  value={formData.categoriaGlobalId}
                  onChange={(e) => setFormData({ ...formData, categoriaGlobalId: e.target.value })}
                  className="w-full rounded-md border border-gray-700 bg-gray-900 p-2 mt-1 text-white"
                >
                  <option value="">Seleccionar</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <div className="flex items-center justify-between flex-1 border border-gray-800 rounded-lg p-3">
                <Label className="text-white">Disponible</Label>
                <Switch
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
              </div>
              <div className="flex items-center justify-between flex-1 border border-gray-800 rounded-lg p-3">
                <Label className="text-white">Destacado ⭐</Label>
                <Switch
                  checked={formData.destacado}
                  onCheckedChange={(checked) => setFormData({ ...formData, destacado: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button 
            type="button" 
            onClick={handleTranslateAndSave}
            disabled={isTranslating || !formData.nombre || !formData.categoriaGlobalId}
            className="flex-1 gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
          >
            {isTranslating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
            {isTranslating ? 'Traduciendo y guardando...' : 'Traducir y Guardar'}
          </Button>
          <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Guardando...' : 'Guardar sin traducir'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-gray-950 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Vista previa</DialogTitle>
          </DialogHeader>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}