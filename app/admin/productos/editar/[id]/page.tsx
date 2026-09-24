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
import { translateToAllLanguages } from '@/lib/translate'
import { toast } from 'sonner'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [categories, setCategories] = useState<CategoriaGlobal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
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
        descripcion: productoData.descripcion || '',
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
    setImageError(null)
    const file = e.target.files?.[0]
    if (!file) return

    // Validar formato permitido: JPG, JPEG o PNG
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setImageError(`El formato "${file.type || 'desconocido'}" no está permitido. Solo se aceptan JPG y PNG.`)
      setImageFile(null)
      setImagePreview(null)
      e.target.value = ''
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.precio || !formData.categoriaGlobalId) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setIsSaving(true)
    toast.loading('Guardando y traduciendo a 4 idiomas...', { id: 'saving' })

    try {
      const [nameTranslations, descTranslations] = await Promise.all([
        translateToAllLanguages(formData.nombre),
        formData.descripcion ? translateToAllLanguages(formData.descripcion) : Promise.resolve({ es: '', en: '', fr: '', de: '', ru: '' })
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
        nameEn: nameTranslations.en || formData.nombre,
        nameFr: nameTranslations.fr || formData.nombre,
        nameDe: nameTranslations.de || formData.nombre,
        nameRu: nameTranslations.ru || formData.nombre,
        descripcion: formData.descripcion,
        descriptionEn: descTranslations.en || formData.descripcion,
        descriptionFr: descTranslations.fr || formData.descripcion,
        descriptionDe: descTranslations.de || formData.descripcion,
        descriptionRu: descTranslations.ru || formData.descripcion,
        precio: parseFloat(formData.precio),
        categoriaGlobalId: formData.categoriaGlobalId,
        activo: formData.activo,
        destacado: formData.destacado,
        imagenUrl: imagenUrl,
      })

      toast.success('Producto actualizado y traducido a 4 idiomas', { id: 'saving' })
      router.push('/admin/productos')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Error al actualizar el producto', { id: 'saving' })
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
            <p className="text-sm text-gray-400 mb-3">Sube una foto del producto</p>

            {/* Etiqueta verde: formatos permitidos */}
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/40">
              <p className="text-xs text-green-400">
                ✅ <strong>Imágenes permitidas:</strong> JPG y PNG.
              </p>
            </div>

            {/* Cartel rojo: formato incorrecto */}
            {imageError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                <p className="text-xs text-red-400">
                  ⛔ <strong>Formato no válido.</strong> {imageError}
                </p>
              </div>
            )}

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
                      setImageError(null)
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Subir</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-950/50">
          <CardContent className="space-y-4 p-4">
            <div>
              <Label className="text-white">🇪🇸 Nombre (Español) *</Label>
              <Input
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="mt-1 bg-gray-900 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Se traducirá automáticamente a 4 idiomas</p>
            </div>

            <div>
              <Label className="text-white">🇪🇸 Descripción</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
                className="mt-1 bg-gray-900 border-gray-700 text-white"
                placeholder="Descripción del producto"
              />
              <p className="text-xs text-gray-500 mt-1">Se traducirá automáticamente a 4 idiomas</p>
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

        <Button type="submit" disabled={isSaving} className="w-full bg-gradient-to-r from-green-600 to-green-500">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Languages className="mr-2 h-4 w-4" />
          {isSaving ? 'Guardando y traduciendo...' : 'Guardar y traducir'}
        </Button>
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