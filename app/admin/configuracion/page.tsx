'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, Shield, User, Bell, Globe, Palette, ChevronRight, Loader2, Key, Moon, Sun,
  Upload, X, Eye, Image as ImageIcon, LayoutTemplate, Type, AlignLeft, Maximize2,
  Instagram, Facebook, MapPin, Phone, MessageCircle, Mail, Clock, Save,
  Monitor, MoveHorizontal, Gauge, Repeat, AlignCenter, AlignLeft as AlignLeftIcon, AlignRight,
  Calendar, Timer, Lock, LogOut
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
import { translateText } from '@/lib/translate'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Tipo para las traducciones del ticker
interface TickerTraducciones {
  es: string
  en: string
  fr: string
  de: string
  ru: string
}

export default function ConfiguracionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [activeTab, setActiveTab] = useState('horarios')
  const [isSaving, setIsSaving] = useState(false)

  // ============ CAMBIO DE CONTRASEÑA ============
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // ============ HORARIOS ============
  const [horarios, setHorarios] = useState({
    lunes: { apertura: '20:00', cierre: '02:30', cerrado: false },
    martes: { apertura: '20:00', cierre: '02:30', cerrado: false },
    miercoles: { apertura: '20:00', cierre: '02:30', cerrado: false },
    jueves: { apertura: '20:00', cierre: '02:30', cerrado: false },
    viernes: { apertura: '20:00', cierre: '03:00', cerrado: false },
    sabado: { apertura: '20:00', cierre: '03:00', cerrado: false },
    domingo: { apertura: '20:00', cierre: '03:00', cerrado: false }
  })

  // ============ LÍNEA INFORMATIVA ============
  const [tickerActivo, setTickerActivo] = useState(false)
  const [tickerTexto, setTickerTexto] = useState('')
  const [tickerColorTexto, setTickerColorTexto] = useState('#d1b275')
  const [tickerColorFondo, setTickerColorFondo] = useState('#000000')
  const [tickerTamanioLetra, setTickerTamanioLetra] = useState(14)
  const [tickerTipoLetra, setTickerTipoLetra] = useState('Arial')
  const [tickerVelocidad, setTickerVelocidad] = useState(10)
  const [tickerTiempoEntre, setTickerTiempoEntre] = useState(3)
  const [tickerAltura, setTickerAltura] = useState(40)
  const [tickerPosicion, setTickerPosicion] = useState<'top' | 'bottom'>('top')

  const fuentes = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New',
    'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Montserrat', 'Open Sans', 'Roboto',
    'Playfair Display', 'Poppins', 'Lato', 'Oswald', 'Raleway', 'Ubuntu', 'Nunito'
  ]

  const diasSemana = [
    { id: 'lunes', nombre: 'Lunes' },
    { id: 'martes', nombre: 'Martes' },
    { id: 'miercoles', nombre: 'Miércoles' },
    { id: 'jueves', nombre: 'Jueves' },
    { id: 'viernes', nombre: 'Viernes' },
    { id: 'sabado', nombre: 'Sábado' },
    { id: 'domingo', nombre: 'Domingo' }
  ]

  // Función para traducir el texto del ticker a todos los idiomas
  const translateTickerToAllLanguages = async (text: string): Promise<TickerTraducciones> => {
    const translations: TickerTraducciones = { 
      es: text, 
      en: '', 
      fr: '', 
      de: '', 
      ru: '' 
    }
    
    // Traducir a inglés
    try {
      translations.en = await translateText(text, 'en')
    } catch (error) {
      console.error('Error traduciendo a inglés:', error)
      translations.en = text
    }
    
    // Traducir a francés
    try {
      translations.fr = await translateText(text, 'fr')
    } catch (error) {
      console.error('Error traduciendo a francés:', error)
      translations.fr = text
    }
    
    // Traducir a alemán
    try {
      translations.de = await translateText(text, 'de')
    } catch (error) {
      console.error('Error traduciendo a alemán:', error)
      translations.de = text
    }
    
    // Traducir a ruso
    try {
      translations.ru = await translateText(text, 'ru')
    } catch (error) {
      console.error('Error traduciendo a ruso:', error)
      translations.ru = text
    }
    
    return translations
  }

  // Cargar configuración
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.horarios) {
            setHorarios(prev => ({ ...prev, ...data.horarios }))
          }
          setTickerActivo(data.tickerActivo || false)
          setTickerTexto(data.tickerTexto || '')
          setTickerColorTexto(data.tickerColorTexto || '#d1b275')
          setTickerColorFondo(data.tickerColorFondo || '#000000')
          setTickerTamanioLetra(data.tickerTamanioLetra || 14)
          setTickerTipoLetra(data.tickerTipoLetra || 'Arial')
          setTickerVelocidad(data.tickerVelocidad || 10)
          setTickerTiempoEntre(data.tickerTiempoEntre || 3)
          setTickerAltura(data.tickerAltura || 40)
          setTickerPosicion(data.tickerPosicion || 'top')
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
    toast.loading('Verificando contraseña...', { id: 'changing-pwd' })
    
    try {
      const auth = getAuth(app)
      const user = auth.currentUser
      if (!user || !user.email) throw new Error('No hay usuario logueado')
      
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      toast.loading('Actualizando contraseña...', { id: 'changing-pwd' })
      await updatePassword(user, newPassword)
      
      toast.success('Contraseña actualizada correctamente', { id: 'changing-pwd' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error('Error:', error)
      if (error.code === 'auth/wrong-password') {
        toast.error('Contraseña actual incorrecta', { id: 'changing-pwd' })
      } else {
        toast.error('Error al cambiar la contraseña', { id: 'changing-pwd' })
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSaveHorarios = async () => {
    setIsSaving(true)
    toast.loading('Guardando horarios...', { id: 'saving' })
    try {
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        horarios,
        updatedAt: new Date().toISOString()
      })
      toast.success('Horarios guardados', { id: 'saving' })
    } catch (error) {
      toast.error('Error al guardar', { id: 'saving' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTicker = async () => {
    if (!tickerTexto.trim()) {
      toast.error('Escribe un texto para la línea informativa')
      return
    }

    setIsSaving(true)
    toast.loading('Guardando y traduciendo línea informativa...', { id: 'saving' })
    
    try {
      let tickerTraducciones: TickerTraducciones = { 
        es: tickerTexto, 
        en: '', 
        fr: '', 
        de: '', 
        ru: '' 
      }
      
      // Traducir solo si hay texto
      if (tickerTexto.trim()) {
        tickerTraducciones = await translateTickerToAllLanguages(tickerTexto)
      }
      
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        tickerActivo,
        tickerTexto,
        tickerTextoEn: tickerTraducciones.en,
        tickerTextoFr: tickerTraducciones.fr,
        tickerTextoDe: tickerTraducciones.de,
        tickerTextoRu: tickerTraducciones.ru,
        tickerColorTexto,
        tickerColorFondo,
        tickerTamanioLetra,
        tickerTipoLetra,
        tickerVelocidad,
        tickerTiempoEntre,
        tickerAltura,
        tickerPosicion,
        updatedAt: new Date().toISOString()
      })
      
      toast.success('Línea informativa guardada y traducida', { id: 'saving' })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar', { id: 'saving' })
    } finally {
      setIsSaving(false)
    }
  }

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

  const tabs = [
    { id: 'horarios', label: '📅 Horarios', icon: Calendar },
    { id: 'ticker', label: '📢 Línea Informativa', icon: MoveHorizontal },
    { id: 'perfil', label: '👤 Perfil', icon: User },
    { id: 'seguridad', label: '🔒 Seguridad', icon: Shield }
  ]

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 p-6 border border-gold/30">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-gold" />
            <span className="text-xs font-medium text-gold uppercase tracking-wider">Configuración</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gold">Panel de Configuración</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona horarios, línea informativa y seguridad</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gold text-black'
                  : 'text-gray-400 hover:text-gold hover:bg-gold/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Panel Horarios */}
      {activeTab === 'horarios' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-gold" />
              Horario de Apertura
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configura los horarios de cada día de la semana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {diasSemana.map((dia) => {
              const horario = horarios[dia.id as keyof typeof horarios]
              return (
                <div key={dia.id} className="border-b border-gray-800 pb-4 last:border-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-28">
                      <h3 className="text-white font-medium">{dia.nombre}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={!horario.cerrado}
                        onCheckedChange={(checked) => setHorarios(prev => ({
                          ...prev,
                          [dia.id]: { ...prev[dia.id as keyof typeof prev], cerrado: !checked }
                        }))}
                      />
                      <span className="text-sm text-gray-400">
                        {horario.cerrado ? 'Cerrado' : 'Abierto'}
                      </span>
                    </div>
                    {!horario.cerrado && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gold" />
                          <Input
                            type="time"
                            value={horario.apertura}
                            onChange={(e) => setHorarios(prev => ({
                              ...prev,
                              [dia.id]: { ...prev[dia.id as keyof typeof prev], apertura: e.target.value }
                            }))}
                            className="w-28 bg-gray-900 border-gray-700 text-white"
                          />
                          <span className="text-white">-</span>
                          <Input
                            type="time"
                            value={horario.cierre}
                            onChange={(e) => setHorarios(prev => ({
                              ...prev,
                              [dia.id]: { ...prev[dia.id as keyof typeof prev], cierre: e.target.value }
                            }))}
                            className="w-28 bg-gray-900 border-gray-700 text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <Button onClick={handleSaveHorarios} disabled={isSaving} className="bg-gold text-black hover:bg-gold-dark">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar horarios
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Panel Línea Informativa */}
      {activeTab === 'ticker' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MoveHorizontal className="h-5 w-5 text-gold" />
              Línea Informativa (Ticker)
            </CardTitle>
            <CardDescription className="text-gray-400">
              El texto se desplaza de derecha a izquierda. Cuando sale completamente, espera y vuelve a empezar desde el principio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Activar línea informativa</Label>
                <p className="text-sm text-gray-400">Muestra el ticker debajo de la barra de navegación</p>
              </div>
              <Switch checked={tickerActivo} onCheckedChange={setTickerActivo} />
            </div>

            {tickerActivo && (
              <>
                <div>
                  <Label className="text-white">Texto (Español)</Label>
                  <Textarea 
                    value={tickerTexto} 
                    onChange={(e) => setTickerTexto(e.target.value)} 
                    rows={2} 
                    className="mt-1 bg-gray-900 border-gray-700 text-white"
                    placeholder="Ej: 🍸 Envío gratis desde 20€ | 🍹 Happy Hour 18-20h | 🎵 Música en vivo"
                  />
                  <p className="text-xs text-gray-500 mt-1">Se traducirá automáticamente a Inglés, Francés, Alemán y Ruso</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label className="text-white flex items-center gap-2">
                      <Type className="h-4 w-4" /> Tamaño de letra (px)
                    </Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="10" max="48" value={tickerTamanioLetra} onChange={(e) => setTickerTamanioLetra(parseInt(e.target.value))} className="flex-1" />
                      <span className="text-gray-400 w-12">{tickerTamanioLetra}px</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <AlignLeftIcon className="h-4 w-4" /> Tipo de letra
                    </Label>
                    <select 
                      value={tickerTipoLetra} 
                      onChange={(e) => setTickerTipoLetra(e.target.value)}
                      className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white"
                    >
                      {fuentes.map(fuente => (
                        <option key={fuente} value={fuente} style={{ fontFamily: fuente }}>{fuente}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Gauge className="h-4 w-4" /> Velocidad (segundos)
                    </Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="3" max="30" step="1" value={tickerVelocidad} onChange={(e) => setTickerVelocidad(parseInt(e.target.value))} className="flex-1" />
                      <span className="text-gray-400 w-12">{tickerVelocidad}s</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Tiempo que tarda en cruzar la pantalla</p>
                  </div>
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Timer className="h-4 w-4" /> Pausa entre ciclos (segundos)
                    </Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="1" max="20" step="1" value={tickerTiempoEntre} onChange={(e) => setTickerTiempoEntre(parseInt(e.target.value))} className="flex-1" />
                      <span className="text-gray-400 w-12">{tickerTiempoEntre}s</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Tiempo de espera después de desaparecer antes de volver a aparecer</p>
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
                      <Button type="button" variant={tickerPosicion === 'top' ? 'default' : 'outline'} className="flex-1" onClick={() => setTickerPosicion('top')}>Arriba</Button>
                      <Button type="button" variant={tickerPosicion === 'bottom' ? 'default' : 'outline'} className="flex-1" onClick={() => setTickerPosicion('bottom')}>Abajo</Button>
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
                    style={{ backgroundColor: tickerColorFondo, height: `${tickerAltura}px` }}
                  >
                    <div className="h-full flex items-center">
                      <div 
                        className="whitespace-nowrap"
                        style={{
                          animation: `marquee ${tickerVelocidad}s linear forwards`,
                          fontFamily: tickerTipoLetra,
                          fontSize: `${tickerTamanioLetra}px`,
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

            <Button onClick={handleSaveTicker} disabled={isSaving} className="bg-gold text-black hover:bg-gold-dark">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar y traducir línea informativa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Panel Perfil */}
      {activeTab === 'perfil' && (
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
      )}

      {/* Panel Seguridad - Cambiar Contraseña */}
      {activeTab === 'seguridad' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-gold" />
              Cambiar Contraseña
            </CardTitle>
            <CardDescription className="text-gray-400">
              Actualiza tu contraseña de acceso al panel de administración
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
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label className="text-gray-300">Nueva contraseña</Label>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="mt-1 bg-gray-900" 
                placeholder="•••••••• (mínimo 6 caracteres)"
              />
            </div>
            <div>
              <Label className="text-gray-300">Confirmar nueva contraseña</Label>
              <Input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="mt-1 bg-gray-900" 
                placeholder="••••••••"
              />
            </div>
            <Button 
              onClick={handleChangePassword} 
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword} 
              className="bg-gold text-black hover:bg-gold-dark"
            >
              {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Lock className="mr-2 h-4 w-4" />
              Cambiar contraseña
            </Button>
          </CardContent>
        </Card>
      )}

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}