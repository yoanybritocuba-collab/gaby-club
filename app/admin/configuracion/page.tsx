'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, Shield, User, Bell, Globe, Palette, ChevronRight, Loader2, Key, Moon, Sun,
  Upload, X, Eye, Image as ImageIcon, LayoutTemplate, Type, AlignLeft, Maximize2,
  Instagram, Facebook, MapPin, Phone, MessageCircle, Mail, Clock, Save,
  Monitor, MoveHorizontal, Gauge, Repeat, AlignCenter, AlignLeft as AlignLeftIcon, AlignRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { getAuth, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { app, db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { uploadImage } from '@/lib/firebase-services'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ConfiguracionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  
  // ============ LÍNEA INFORMATIVA ============
  const [tickerActivo, setTickerActivo] = useState(false)
  const [tickerTexto, setTickerTexto] = useState('')
  const [tickerColorTexto, setTickerColorTexto] = useState('#d1b275')
  const [tickerColorFondo, setTickerColorFondo] = useState('#000000')
  const [tickerVelocidad, setTickerVelocidad] = useState(15)
  const [tickerAltura, setTickerAltura] = useState(40)
  const [tickerPosicion, setTickerPosicion] = useState<'top' | 'bottom'>('top')
  const [isSavingTicker, setIsSavingTicker] = useState(false)

  // ============ INFORMACIÓN DEL NEGOCIO ============
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [isSavingInfo, setIsSavingInfo] = useState(false)

  // ============ CAMBIAR CONTRASEÑA ============
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Cargar configuración
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setTickerActivo(data.tickerActivo || false)
          setTickerTexto(data.tickerTexto || '🍸 Envío gratis desde 20€ | 🍹 Happy Hour 18-20h | 🎵 Música en vivo los viernes')
          setTickerColorTexto(data.tickerColorTexto || '#d1b275')
          setTickerColorFondo(data.tickerColorFondo || '#000000')
          setTickerVelocidad(data.tickerVelocidad || 15)
          setTickerAltura(data.tickerAltura || 40)
          setTickerPosicion(data.tickerPosicion || 'top')
          setDireccion(data.direccion || '')
          setTelefono(data.telefono || '')
          setWhatsapp(data.whatsapp || '')
          setEmail(data.email || '')
          setInstagram(data.instagram || '')
          setFacebook(data.facebook || '')
          setTiktok(data.tiktok || '')
        }
      } catch (error) {
        console.error('Error cargando configuración:', error)
      }
    }
    loadConfig()
    
    const auth = getAuth(app)
    const user = auth.currentUser
    if (user) {
      setAdminName(user.displayName || 'Administrador')
      setAdminEmail(user.email || 'admin@gaviclub.com')
    }
  }, [])

  // Guardar línea informativa
  const handleSaveTicker = async () => {
    setIsSavingTicker(true)
    toast.loading('Guardando línea informativa...', { id: 'saving-ticker' })
    try {
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        tickerActivo,
        tickerTexto,
        tickerColorTexto,
        tickerColorFondo,
        tickerVelocidad,
        tickerAltura,
        tickerPosicion,
        updatedAt: new Date().toISOString()
      })
      toast.success('Línea informativa guardada', { id: 'saving-ticker' })
    } catch (error) {
      toast.error('Error al guardar', { id: 'saving-ticker' })
    } finally {
      setIsSavingTicker(false)
    }
  }

  // Guardar información del negocio
  const handleSaveInfo = async () => {
    setIsSavingInfo(true)
    toast.loading('Guardando información...', { id: 'saving-info' })
    try {
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        direccion, telefono, whatsapp, email, instagram, facebook, tiktok,
        updatedAt: new Date().toISOString()
      })
      toast.success('Información guardada', { id: 'saving-info' })
    } catch (error) {
      toast.error('Error al guardar', { id: 'saving-info' })
    } finally {
      setIsSavingInfo(false)
    }
  }

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Completa todos los campos')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden')
      return
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsChangingPassword(true)
    toast.loading('Cambiando contraseña...', { id: 'changing-password' })
    
    try {
      const auth = getAuth(app)
      const user = auth.currentUser
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword)
        await reauthenticateWithCredential(user, credential)
        await updatePassword(user, newPassword)
        toast.success('Contraseña actualizada correctamente', { id: 'changing-password' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error: any) {
      console.error('Error:', error)
      if (error.code === 'auth/wrong-password') {
        toast.error('Contraseña actual incorrecta', { id: 'changing-password' })
      } else {
        toast.error('Error al cambiar la contraseña', { id: 'changing-password' })
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Actualizar perfil
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
        toast.success('Perfil actualizado', { id: 'update-profile' })
      }
    } catch (error) {
      toast.error('Error al actualizar', { id: 'update-profile' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 p-6 border border-gold/30">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-gold" />
            <span className="text-xs font-medium text-gold uppercase tracking-wider">Configuración</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gold">Panel de Configuración</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona la línea informativa y los datos del negocio</p>
        </div>
      </div>

      {/* Sección Línea Informativa */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MoveHorizontal className="h-5 w-5 text-gold" />
            Línea Informativa (Ticker)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configura la línea que se desplaza de extremo a extremo de la pantalla
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div>
              <Label className="text-white font-medium">Activar línea informativa</Label>
              <p className="text-sm text-gray-400">Muestra el ticker en la parte superior o inferior</p>
            </div>
            <Switch checked={tickerActivo} onCheckedChange={setTickerActivo} />
          </div>

          {tickerActivo && (
            <>
              <div>
                <Label className="text-white">Texto</Label>
                <Textarea 
                  value={tickerTexto} 
                  onChange={(e) => setTickerTexto(e.target.value)} 
                  rows={2} 
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                  placeholder="Ej: 🍸 Envío gratis desde 20€ | 🍹 Happy Hour 18-20h"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Color del texto</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={tickerColorTexto} onChange={(e) => setTickerColorTexto(e.target.value)} className="h-10 w-10 rounded border border-gray-700 cursor-pointer" />
                    <Input value={tickerColorTexto} onChange={(e) => setTickerColorTexto(e.target.value)} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Color de fondo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={tickerColorFondo} onChange={(e) => setTickerColorFondo(e.target.value)} className="h-10 w-10 rounded border border-gray-700 cursor-pointer" />
                    <Input value={tickerColorFondo} onChange={(e) => setTickerColorFondo(e.target.value)} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Velocidad (segundos)</Label>
                  <div className="flex items-center gap-4 mt-1">
                    <input type="range" min="5" max="30" step="1" value={tickerVelocidad} onChange={(e) => setTickerVelocidad(parseInt(e.target.value))} className="flex-1" />
                    <span className="text-gray-400 w-12">{tickerVelocidad}s</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tiempo que tarda en cruzar la pantalla</p>
                </div>
                <div>
                  <Label className="text-white">Altura de la línea (px)</Label>
                  <div className="flex items-center gap-4 mt-1">
                    <input type="range" min="24" max="80" step="2" value={tickerAltura} onChange={(e) => setTickerAltura(parseInt(e.target.value))} className="flex-1" />
                    <span className="text-gray-400 w-12">{tickerAltura}px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-white">Posición</Label>
                  <div className="flex gap-2 mt-1">
                    <Button 
                      type="button" 
                      variant={tickerPosicion === 'top' ? 'default' : 'outline'} 
                      className="flex-1" 
                      onClick={() => setTickerPosicion('top')}
                    >
                      Arriba
                    </Button>
                    <Button 
                      type="button" 
                      variant={tickerPosicion === 'bottom' ? 'default' : 'outline'} 
                      className="flex-1" 
                      onClick={() => setTickerPosicion('bottom')}
                    >
                      Abajo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Vista previa en vivo */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="h-4 w-4 text-green-400" />
                  <Label className="text-white font-medium">Vista previa en vivo</Label>
                </div>
                <div 
                  className="w-full overflow-hidden rounded-lg" 
                  style={{ 
                    backgroundColor: tickerColorFondo, 
                    height: `${tickerAltura}px`
                  }}
                >
                  <div className="h-full flex items-center">
                    <div 
                      className="whitespace-nowrap animate-marquee"
                      style={{ 
                        animationDuration: `${tickerVelocidad}s`,
                        color: tickerColorTexto,
                        display: 'inline-block',
                        padding: '0 20px'
                      }}
                    >
                      {tickerTexto || "Escribe un texto para ver la vista previa..."}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <Button onClick={handleSaveTicker} disabled={isSavingTicker} className="bg-gold text-black hover:bg-gold-dark">
            {isSavingTicker && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar línea informativa
          </Button>
        </CardContent>
      </Card>

      {/* Sección Información del Negocio */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Globe className="h-5 w-5 text-gold" />
            Información del Negocio
          </CardTitle>
          <CardDescription className="text-gray-400">
            Datos de contacto y redes sociales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Dirección</Label>
              <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} className="mt-1 bg-gray-900" />
            </div>
            <div>
              <Label className="text-gray-300">Teléfono</Label>
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1 bg-gray-900" />
            </div>
            <div>
              <Label className="text-gray-300">WhatsApp</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="mt-1 bg-gray-900" placeholder="+34634492023" />
            </div>
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-gray-900" />
            </div>
            <div>
              <Label className="text-gray-300">Instagram</Label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="mt-1 bg-gray-900" placeholder="@usuario" />
            </div>
            <div>
              <Label className="text-gray-300">Facebook</Label>
              <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="mt-1 bg-gray-900" />
            </div>
            <div>
              <Label className="text-gray-300">TikTok</Label>
              <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} className="mt-1 bg-gray-900" />
            </div>
          </div>
          <Button onClick={handleSaveInfo} disabled={isSavingInfo} className="bg-gold text-black hover:bg-gold-dark">
            {isSavingInfo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar información
          </Button>
        </CardContent>
      </Card>

      {/* Sección Perfil de Administrador */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-gold" />
            Perfil de Administrador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Nombre</Label>
              <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="mt-1 bg-gray-900" />
            </div>
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input value={adminEmail} disabled className="mt-1 bg-gray-800 text-gray-400 cursor-not-allowed" />
            </div>
          </div>
          <Button onClick={handleUpdateProfile} disabled={isLoading} className="bg-gold text-black hover:bg-gold-dark">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Actualizar perfil
          </Button>
        </CardContent>
      </Card>

      {/* Sección Cambiar Contraseña */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Key className="h-5 w-5 text-gold" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription className="text-gray-400">
            Actualiza tu contraseña de acceso al panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Contraseña actual</Label>
            <Input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              className="mt-1 bg-gray-900" 
            />
          </div>
          <div>
            <Label className="text-gray-300">Nueva contraseña</Label>
            <Input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="mt-1 bg-gray-900" 
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <Label className="text-gray-300">Confirmar nueva contraseña</Label>
            <Input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="mt-1 bg-gray-900" 
            />
          </div>
          <Button onClick={handleChangePassword} disabled={isChangingPassword} className="bg-gold text-black hover:bg-gold-dark">
            {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cambiar contraseña
          </Button>
        </CardContent>
      </Card>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation-name: marquee;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  )
}