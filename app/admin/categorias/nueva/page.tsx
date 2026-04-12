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
import { Loader2 } from 'lucide-react'

export default function NuevaCategoriaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    activo: true,
    order: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre en español es obligatorio')
      return
    }

    setIsLoading(true)
    toast.loading('Traduciendo y guardando...', { id: 'saving' })
    
    try {
      const translatedName = await translateText(formData.nombre, 'en')
      
      await addDoc(collection(db, 'categorias_globales'), {
        nombre: formData.nombre,
        nameEn: translatedName,
        activo: formData.activo,
        order: formData.order
      })
      
      toast.success('Categoría creada correctamente', { id: 'saving' })
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
          <p className="text-sm text-gray-500">El nombre se traducirá automáticamente al inglés usando Google Translate</p>
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
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Traduciendo y guardando...' : 'Guardar (traduce automáticamente)'}
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