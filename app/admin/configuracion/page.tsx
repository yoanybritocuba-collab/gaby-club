'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, Shield, User, Bell, Globe, Palette, ChevronRight, Loader2, Key, Moon, Sun,
  Upload, X, Eye, Image as ImageIcon, LayoutTemplate, Type, AlignLeft, Maximize2,
  Instagram, Facebook, MapPin, Phone, MessageCircle, Mail, Clock, Save
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
    portada: '', titulo: '', subtitulo: '', direccion: '', telefono: '', email: '', instagram: '', tiktok: '', whatsapp: ''
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
  const [lineaColor, setLineaColor] = useState('#ffffff')
  const [lineaAncho, setLineaAncho] = useState('100')
  const [lineaPosicion, setLineaPosicion] = useState('center')

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

  // Cargar configuración
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setPortadaData({
            portada: data.portada || '', titulo: data.titulo || 'Gaby\'s Club', subtitulo: data.subtitulo || 'Cócteles y picaderas',
            direccion: data.direccion || '', telefono: data.telefono || '', email: data.email || '',
            instagram: data.instagram || '', tiktok: data.tiktok || '', whatsapp: data.whatsapp || ''
          })
          setCartaTitulo(data.cartaTitulo || 'La Carta')
          setCartaImagen(data.cartaImagen || '')
          setLineaActiva(data.lineaActiva || false)
          setLineaTexto(data.lineaTexto || '')
          setLineaColor(data.lineaColor || '#ffffff')
          setLineaAncho(data.lineaAncho || '100')
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
    } catch (error) {
      toast.error('Error al actualizar', { id: 'update-profile' })
    } finally { setIsLoading(false) }
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
    toast.loading('Guardando...', { id: 'saving' })
    try {
      let imagenUrl = portadaData.portada
      if (portadaFile) {
        imagenUrl = await uploadImage(portadaFile, `portada/${Date.now()}_${portadaFile.name}`)
      }
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        portada: imagenUrl, titulo: portadaData.titulo, subtitulo: portadaData.subtitulo,
        direccion: portadaData.direccion, telefono: portadaData.telefono, email: portadaData.email,
        instagram: portadaData.instagram, tiktok: portadaData.tiktok, whatsapp: portadaData.whatsapp
      })
      toast.success('Guardado', { id: 'saving' })
      setPortadaFile(null); setPortadaPreview('')
    } catch (error) { toast.error('Error', { id: 'saving' }) }
    finally { setIsSavingPortada(false) }
  }

  const handleSaveCarta = async () => {
    setIsSavingCarta(true)
    toast.loading('Guardando carta...', { id: 'saving-carta' })
    try {
      let imagenUrl = cartaImagen
      if (cartaImagenFile) {
        imagenUrl = await uploadImage(cartaImagenFile, `carta/${Date.now()}_${cartaImagenFile.name}`)
      }
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        cartaTitulo, cartaImagen: imagenUrl,
        lineaActiva, lineaTexto, lineaColor, lineaAncho, lineaPosicion
      })
      toast.success('Carta guardada', { id: 'saving-carta' })
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
        <CardHeader><CardTitle>🏠 Portada Principal</CardTitle><CardDescription>Imagen de fondo de la página de inicio</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Imagen actual</Label><div className="h-32 w-full bg-gray-900 rounded-lg overflow-hidden mt-2">{portadaData.portada && <img src={portadaData.portada} className="w-full h-full object-cover" />}</div></div>
          <div><Label>Cambiar imagen</Label><div className="flex items-center gap-4">{portadaPreview ? <div className="relative"><img src={portadaPreview} className="h-24 w-40 object-cover rounded border-2 border-blue-500" /><button onClick={() => { setPortadaFile(null); setPortadaPreview(''); }} className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"><X className="h-3 w-3" /></button></div> : <label className="flex h-24 w-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700"><Upload className="h-6 w-6" /><input type="file" accept="image/*" className="hidden" onChange={handlePortadaImageChange} /></label>}</div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>Título</Label><Input value={portadaData.titulo} onChange={(e) => setPortadaData({...portadaData, titulo: e.target.value})} /></div><div><Label>Subtítulo</Label><Input value={portadaData.subtitulo} onChange={(e) => setPortadaData({...portadaData, subtitulo: e.target.value})} /></div></div>
          <Button onClick={handleSavePortada} disabled={isSavingPortada}>Guardar portada</Button>
        </CardContent>
      </Card>

      {/* Sección Carta */}
      <Card className="border border-gray-800 bg-gray-950/50">
        <CardHeader><CardTitle>📋 Configuración de la Carta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Título del banner</Label><Input value={cartaTitulo} onChange={(e) => setCartaTitulo(e.target.value)} placeholder="Ej: La Carta" /></div>
          <div><Label>Imagen del banner (hero)</Label><div className="flex items-center gap-4">{cartaImagenPreview ? <div className="relative"><img src={cartaImagenPreview} className="h-24 w-40 object-cover rounded border-2 border-green-500" /><button onClick={() => { setCartaImagenFile(null); setCartaImagenPreview(''); }} className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"><X className="h-3 w-3" /></button></div> : <label className="flex h-24 w-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700"><Upload className="h-6 w-6" /><input type="file" accept="image/*" className="hidden" onChange={handleCartaImageChange} /></label>}</div></div>
          
          <div className="border-t border-gray-800 pt-4 mt-2"><h3 className="font-semibold text-white mb-3">📢 Línea informativa</h3>
            <div className="flex items-center justify-between mb-3"><Label>Activar línea</Label><Switch checked={lineaActiva} onCheckedChange={setLineaActiva} /></div>
            {lineaActiva && (<div className="space-y-3"><Input value={lineaTexto} onChange={(e) => setLineaTexto(e.target.value)} placeholder="Ej: Envío gratis desde 20€" /><div><Label>Color del texto</Label><div className="flex items-center gap-2"><input type="color" value={lineaColor} onChange={(e) => setLineaColor(e.target.value)} className="h-10 w-10 rounded border" /><span>{lineaColor}</span></div></div><div><Label>Ancho (%)</Label><div className="flex items-center gap-4"><input type="range" min="30" max="100" value={lineaAncho} onChange={(e) => setLineaAncho(e.target.value)} className="flex-1" /><span>{lineaAncho}%</span><Maximize2 className="h-4 w-4 text-gray-400" title="Ancho visible" /></div></div><div><Label>Posición</Label><select value={lineaPosicion} onChange={(e) => setLineaPosicion(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-2"><option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option></select></div></div>)}
          </div>
          <Button onClick={handleSaveCarta} disabled={isSavingCarta}>Guardar configuración de la carta</Button>
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

      {/* Modales de vista previa */}
      <Dialog open={showLogoPreview} onOpenChange={setShowLogoPreview}><DialogContent><DialogHeader><DialogTitle>Vista previa del logo</DialogTitle></DialogHeader><img src={logoPreview} alt="Logo" className="rounded-lg" /></DialogContent></Dialog>
      <Dialog open={showPortadaPreview} onOpenChange={setShowPortadaPreview}><DialogContent><DialogHeader><DialogTitle>Vista previa portada</DialogTitle></DialogHeader><img src={portadaPreview} alt="Preview" /></DialogContent></Dialog>
      <Dialog open={showCartaPreview} onOpenChange={setShowCartaPreview}><DialogContent><DialogHeader><DialogTitle>Vista previa imagen carta</DialogTitle></DialogHeader><img src={cartaImagenPreview} alt="Preview" /></DialogContent></Dialog>
    </div>
  )
}