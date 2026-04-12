'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { translateText } from '@/lib/translate'
import { Loader2, Languages } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' }
]

export default function NuevaCategoriaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    activo: true,
    order: 1
  })

  const translateToAllLanguages = async (text: string) => {
    const translations: Record<string, string> = { es: text }
    for (const lang of LANGUAGES) {
      try {
        translations[lang.code] = await translateText(text, lang.code)
      } catch (error) {
        console.error(`Error traduciendo a ${lang.code}:`, error)
        translations[lang.code] = text
      }
    }
    return translations
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre en español es obligatorio')
      return
    }

    setIsLoading(true)
    toast.loading('Traduciendo a 4 idiomas...', { id: 'saving' })
    
    try {
      const translations = await translateToAllLanguages(formData.nombre)
      
      await addDoc(collection(db, 'categorias_globales'), {
        nombre: formData.nombre,
        nameEn: translations.en || formData.nombre,
        nameFr: translations.fr || formData.nombre,
        nameDe: translations.de || formData.nombre,
        nameRu: translations.ru || formData.nombre,
        activo: formData.activo,
        order: formData.order,
        createdAt: new Date().toISOString()
      })
      
      toast.success('Categoría creada y traducida a 4 idiomas', { id: 'saving' })
      router.push('/admin/categorias')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear la categoría', { id: 'saving' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Nueva Categoría</CardTitle>
          <p className="text-sm text-gray-500">El nombre se traducirá automáticamente a Inglés, Francés, Alemán y Ruso</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nombre (español) *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                placeholder="Ej: Entradas"
              />
            </div>
            
            <div>
              <Label>Orden</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Activa</Label>
              <Switch
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-green-600 to-green-500">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Languages className="mr-2 h-4 w-4" />
                {isLoading ? 'Traduciendo...' : 'Guardar y traducir'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}