'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Eye, Loader2 } from 'lucide-react'
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
import { getCategoriasActivasGlobales, createProducto, uploadImage, type CategoriaGlobal } from '@/lib/firebase-services'
import { translateText } from '@/lib/translate'
import { toast } from 'sonner'

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoriaGlobal[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoriaGlobalId: '',
    activo: true,
    destacado: false,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const cats = await getCategoriasActivasGlobales()
      setCategories(cats)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Error al cargar categorías')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.precio || !formData.categoriaGlobalId) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setIsSaving(true)
    toast.loading('Traduciendo y guardando...', { id: 'saving' })

    try {
      const [translatedName, translatedDescription] = await Promise.all([
        translateText(formData.nombre, 'en'),
        formData.descripcion ? translateText(formData.descripcion, 'en') : Promise.resolve('')
      ])
      
      let imagenUrl = null
      if (imageFile) {
        const timestamp = Date.now()
        const cleanName = formData.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        const path = `productos/${timestamp}_${cleanName}`
        imagenUrl = await uploadImage(imageFile, path)
      }

      await createProducto({
        nombre: formData.nombre,
        nameEn: translatedName,
        descripcion: formData.descripcion,
        descriptionEn: translatedDescription,
        precio: parseFloat(formData.precio),
        categoriaGlobalId: formData.categoriaGlobalId,
        activo: formData.activo,
        destacado: formData.destacado,
        imagenUrl: imagenUrl,
        orden: Date.now(),
      })

      toast.success('Producto creado correctamente', { id: 'saving' })
      router.push('/admin/productos')
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Error al crear el producto', { id: 'saving' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-white">Nuevo Producto</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-gray-800 bg-gray-950/50">
          <CardContent className="p-6">
            <Label className="text-white">Imagen del producto</Label>
            <p className="text-sm text-gray-400 mb-4">Sube una foto del producto</p>
            <div className="flex items-center gap-6">
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-28 w-28 rounded-lg object-cover border-2 border-blue-500"
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    Ver
                  </Button>
                </div>
              ) : (
                <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Subir</span>
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
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">🇪🇸 Nombre (Español) *</Label>
              <Input
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="mt-1 bg-gray-900 border-gray-700 text-white"
                placeholder="Ej: Mojito"
              />
              <p className="text-xs text-gray-500 mt-1">Se traducirá automáticamente al inglés</p>
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
              <p className="text-xs text-gray-500 mt-1">Se traducirá automáticamente al inglés</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Precio (€) *</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                  placeholder="8.50"
                />
              </div>
              <div>
                <Label className="text-white">Categoría *</Label>
                <select
                  required
                  value={formData.categoriaGlobalId}
                  onChange={(e) => setFormData({ ...formData, categoriaGlobalId: e.target.value })}
                  className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white mt-1 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <div className="flex items-center justify-between flex-1 rounded-lg border border-gray-800 p-4">
                <div>
                  <Label className="text-white">Disponible</Label>
                  <p className="text-xs text-gray-400">Visible para clientes</p>
                </div>
                <Switch
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
              </div>
              <div className="flex items-center justify-between flex-1 rounded-lg border border-gray-800 p-4">
                <div>
                  <Label className="text-white">Destacado</Label>
                  <p className="text-xs text-gray-400">Aparece en sugerencias ⭐</p>
                </div>
                <Switch
                  checked={formData.destacado}
                  onCheckedChange={(checked) => setFormData({ ...formData, destacado: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Traduciendo y guardando...' : 'Guardar producto'}
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