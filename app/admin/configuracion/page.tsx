'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Shield, 
  User, 
  Bell, 
  Globe, 
  Palette,
  ChevronRight,
  Loader2,
  Key,
  Moon,
  Sun,
  Upload,
  X,
  Eye,
  Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { getAuth, updateProfile } from 'firebase/auth'
import { app, db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { uploadImage } from '@/lib/firebase-services'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ConfiguracionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  
  // Estado para la portada
  const [portadaData, setPortadaData] = useState({
    portada: '',
    titulo: '',
    subtitulo: '',
    direccion: '',
    telefono: '',
    email: '',
    instagram: '',
    tiktok: '',
    whatsapp: ''
  })
  const [portadaFile, setPortadaFile] = useState<File | null>(null)
  const [portadaPreview, setPortadaPreview] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isSavingPortada, setIsSavingPortada] = useState(false)

  // Cargar configuración de Firestore
  useEffect(() => {
    const loadConfiguracion = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setPortadaData({
            portada: data.portada || '',
            titulo: data.titulo || 'Gavi-Club',
            subtitulo: data.subtitulo || 'Cócteles y picaderas',
            direccion: data.direccion || '',
            telefono: data.telefono || '',
            email: data.email || '',
            instagram: data.instagram || '',
            tiktok: data.tiktok || '',
            whatsapp: data.whatsapp || ''
          })
        }
      } catch (error) {
        console.error('Error cargando configuración:', error)
      }
    }
    
    loadConfiguracion()
    
    const auth = getAuth(app)
    const user = auth.currentUser
    if (user) {
      setAdminName(user.displayName || 'Administrador')
      setAdminEmail(user.email || 'admin@tipicocaribeno.com')
    }
    
    const savedDarkMode = localStorage.getItem('admin-dark-mode')
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true'
      setDarkMode(isDark)
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    const savedNotifications = localStorage.getItem('admin-notifications')
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === 'true')
    }
  }, [])

  const handleUpdateProfile = async () => {
    if (!adminName.trim()) {
      toast.error('El nombre no puede estar vacío')
      return
    }

    setIsLoading(true)
    toast.loading('Actualizando perfil...', { id: 'update-profile' })
    
    try {
      const auth = getAuth(app)
      const user = auth.currentUser
      if (user) {
        await updateProfile(user, { displayName: adminName })
        toast.success('Perfil actualizado correctamente', { id: 'update-profile' })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar el perfil', { id: 'update-profile' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked)
    localStorage.setItem('admin-dark-mode', String(checked))
    if (checked) {
      document.documentElement.classList.add('dark')
      toast.success('Modo oscuro activado')
    } else {
      document.documentElement.classList.remove('dark')
      toast.success('Modo claro activado')
    }
  }

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked)
    localStorage.setItem('admin-notifications', String(checked))
    toast.success(checked ? 'Notificaciones activadas' : 'Notificaciones desactivadas')
  }

  // Manejar cambio de imagen de portada
  const handlePortadaImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPortadaFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPortadaPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // Guardar configuración de portada
  const handleSavePortada = async () => {
    setIsSavingPortada(true)
    toast.loading('Guardando configuración...', { id: 'saving-portada' })
    
    try {
      let imagenUrl = portadaData.portada
      
      if (portadaFile) {
        const timestamp = Date.now()
        const cleanName = portadaFile.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        const path = `portada/${timestamp}_${cleanName}`
        imagenUrl = await uploadImage(portadaFile, path)
      }
      
      const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
      await updateDoc(docRef, {
        portada: imagenUrl,
        titulo: portadaData.titulo,
        subtitulo: portadaData.subtitulo,
        direccion: portadaData.direccion,
        telefono: portadaData.telefono,
        email: portadaData.email,
        instagram: portadaData.instagram,
        tiktok: portadaData.tiktok,
        whatsapp: portadaData.whatsapp,
        actualizado: new Date().toISOString()
      })
      
      setPortadaData(prev => ({ ...prev, portada: imagenUrl }))
      setPortadaFile(null)
      setPortadaPreview('')
      toast.success('Configuración guardada correctamente', { id: 'saving-portada' })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar la configuración', { id: 'saving-portada' })
    } finally {
      setIsSavingPortada(false)
    }
  }

  const configSections: { title: string; icon: any; color: string; bgColor: string; items: any[] }[] = [
    {
      title: 'Seguridad',
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      items: [
        {
          name: 'Cambiar contraseña',
          description: 'Actualiza tu contraseña de acceso al panel',
          action: () => router.push('/admin/configuracion/cambiar-password'),
          icon: Key,
          isSwitch: false
        }
      ]
    },
    {
      title: 'Preferencias',
      icon: Palette,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      items: [
        {
          name: 'Modo oscuro',
          description: 'Tema oscuro para el panel de administración',
          action: (checked: boolean) => handleDarkModeChange(checked),
          icon: darkMode ? Moon : Sun,
          isSwitch: true,
          value: darkMode
        },
        {
          name: 'Notificaciones',
          description: 'Recibir alertas del sistema y actualizaciones',
          action: (checked: boolean) => handleNotificationsChange(checked),
          icon: Bell,
          isSwitch: true,
          value: notifications
        }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-red-600/20 p-6 border border-blue-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Configuración</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
            Configuración del Panel
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gestiona la configuración de tu cuenta, portada y datos del negocio
          </p>
        </div>
      </div>

      {/* Sección de Portada */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <ImageIcon className="h-4 w-4 text-purple-400" />
            </div>
            Portada Principal
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configura la imagen y texto que aparecen en la página principal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vista previa de la portada actual */}
          <div>
            <Label className="text-gray-300 mb-2 block">Imagen actual</Label>
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
              {portadaData.portada ? (
                <img 
                  src={portadaData.portada} 
                  alt="Portada actual"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No hay imagen de portada
                </div>
              )}
            </div>
          </div>

          {/* Subir nueva imagen */}
          <div>
            <Label className="text-gray-300 mb-2 block">Cambiar imagen</Label>
            <div className="flex items-center gap-4">
              {portadaPreview ? (
                <div className="relative">
                  <img 
                    src={portadaPreview} 
                    alt="Preview" 
                    className="h-32 w-48 rounded-lg object-cover border-2 border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPortadaFile(null)
                      setPortadaPreview('')
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="absolute bottom-1 right-1 rounded-full bg-black/70 p-1 text-white"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Subir imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePortadaImageChange}
                  />
                </label>
              )}
              <p className="text-xs text-gray-500">Recomendado: 1920x1080px</p>
            </div>
          </div>

          {/* Título y subtítulo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Título principal</Label>
              <Input
                value={portadaData.titulo}
                onChange={(e) => setPortadaData(prev => ({ ...prev, titulo: e.target.value }))}
                className="mt-1 bg-gray-900 border-gray-700 text-white"
                placeholder="Ej: Gavi-Club"
              />
            </div>
            <div>
              <Label className="text-gray-300">Subtítulo</Label>
              <Input
                value={portadaData.subtitulo}
                onChange={(e) => setPortadaData(prev => ({ ...prev, subtitulo: e.target.value }))}
                className="mt-1 bg-gray-900 border-gray-700 text-white"
                placeholder="Ej: Cócteles y picaderas"
              />
            </div>
          </div>

          {/* Información del negocio */}
          <div className="border-t border-gray-800 pt-4 mt-2">
            <h3 className="text-white font-medium mb-4">Información del negocio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Dirección</Label>
                <Input
                  value={portadaData.direccion}
                  onChange={(e) => setPortadaData(prev => ({ ...prev, direccion: e.target.value }))}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Teléfono</Label>
                <Input
                  value={portadaData.telefono}
                  onChange={(e) => setPortadaData(prev => ({ ...prev, telefono: e.target.value }))}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input
                  value={portadaData.email}
                  onChange={(e) => setPortadaData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">WhatsApp</Label>
                <Input
                  value={portadaData.whatsapp}
                  onChange={(e) => setPortadaData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Instagram</Label>
                <Input
                  value={portadaData.instagram}
                  onChange={(e) => setPortadaData(prev => ({ ...prev, instagram: e.target.value }))}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">TikTok</Label>
                <Input
                  value={portadaData.tiktok}
                  onChange={(e) => setPortadaData(prev => ({ ...prev, tiktok: e.target.value }))}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSavePortada}
            disabled={isSavingPortada}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
          >
            {isSavingPortada && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar configuración
          </Button>
        </CardContent>
      </Card>

      {/* Perfil del Administrador */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <User className="h-4 w-4 text-blue-400" />
            </div>
            Perfil de Administrador
          </CardTitle>
          <CardDescription className="text-gray-400">
            Información de tu cuenta y datos personales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Nombre completo</Label>
              <Input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="mt-1 bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <Label className="text-gray-300">Correo electrónico</Label>
              <Input
                type="email"
                value={adminEmail}
                disabled
                className="mt-1 bg-gray-800 border-gray-700 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">El correo no se puede modificar</p>
            </div>
          </div>
          <Button
            onClick={handleUpdateProfile}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Actualizar perfil
          </Button>
        </CardContent>
      </Card>

      {/* Secciones de configuración */}
      {configSections.map((section, idx) => (
        <Card key={idx} className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className={`p-2 rounded-lg ${section.bgColor}`}>
                <section.icon className={`h-4 w-4 ${section.color}`} />
              </div>
              {section.title}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Opciones de {section.title.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {section.items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                className={`flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900/30 hover:bg-gray-900/50 transition-all duration-200 ${!item.isSwitch ? 'cursor-pointer' : ''}`}
                onClick={!item.isSwitch ? () => (item.action as () => void)() : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${section.bgColor}`}>
                    <item.icon className={`h-4 w-4 ${section.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                </div>
                {item.isSwitch ? (
                  <Switch
                    checked={item.value || false}
                    onCheckedChange={(checked) => (item.action as (checked: boolean) => void)(checked)}
                  />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Información del sistema */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Globe className="h-4 w-4 text-green-400" />
            </div>
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Versión del panel</span>
            <span className="text-white font-medium">v2.0.0</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Última actualización</span>
            <span className="text-white font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400">Entorno</span>
            <span className="text-white font-medium">Desarrollo</span>
          </div>
        </CardContent>
      </Card>

      {/* Modal de vista previa */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-gray-950 border-gray-800 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Vista previa de la imagen</DialogTitle>
          </DialogHeader>
          <img src={portadaPreview} alt="Preview" className="rounded-lg w-full" />
        </DialogContent>
      </Dialog>
    </div>
  )
}