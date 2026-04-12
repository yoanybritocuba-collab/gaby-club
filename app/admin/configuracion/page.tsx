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
import { toast } from 'sonner'
import { getAuth, updateProfile } from 'firebase/auth'
import { app, db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { uploadImage } from '@/lib/firebase-services'
import { translateToAllLanguages } from '@/lib/translate'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ConfiguracionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  
  // Portada Principal
  const [portadaData, setPortadaData] = useState({
    portada: '', 
    titulo: '', 
    subtitulo: '', 
    tituloEn: '', tituloFr: '', tituloDe: '', tituloRu: '',
    subtituloEn: '', subtituloFr: '', subtituloDe: '', subtituloRu: '',
    direccion: '', telefono: '', email: '', instagram: '', tiktok: '', whatsapp: ''
  })
  const [portadaFile, setPortadaFile] = useState<File | null>(null)
  const [portadaPreview, setPortadaPreview] = useState('')
  const [showPortadaPreview, setShowPortadaPreview] = useState(false)
  const [isSavingPortada, setIsSavingPortada] = useState(false)

  // Carta
  const [cartaTitulo, setCartaTitulo] = useState('La Carta')
  const [cartaImagen, setCartaImagen] = useState('')
  const [cartaImagenFile, setCartaImagenFile] = useState<File | null>(null)
  const [cartaImagenPreview, setCartaImagenPreview] = useState('')
  const [showCartaPreview, setShowCartaPreview] = useState(false)
  const [isSavingCarta, setIsSavingCarta] = useState(false)

  // Línea informativa
  const [lineaActiva, setLineaActiva] = useState(false)
  const [lineaTexto, setLineaTexto] = useState('')
  const [lineaColorTexto, setLineaColorTexto] = useState('#ffffff')
  const [lineaColorFondo, setLineaColorFondo] = useState('#000000')
  const [lineaTamanioLetra, setLineaTamanioLetra] = useState(16)
  const [lineaTipoLetra, setLineaTipoLetra] = useState('Arial')
  const [lineaVelocidad, setLineaVelocidad] = useState(10)
  const [lineaTiempoEntre, setLineaTiempoEntre] = useState(2)
  const [lineaAncho, setLineaAncho] = useState(100)
  const [lineaPosicion, setLineaPosicion] = useState<'left' | 'center' | 'right'>('center')

  // Logo y nombre web
  const [logoUrl, setLogoUrl] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [showLogoPreview, setShowLogoPreview] = useState(false)
  const [isSavingLogo, setIsSavingLogo] = useState(false)
  const [nombreWeb, setNombreWeb] = useState('')
  const [logoTamaño, setLogoTamaño] = useState('medio')
  const [logoPosicion, setLogoPosicion] = useState('izquierda')

  // Footer
  const [footerBgColor, setFooterBgColor] = useState('#1a1a1a')
  const [footerTextColor, setFooterTextColor] = useState('#9ca3af')

  const fuentes = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Montserrat', 'Open Sans', 'Roboto']

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setPortadaData({
            portada: data.portada || '', 
            titulo: data.titulo || "Gaby's Club", 
            subtitulo: data.subtitulo || 'Los mejores cócteles de la ciudad',
            tituloEn: data.tituloEn || '', tituloFr: data.tituloFr || '', tituloDe: data.tituloDe || '', tituloRu: data.tituloRu || '',
            subtituloEn: data.subtituloEn || '', subtituloFr: data.subtituloFr || '', subtituloDe: data.subtituloDe || '', subtituloRu: data.subtituloRu || '',
            direccion: data.direccion || '', telefono: data.telefono || '', email: data.email || '',
            instagram: data.instagram || '', tiktok: data.tiktok || '', whatsapp: data.whatsapp || ''
          })
          setCartaTitulo(data.cartaTitulo || 'La Carta')
          setCartaImagen(data.cartaImagen || '')
          setLineaActiva(data.lineaActiva || false)
          setLineaTexto(data.lineaTexto || '')
          setLineaColorTexto(data.lineaColorTexto || '#ffffff')
          setLineaColorFondo(data.lineaColorFondo || '#000000')
          setLineaTamanioLetra(data.lineaTamanioLetra || 16)
          setLineaTipoLetra(data.lineaTipoLetra || 'Arial')
          setLineaVelocidad(data.lineaVelocidad || 10)
          setLineaTiempoEntre(data.lineaTiempoEntre || 2)
          setLineaAncho(data.lineaAncho || 100)
          setLineaPosicion(data.lineaPosicion || 'center')
          setLogoUrl(data.logoUrl || '/logo.png')
          setNombreWeb(data.nombreWeb || "Gaby's Club")
          setLogoTamaño(data.logoTamaño || 'medio')
          setLogoPosicion(data.logoPosicion || 'izquierda')
          setFooterBgColor(data.footerBgColor || '#1a1a1a')
          setFooterTextColor(data.footerTextColor || '#9ca3af')
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
    
    const savedDarkMode = localStorage.getItem('admin-dark-mode')
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true'
      setDarkMode(isDark)
      if (isDark) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    }
    
    const savedNotifications = localStorage.getItem('admin-notifications')
    if (savedNotifications !== null) setNotifications(savedNotifications === 'true')
  }, [])

  const handleUpdateProfile = async () => {
    if (!adminName.trim()) { toast.error('El nombre no puede estar vacío'); return }
    setIsLoading(true)
    toast.loading('Actualizando perfil...', { id: 'update-profile' })
    try {
      const auth = getAuth(app)
      const user = auth.currentUser
      if (user) {
        await updateProfile(user, { displayName: adminName })
        toast.success('Perfil actualizado', { id: 'update-profile' })
      }
    } catch (error) { toast.error('Error al actualizar', { id: 'update-profile' }) }
    finally { setIsLoading(false) }
  }

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked)
    localStorage.setItem('admin-dark-mode', String(checked))
    if (checked) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked)
    localStorage.setItem('admin-notifications', String(checked))
  }

  const handlePortadaImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPortadaFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPortadaPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleCartaImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCartaImagenFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setCartaImagenPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSavePortada = async () => {
    setIsSavingPortada(true)
    toast.loading('Guardando y traduciendo portada...', { id: 'saving' })
    try {
      let imagenUrl = portadaData.portada
      if (portadaFile) {
        imagenUrl = await uploadImage(portadaFile, `portada/${Date.now()}_${portadaFile.name}`)
      }
      
      // Traducir título y subtítulo a 4 idiomas
      const tituloTranslations = await translateToAllLanguages(portadaData.titulo)
      const subtituloTranslations = await translateToAllLanguages(portadaData.subtitulo)
      
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        portada: imagenUrl, 
        titulo: portadaData.titulo, 
        subtitulo: portadaData.subtitulo,
        tituloEn: tituloTranslations.en || portadaData.titulo,
        tituloFr: tituloTranslations.fr || portadaData.titulo,
        tituloDe: tituloTranslations.de || portadaData.titulo,
        tituloRu: tituloTranslations.ru || portadaData.titulo,
        subtituloEn: subtituloTranslations.en || portadaData.subtitulo,
        subtituloFr: subtituloTranslations.fr || portadaData.subtitulo,
        subtituloDe: subtituloTranslations.de || portadaData.subtitulo,
        subtituloRu: subtituloTranslations.ru || portadaData.subtitulo,
        direccion: portadaData.direccion, telefono: portadaData.telefono, email: portadaData.email,
        instagram: portadaData.instagram, tiktok: portadaData.tiktok, whatsapp: portadaData.whatsapp
      })
      toast.success('Portada guardada y traducida a 4 idiomas', { id: 'saving' })
      setPortadaFile(null); setPortadaPreview('')
    } catch (error) { toast.error('Error', { id: 'saving' }) }
    finally { setIsSavingPortada(false) }
  }

  const handleSaveCarta = async () => {
    setIsSavingCarta(true)
    toast.loading('Guardando y traduciendo...', { id: 'saving-carta' })
    try {
      let imagenUrl = cartaImagen
      if (cartaImagenFile) {
        imagenUrl = await uploadImage(cartaImagenFile, `carta/${Date.now()}_${cartaImagenFile.name}`)
      }
      
      const titleTranslations = await translateToAllLanguages(cartaTitulo)
      
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        cartaTitulo: cartaTitulo,
        cartaTituloEn: titleTranslations.en || cartaTitulo,
        cartaTituloFr: titleTranslations.fr || cartaTitulo,
        cartaTituloDe: titleTranslations.de || cartaTitulo,
        cartaTituloRu: titleTranslations.ru || cartaTitulo,
        cartaImagen: imagenUrl,
        lineaActiva, lineaTexto, lineaColorTexto, lineaColorFondo,
        lineaTamanioLetra, lineaTipoLetra, lineaVelocidad, lineaTiempoEntre,
        lineaAncho, lineaPosicion
      })
      toast.success('Carta guardada y traducida', { id: 'saving-carta' })
      setCartaImagenFile(null); setCartaImagenPreview('')
    } catch (error) { toast.error('Error', { id: 'saving-carta' }) }
    finally { setIsSavingCarta(false) }
  }

  const handleSaveLogo = async () => {
    setIsSavingLogo(true)
    toast.loading('Guardando logo...', { id: 'saving-logo' })
    try {
      let imagenUrl = logoUrl
      if (logoFile) {
        imagenUrl = await uploadImage(logoFile, `logo/${Date.now()}_${logoFile.name}`)
      }
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        logoUrl: imagenUrl, nombreWeb, logoTamaño, logoPosicion,
        footerBgColor, footerTextColor
      })
      toast.success('Logo guardado', { id: 'saving-logo' })
      setLogoFile(null); setLogoPreview('')
    } catch (error) { toast.error('Error', { id: 'saving-logo' }) }
    finally { setIsSavingLogo(false) }
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-red-600/20 p-6 border border-blue-500/30">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">Configuración</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona toda la configuración de la web</p>
        </div>
      </div>

      {/* Sección Logo y Nombre Web */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-white"><ImageIcon className="h-4 w-4" /> Logo y Nombre de la Web</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Logo actual</Label><div className="mt-2 p-4 bg-gray-900 rounded-lg"><img src={logoUrl} alt="Logo" className="h-20 object-contain" /></div></div>
          <div><Label>Cambiar logo</Label><div className="flex items-center gap-4 mt-2">
            {logoPreview ? <div className="relative"><img src={logoPreview} className="h-20 w-20 object-contain border-2 border-blue-500 rounded" /><button onClick={() => { setLogoFile(null); setLogoPreview(''); }} className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"><X className="h-3 w-3 text-white" /></button><button onClick={() => setShowLogoPreview(true)} className="absolute bottom-1 right-1 bg-black/70 rounded-full p-1"><Eye className="h-3 w-3" /></button></div> : <label className="flex h-20 w-48 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700"><Upload className="h-6 w-6" /><input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} /></label>}
          </div></div>
          <div><Label>Nombre de la web</Label><Input value={nombreWeb} onChange={(e) => setNombreWeb(e.target.value)} className="bg-gray-900" /></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>Tamaño del logo</Label><select value={logoTamaño} onChange={(e) => setLogoTamaño(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-2"><option value="pequeño">Pequeño</option><option value="medio">Medio</option><option value="grande">Grande</option></select></div>
          <div><Label>Posición del logo</Label><select value={logoPosicion} onChange={(e) => setLogoPosicion(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-2"><option value="izquierda">Izquierda</option><option value="centro">Centro</option><option value="derecha">Derecha</option></select></div></div>
          <Button onClick={handleSaveLogo} disabled={isSavingLogo}><Save className="h-4 w-4 mr-2" />Guardar logo</Button>
        </CardContent>
      </Card>

      {/* Sección Portada Principal */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader><CardTitle>🏠 Portada Principal</CardTitle><CardDescription>Imagen y textos de la página de inicio</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Imagen actual</Label><div className="h-32 w-full bg-gray-900 rounded-lg overflow-hidden mt-2">{portadaData.portada && <img src={portadaData.portada} className="w-full h-full object-cover" />}</div></div>
          <div><Label>Cambiar imagen</Label><div className="flex items-center gap-4">{portadaPreview ? <div className="relative"><img src={portadaPreview} className="h-24 w-40 object-cover rounded border-2 border-blue-500" /><button onClick={() => { setPortadaFile(null); setPortadaPreview(''); }} className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"><X className="h-3 w-3" /></button></div> : <label className="flex h-24 w-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700"><Upload className="h-6 w-6" /><input type="file" accept="image/*" className="hidden" onChange={handlePortadaImageChange} /></label>}</div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Título principal (español) *</Label><Input value={portadaData.titulo} onChange={(e) => setPortadaData({...portadaData, titulo: e.target.value})} placeholder="Ej: Gaby's Club" /></div>
            <div><Label>Subtítulo (español) *</Label><Input value={portadaData.subtitulo} onChange={(e) => setPortadaData({...portadaData, subtitulo: e.target.value})} placeholder="Ej: Los mejores cócteles" /></div>
          </div>
          <p className="text-xs text-gray-500">El título y subtítulo se traducirán automáticamente a Inglés, Francés, Alemán y Ruso al guardar</p>
          <Button onClick={handleSavePortada} disabled={isSavingPortada} className="bg-gradient-to-r from-green-600 to-green-500">
            {isSavingPortada && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar y traducir portada
          </Button>
        </CardContent>
      </Card>

      {/* Sección Carta */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader><CardTitle>📋 Configuración de la Carta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Título del banner (español)</Label><Input value={cartaTitulo} onChange={(e) => setCartaTitulo(e.target.value)} placeholder="Ej: La Carta" /></div>
          <div><Label>Imagen del banner (hero)</Label><div className="flex items-center gap-4">{cartaImagenPreview ? <div className="relative"><img src={cartaImagenPreview} className="h-24 w-40 object-cover rounded border-2 border-green-500" /><button onClick={() => { setCartaImagenFile(null); setCartaImagenPreview(''); }} className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"><X className="h-3 w-3" /></button></div> : <label className="flex h-24 w-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700"><Upload className="h-6 w-6" /><input type="file" accept="image/*" className="hidden" onChange={handleCartaImageChange} /></label>}</div></div>
          
          <div className="border-t border-gray-800 pt-4 mt-2"><h3 className="font-semibold text-white mb-3">📢 Línea informativa</h3>
            <div className="flex items-center justify-between mb-3"><Label>Activar línea</Label><Switch checked={lineaActiva} onCheckedChange={setLineaActiva} /></div>
            {lineaActiva && (<div className="space-y-3"><Input value={lineaTexto} onChange={(e) => setLineaTexto(e.target.value)} placeholder="Ej: Envío gratis desde 20€" /><div><Label>Color del texto</Label><div className="flex items-center gap-2"><input type="color" value={lineaColorTexto} onChange={(e) => setLineaColorTexto(e.target.value)} className="h-10 w-10 rounded border" /><span>{lineaColorTexto}</span></div></div><div><Label>Color de fondo</Label><div className="flex items-center gap-2"><input type="color" value={lineaColorFondo} onChange={(e) => setLineaColorFondo(e.target.value)} className="h-10 w-10 rounded border" /><span>{lineaColorFondo}</span></div></div>
            <div><Label>Tamaño de letra (px)</Label><div className="flex items-center gap-4"><input type="range" min="10" max="48" value={lineaTamanioLetra} onChange={(e) => setLineaTamanioLetra(parseInt(e.target.value))} className="flex-1" /><span>{lineaTamanioLetra}px</span></div></div>
            <div><Label>Tipo de letra</Label><select value={lineaTipoLetra} onChange={(e) => setLineaTipoLetra(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-2 text-white">{fuentes.map(fuente => (<option key={fuente} value={fuente} style={{ fontFamily: fuente }}>{fuente}</option>))}</select></div>
            <div><Label>Velocidad (segundos)</Label><div className="flex items-center gap-4"><input type="range" min="3" max="30" step="1" value={lineaVelocidad} onChange={(e) => setLineaVelocidad(parseInt(e.target.value))} className="flex-1" /><span>{lineaVelocidad}s</span></div></div>
            <div><Label>Tiempo entre repeticiones (s)</Label><div className="flex items-center gap-4"><input type="range" min="0" max="10" step="0.5" value={lineaTiempoEntre} onChange={(e) => setLineaTiempoEntre(parseFloat(e.target.value))} className="flex-1" /><span>{lineaTiempoEntre}s</span></div></div>
            <div><Label>Ancho de la línea (%)</Label><div className="flex items-center gap-4"><input type="range" min="30" max="100" value={lineaAncho} onChange={(e) => setLineaAncho(parseInt(e.target.value))} className="flex-1" /><span>{lineaAncho}%</span></div></div>
            <div><Label>Posición</Label><div className="flex gap-2"><Button type="button" variant={lineaPosicion === 'left' ? 'default' : 'outline'} className="flex-1" onClick={() => setLineaPosicion('left')}><AlignLeftIcon className="h-4 w-4 mr-2" />Izquierda</Button><Button type="button" variant={lineaPosicion === 'center' ? 'default' : 'outline'} className="flex-1" onClick={() => setLineaPosicion('center')}><AlignCenter className="h-4 w-4 mr-2" />Centro</Button><Button type="button" variant={lineaPosicion === 'right' ? 'default' : 'outline'} className="flex-1" onClick={() => setLineaPosicion('right')}><AlignRight className="h-4 w-4 mr-2" />Derecha</Button></div></div></div>)}
          </div>
          <Button onClick={handleSaveCarta} disabled={isSavingCarta} className="w-full bg-gradient-to-r from-green-600 to-green-500">
            {isSavingCarta && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar y traducir carta
          </Button>
        </CardContent>
      </Card>

      {/* Sección Footer */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader><CardTitle>🎨 Personalización del Footer</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Color de fondo</Label><div className="flex items-center gap-2"><input type="color" value={footerBgColor} onChange={(e) => setFooterBgColor(e.target.value)} className="h-10 w-10 rounded border" /><span>{footerBgColor}</span></div></div>
          <div><Label>Color del texto</Label><div className="flex items-center gap-2"><input type="color" value={footerTextColor} onChange={(e) => setFooterTextColor(e.target.value)} className="h-10 w-10 rounded border" /><span>{footerTextColor}</span></div></div>
          <Button onClick={handleSaveLogo} disabled={isSavingLogo}><Save className="h-4 w-4 mr-2" />Guardar colores</Button>
        </CardContent>
      </Card>

      {/* Información del negocio */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader><CardTitle>🏪 Información del Negocio</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label>Dirección</Label><Input value={portadaData.direccion} onChange={(e) => setPortadaData({...portadaData, direccion: e.target.value})} /></div><div><Label>Teléfono</Label><Input value={portadaData.telefono} onChange={(e) => setPortadaData({...portadaData, telefono: e.target.value})} /></div><div><Label>Email</Label><Input value={portadaData.email} onChange={(e) => setPortadaData({...portadaData, email: e.target.value})} /></div><div><Label>WhatsApp</Label><Input value={portadaData.whatsapp} onChange={(e) => setPortadaData({...portadaData, whatsapp: e.target.value})} /></div><div><Label>Instagram</Label><Input value={portadaData.instagram} onChange={(e) => setPortadaData({...portadaData, instagram: e.target.value})} /></div><div><Label>TikTok</Label><Input value={portadaData.tiktok} onChange={(e) => setPortadaData({...portadaData, tiktok: e.target.value})} /></div></div>
        <Button onClick={handleSavePortada} disabled={isSavingPortada} className="mt-4">Guardar información</Button></CardContent>
      </Card>

      {/* Perfil del Administrador */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-white"><User className="h-4 w-4 text-blue-400" /> Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label>Nombre</Label><Input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="bg-gray-900" /></div><div><Label>Email</Label><Input value={adminEmail} disabled className="bg-gray-800 text-gray-400" /></div></div>
          <Button onClick={handleUpdateProfile} disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-blue-500">Actualizar perfil</Button>
        </CardContent>
      </Card>

      {/* Modales de vista previa */}
      <Dialog open={showLogoPreview} onOpenChange={setShowLogoPreview}><DialogContent><DialogHeader><DialogTitle>Vista previa del logo</DialogTitle></DialogHeader><img src={logoPreview} alt="Logo" className="rounded-lg" /></DialogContent></Dialog>
      <Dialog open={showPortadaPreview} onOpenChange={setShowPortadaPreview}><DialogContent><DialogHeader><DialogTitle>Vista previa portada</DialogTitle></DialogHeader><img src={portadaPreview} alt="Preview" /></DialogContent></Dialog>
      <Dialog open={showCartaPreview} onOpenChange={setShowCartaPreview}><DialogContent><DialogHeader><DialogTitle>Vista previa imagen carta</DialogTitle></DialogHeader><img src={cartaImagenPreview} alt="Preview" /></DialogContent></Dialog>
    </div>
  )
}