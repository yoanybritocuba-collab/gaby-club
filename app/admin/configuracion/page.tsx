'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, Shield, User, Bell, Globe, Palette, ChevronRight, Loader2, Key, Moon, Sun,
  Upload, X, Eye, Image as ImageIcon, LayoutTemplate, Type, AlignLeft, Maximize2,
  Instagram, Facebook, MapPin, Phone, MessageCircle, Mail, Clock, Save,
  Monitor, MoveHorizontal, Gauge, Repeat, AlignCenter, AlignLeft as AlignLeftIcon, AlignRight,
  Brush, Contrast, Eye as EyeIcon, Sliders, Box, Layers, Zap, Droplet
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
import { translateToAllLanguages } from '@/lib/translate'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ConfiguracionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [activeTab, setActiveTab] = useState('general')
  
  // ============ PORTADA PRINCIPAL ============
  const [portadaData, setPortadaData] = useState({
    portada: '', titulo: '', subtitulo: '',
    tituloEn: '', tituloFr: '', tituloDe: '', tituloRu: '',
    subtituloEn: '', subtituloFr: '', subtituloDe: '', subtituloRu: '',
    direccion: '', telefono: '', email: '', instagram: '', tiktok: '', whatsapp: ''
  })
  const [portadaFile, setPortadaFile] = useState<File | null>(null)
  const [portadaPreview, setPortadaPreview] = useState('')
  const [showPortadaPreview, setShowPortadaPreview] = useState(false)
  const [isSavingPortada, setIsSavingPortada] = useState(false)

  // ============ CARTA ============
  const [cartaTitulo, setCartaTitulo] = useState('La Carta')
  const [cartaImagen, setCartaImagen] = useState('')
  const [cartaImagenFile, setCartaImagenFile] = useState<File | null>(null)
  const [cartaImagenPreview, setCartaImagenPreview] = useState('')
  const [showCartaPreview, setShowCartaPreview] = useState(false)
  const [isSavingCarta, setIsSavingCarta] = useState(false)

  // ============ LÍNEA INFORMATIVA (TICKER) ============
  const [lineaActiva, setLineaActiva] = useState(false)
  const [lineaTexto, setLineaTexto] = useState('')
  const [lineaColorTexto, setLineaColorTexto] = useState('#d1b275')
  const [lineaColorFondo, setLineaColorFondo] = useState('#000000')
  const [lineaTamanioLetra, setLineaTamanioLetra] = useState(14)
  const [lineaTipoLetra, setLineaTipoLetra] = useState('Arial')
  const [lineaVelocidad, setLineaVelocidad] = useState(15)
  const [lineaTiempoEntre, setLineaTiempoEntre] = useState(0)
  const [lineaAltura, setLineaAltura] = useState(40)
  const [lineaPosicion, setLineaPosicion] = useState<'top' | 'bottom'>('top')

  // ============ COLORES Y TEMA ============
  const [colors, setColors] = useState({
    primary: '#d1b275',
    primaryDark: '#b89a5e',
    primaryLight: '#e0c898',
    secondary: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#9ca3af',
    background: '#000000',
    backgroundCard: '#111827',
    border: '#374151'
  })

  // ============ TIPOGRAFÍA ============
  const [typography, setTypography] = useState({
    fontFamily: 'Inter',
    fontSizeBase: '16',
    headingFont: 'Playfair Display',
    letterSpacing: '0',
    lineHeight: '1.5'
  })

  // ============ LOGO ============
  const [logoUrl, setLogoUrl] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [showLogoPreview, setShowLogoPreview] = useState(false)
  const [isSavingLogo, setIsSavingLogo] = useState(false)
  const [nombreWeb, setNombreWeb] = useState('')
  const [logoTamaño, setLogoTamaño] = useState('medio')
  const [logoPosicion, setLogoPosicion] = useState('izquierda')

  // ============ FOOTER ============
  const [footerBgColor, setFooterBgColor] = useState('#000000')
  const [footerTextColor, setFooterTextColor] = useState('#d1b275')

  const fuentes = ['Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Playfair Display', 'Montserrat', 'Poppins', 'Roboto']

  // Cargar configuración
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
          setLineaColorTexto(data.lineaColorTexto || '#d1b275')
          setLineaColorFondo(data.lineaColorFondo || '#000000')
          setLineaTamanioLetra(data.lineaTamanioLetra || 14)
          setLineaTipoLetra(data.lineaTipoLetra || 'Arial')
          setLineaVelocidad(data.lineaVelocidad || 15)
          setLineaTiempoEntre(data.lineaTiempoEntre || 0)
          setLineaAltura(data.lineaAltura || 40)
          setLineaPosicion(data.lineaPosicion || 'top')
          setColors({
            primary: data.colorPrimary || '#d1b275',
            primaryDark: data.colorPrimaryDark || '#b89a5e',
            primaryLight: data.colorPrimaryLight || '#e0c898',
            secondary: data.colorSecondary || '#1a1a1a',
            text: data.colorText || '#ffffff',
            textMuted: data.colorTextMuted || '#9ca3af',
            background: data.colorBackground || '#000000',
            backgroundCard: data.colorBackgroundCard || '#111827',
            border: data.colorBorder || '#374151'
          })
          setTypography({
            fontFamily: data.fontFamily || 'Inter',
            fontSizeBase: data.fontSizeBase || '16',
            headingFont: data.headingFont || 'Playfair Display',
            letterSpacing: data.letterSpacing || '0',
            lineHeight: data.lineHeight || '1.5'
          })
          setLogoUrl(data.logoUrl || '/logo.png')
          setNombreWeb(data.nombreWeb || "Gaby's Club")
          setLogoTamaño(data.logoTamaño || 'medio')
          setLogoPosicion(data.logoPosicion || 'izquierda')
          setFooterBgColor(data.footerBgColor || '#000000')
          setFooterTextColor(data.footerTextColor || '#d1b275')
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

  // Guardar configuración general (colores, tipografía, etc.)
  const handleSaveGeneral = async () => {
    setIsLoading(true)
    toast.loading('Guardando configuración general...', { id: 'saving-general' })
    try {
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        colorPrimary: colors.primary,
        colorPrimaryDark: colors.primaryDark,
        colorPrimaryLight: colors.primaryLight,
        colorSecondary: colors.secondary,
        colorText: colors.text,
        colorTextMuted: colors.textMuted,
        colorBackground: colors.background,
        colorBackgroundCard: colors.backgroundCard,
        colorBorder: colors.border,
        fontFamily: typography.fontFamily,
        fontSizeBase: typography.fontSizeBase,
        headingFont: typography.headingFont,
        letterSpacing: typography.letterSpacing,
        lineHeight: typography.lineHeight,
        updatedAt: new Date().toISOString()
      })
      toast.success('Configuración general guardada', { id: 'saving-general' })
      
      // Aplicar cambios en tiempo real
      document.documentElement.style.setProperty('--gold', colors.primary)
      document.documentElement.style.setProperty('--gold-dark', colors.primaryDark)
      document.documentElement.style.setProperty('--gold-light', colors.primaryLight)
    } catch (error) {
      toast.error('Error al guardar', { id: 'saving-general' })
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar línea informativa
  const handleSaveLinea = async () => {
    setIsLoading(true)
    toast.loading('Guardando línea informativa...', { id: 'saving-linea' })
    try {
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        lineaActiva, lineaTexto, lineaColorTexto, lineaColorFondo,
        lineaTamanioLetra, lineaTipoLetra, lineaVelocidad, lineaTiempoEntre,
        lineaAltura, lineaPosicion
      })
      toast.success('Línea informativa guardada', { id: 'saving-linea' })
    } catch (error) {
      toast.error('Error al guardar', { id: 'saving-linea' })
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar portada
  const handleSavePortada = async () => {
    setIsSavingPortada(true)
    toast.loading('Guardando portada...', { id: 'saving-portada' })
    try {
      let imagenUrl = portadaData.portada
      if (portadaFile) {
        imagenUrl = await uploadImage(portadaFile, `portada/${Date.now()}_${portadaFile.name}`)
      }
      
      const tituloTranslations = await translateToAllLanguages(portadaData.titulo)
      const subtituloTranslations = await translateToAllLanguages(portadaData.subtitulo)
      
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        portada: imagenUrl, 
        titulo: portadaData.titulo, subtitulo: portadaData.subtitulo,
        tituloEn: tituloTranslations.en, tituloFr: tituloTranslations.fr,
        tituloDe: tituloTranslations.de, tituloRu: tituloTranslations.ru,
        subtituloEn: subtituloTranslations.en, subtituloFr: subtituloTranslations.fr,
        subtituloDe: subtituloTranslations.de, subtituloRu: subtituloTranslations.ru,
        direccion: portadaData.direccion, telefono: portadaData.telefono,
        email: portadaData.email, instagram: portadaData.instagram,
        tiktok: portadaData.tiktok, whatsapp: portadaData.whatsapp
      })
      toast.success('Portada guardada', { id: 'saving-portada' })
      setPortadaFile(null); setPortadaPreview('')
    } catch (error) { toast.error('Error', { id: 'saving-portada' }) }
    finally { setIsSavingPortada(false) }
  }

  // Guardar carta
  const handleSaveCarta = async () => {
    setIsSavingCarta(true)
    toast.loading('Guardando carta...', { id: 'saving-carta' })
    try {
      let imagenUrl = cartaImagen
      if (cartaImagenFile) {
        imagenUrl = await uploadImage(cartaImagenFile, `carta/${Date.now()}_${cartaImagenFile.name}`)
      }
      
      const titleTranslations = await translateToAllLanguages(cartaTitulo)
      
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        cartaTitulo: cartaTitulo,
        cartaTituloEn: titleTranslations.en, cartaTituloFr: titleTranslations.fr,
        cartaTituloDe: titleTranslations.de, cartaTituloRu: titleTranslations.ru,
        cartaImagen: imagenUrl
      })
      toast.success('Carta guardada', { id: 'saving-carta' })
      setCartaImagenFile(null); setCartaImagenPreview('')
    } catch (error) { toast.error('Error', { id: 'saving-carta' }) }
    finally { setIsSavingCarta(false) }
  }

  // Guardar logo
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

  const tabs = [
    { id: 'general', label: '🎨 General', icon: Palette },
    { id: 'ticker', label: '📢 Línea Informativa', icon: MoveHorizontal },
    { id: 'portada', label: '🏠 Portada', icon: ImageIcon },
    { id: 'carta', label: '📋 Carta', icon: LayoutTemplate },
    { id: 'logo', label: '🖼️ Logo', icon: ImageIcon },
    { id: 'footer', label: '📞 Footer', icon: Globe },
    { id: 'perfil', label: '👤 Perfil', icon: User },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 p-6 border border-gold/30">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-gold" />
            <span className="text-xs font-medium text-gold uppercase tracking-wider">Panel de Configuración</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gold">Configuración Profesional</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona todos los aspectos visuales y de contenido de tu web</p>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Panel General */}
      {activeTab === 'general' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Palette className="h-5 w-5 text-gold" />
              Colores y Tipografía
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personaliza los colores y fuentes de toda la web
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Colores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">Color Principal (Dorado)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={colors.primary} onChange={(e) => setColors({...colors, primary: e.target.value})} className="h-10 w-10 rounded border border-gray-700 cursor-pointer" />
                  <Input value={colors.primary} onChange={(e) => setColors({...colors, primary: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Color Texto Principal</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={colors.text} onChange={(e) => setColors({...colors, text: e.target.value})} className="h-10 w-10 rounded border border-gray-700" />
                  <Input value={colors.text} onChange={(e) => setColors({...colors, text: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Color Texto Secundario</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={colors.textMuted} onChange={(e) => setColors({...colors, textMuted: e.target.value})} className="h-10 w-10 rounded border border-gray-700" />
                  <Input value={colors.textMuted} onChange={(e) => setColors({...colors, textMuted: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Color Fondo</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={colors.background} onChange={(e) => setColors({...colors, background: e.target.value})} className="h-10 w-10 rounded border border-gray-700" />
                  <Input value={colors.background} onChange={(e) => setColors({...colors, background: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Color Tarjetas</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={colors.backgroundCard} onChange={(e) => setColors({...colors, backgroundCard: e.target.value})} className="h-10 w-10 rounded border border-gray-700" />
                  <Input value={colors.backgroundCard} onChange={(e) => setColors({...colors, backgroundCard: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Color Bordes</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={colors.border} onChange={(e) => setColors({...colors, border: e.target.value})} className="h-10 w-10 rounded border border-gray-700" />
                  <Input value={colors.border} onChange={(e) => setColors({...colors, border: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
            </div>

            {/* Tipografía */}
            <div className="border-t border-gray-800 pt-4">
              <h3 className="text-white font-medium mb-4">Tipografía</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Fuente Principal</Label>
                  <select value={typography.fontFamily} onChange={(e) => setTypography({...typography, fontFamily: e.target.value})} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                    {fuentes.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Fuente para Títulos</Label>
                  <select value={typography.headingFont} onChange={(e) => setTypography({...typography, headingFont: e.target.value})} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                    {fuentes.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Tamaño Base (px)</Label>
                  <Input type="number" value={typography.fontSizeBase} onChange={(e) => setTypography({...typography, fontSizeBase: e.target.value})} className="mt-1 bg-gray-900" />
                </div>
                <div>
                  <Label className="text-gray-300">Espaciado entre letras</Label>
                  <Input value={typography.letterSpacing} onChange={(e) => setTypography({...typography, letterSpacing: e.target.value})} className="mt-1 bg-gray-900" placeholder="0" />
                </div>
              </div>
            </div>

            <Button onClick={handleSaveGeneral} disabled={isLoading} className="bg-gold text-black hover:bg-gold-dark">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar configuración general
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
              Configura la línea que se desplaza de extremo a extremo de la pantalla
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Activar línea informativa</Label>
                <p className="text-sm text-gray-400">Muestra el ticker en la parte superior de la web</p>
              </div>
              <Switch checked={lineaActiva} onCheckedChange={setLineaActiva} />
            </div>

            {lineaActiva && (
              <>
                <div>
                  <Label className="text-white">Texto</Label>
                  <Textarea value={lineaTexto} onChange={(e) => setLineaTexto(e.target.value)} rows={2} className="mt-1 bg-gray-900 border-gray-700 text-white" placeholder="Ej: 🍸 Envío gratis desde 20€ | 🍹 Happy Hour 18-20h | 🎵 Música en vivo los viernes" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Color del texto</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={lineaColorTexto} onChange={(e) => setLineaColorTexto(e.target.value)} className="h-10 w-10 rounded border border-gray-700" />
                      <Input value={lineaColorTexto} onChange={(e) => setLineaColorTexto(e.target.value)} className="bg-gray-900" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Color de fondo</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={lineaColorFondo} onChange={(e) => setLineaColorFondo(e.target.value)} className="h-10 w-10 rounded border border-gray-700" />
                      <Input value={lineaColorFondo} onChange={(e) => setLineaColorFondo(e.target.value)} className="bg-gray-900" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Tamaño de letra (px)</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="10" max="48" value={lineaTamanioLetra} onChange={(e) => setLineaTamanioLetra(parseInt(e.target.value))} className="flex-1" />
                      <span className="text-gray-400 w-12">{lineaTamanioLetra}px</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Tipo de letra</Label>
                    <select value={lineaTipoLetra} onChange={(e) => setLineaTipoLetra(e.target.value)} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                      {fuentes.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-white">Velocidad (segundos)</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="5" max="30" step="1" value={lineaVelocidad} onChange={(e) => setLineaVelocidad(parseInt(e.target.value))} className="flex-1" />
                      <span className="text-gray-400 w-12">{lineaVelocidad}s</span>
                    </div>
                    <p className="text-xs text-gray-500">Tiempo que tarda en cruzar la pantalla</p>
                  </div>
                  <div>
                    <Label className="text-white">Altura de la línea (px)</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="24" max="80" step="2" value={lineaAltura} onChange={(e) => setLineaAltura(parseInt(e.target.value))} className="flex-1" />
                      <span className="text-gray-400 w-12">{lineaAltura}px</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Posición</Label>
                    <div className="flex gap-2 mt-1">
                      <Button type="button" variant={lineaPosicion === 'top' ? 'default' : 'outline'} className="flex-1" onClick={() => setLineaPosicion('top')}>Arriba</Button>
                      <Button type="button" variant={lineaPosicion === 'bottom' ? 'default' : 'outline'} className="flex-1" onClick={() => setLineaPosicion('bottom')}>Abajo</Button>
                    </div>
                  </div>
                </div>

                {/* Vista previa */}
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="h-4 w-4 text-green-400" />
                    <Label className="text-white">Vista previa en tiempo real</Label>
                  </div>
                  <div className="w-full overflow-hidden rounded-lg" style={{ backgroundColor: lineaColorFondo, height: `${lineaAltura}px` }}>
                    <div className="h-full flex items-center">
                      <div className="whitespace-nowrap animate-marquee" style={{ animationDuration: `${lineaVelocidad}s`, fontFamily: lineaTipoLetra, fontSize: `${lineaTamanioLetra}px`, color: lineaColorTexto, display: 'inline-block', padding: '0 20px' }}>
                        {lineaTexto || "Escribe un texto para ver la vista previa..."}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button onClick={handleSaveLinea} disabled={isLoading} className="bg-gold text-black hover:bg-gold-dark">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar línea informativa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Panel Portada */}
      {activeTab === 'portada' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="h-5 w-5 text-gold" />
              Portada Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Imagen de fondo actual</Label>
              <div className="h-40 w-full bg-gray-900 rounded-lg overflow-hidden mt-2">
                {portadaData.portada && <img src={portadaData.portada} className="w-full h-full object-cover" />}
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Cambiar imagen</Label>
              <div className="flex items-center gap-4 mt-2">
                {portadaPreview ? (
                  <div className="relative">
                    <img src={portadaPreview} className="h-24 w-40 object-cover rounded border-2 border-gold" />
                    <button onClick={() => { setPortadaFile(null); setPortadaPreview(''); }} className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"><X className="h-3 w-3 text-white" /></button>
                  </div>
                ) : (
                  <label className="flex h-24 w-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700 hover:border-gold">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Subir imagen</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setPortadaFile(file); const reader = new FileReader(); reader.onloadend = () => setPortadaPreview(reader.result as string); reader.readAsDataURL(file); } }} />
                  </label>
                )}
                <p className="text-xs text-gray-500">Recomendado: 1920x1080px</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="text-gray-300">Título (español)</Label><Input value={portadaData.titulo} onChange={(e) => setPortadaData({...portadaData, titulo: e.target.value})} className="mt-1 bg-gray-900" /></div>
              <div><Label className="text-gray-300">Subtítulo (español)</Label><Input value={portadaData.subtitulo} onChange={(e) => setPortadaData({...portadaData, subtitulo: e.target.value})} className="mt-1 bg-gray-900" /></div>
            </div>
            <Button onClick={handleSavePortada} disabled={isSavingPortada} className="bg-gold text-black hover:bg-gold-dark">
              {isSavingPortada && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar portada
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Panel Carta */}
      {activeTab === 'carta' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <LayoutTemplate className="h-5 w-5 text-gold" />
              Configuración de la Carta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-gray-300">Título del banner</Label><Input value={cartaTitulo} onChange={(e) => setCartaTitulo(e.target.value)} className="mt-1 bg-gray-900" /></div>
            <div>
              <Label className="text-gray-300">Imagen del banner</Label>
              <div className="flex items-center gap-4 mt-2">
                {cartaImagenPreview ? (
                  <div className="relative"><img src={cartaImagenPreview} className="h-24 w-40 object-cover rounded border-2 border-gold" /><button onClick={() => { setCartaImagenFile(null); setCartaImagenPreview(''); }} className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"><X className="h-3 w-3" /></button></div>
                ) : (
                  <label className="flex h-24 w-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700 hover:border-gold">
                    <Upload className="h-6 w-6" /><input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setCartaImagenFile(file); const reader = new FileReader(); reader.onloadend = () => setCartaImagenPreview(reader.result as string); reader.readAsDataURL(file); } }} />
                  </label>
                )}
              </div>
            </div>
            <Button onClick={handleSaveCarta} disabled={isSavingCarta} className="bg-gold text-black hover:bg-gold-dark">Guardar carta</Button>
          </CardContent>
        </Card>
      )}

      {/* Panel Logo */}
      {activeTab === 'logo' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="h-5 w-5 text-gold" />
              Logo y Nombre
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-gray-300">Logo actual</Label><div className="mt-2 p-4 bg-gray-900 rounded-lg"><img src={logoUrl} alt="Logo" className="h-20 object-contain" /></div></div>
            <div><Label className="text-gray-300">Cambiar logo</Label><div className="flex items-center gap-4 mt-2">
              {logoPreview ? <div className="relative"><img src={logoPreview} className="h-20 w-20 object-contain border-2 border-gold rounded" /><button onClick={() => { setLogoFile(null); setLogoPreview(''); }} className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"><X className="h-3 w-3" /></button></div> : <label className="flex h-20 w-48 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700 hover:border-gold"><Upload className="h-6 w-6" /><input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setLogoFile(file); const reader = new FileReader(); reader.onloadend = () => setLogoPreview(reader.result as string); reader.readAsDataURL(file); } }} /></label>}
            </div></div>
            <div><Label className="text-gray-300">Nombre de la web</Label><Input value={nombreWeb} onChange={(e) => setNombreWeb(e.target.value)} className="bg-gray-900" /></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>Tamaño del logo</Label><select value={logoTamaño} onChange={(e) => setLogoTamaño(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-2"><option value="pequeño">Pequeño</option><option value="medio">Medio</option><option value="grande">Grande</option></select></div>
            <div><Label>Posición del logo</Label><select value={logoPosicion} onChange={(e) => setLogoPosicion(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-2"><option value="izquierda">Izquierda</option><option value="centro">Centro</option><option value="derecha">Derecha</option></select></div></div>
            <Button onClick={handleSaveLogo} disabled={isSavingLogo} className="bg-gold text-black hover:bg-gold-dark">Guardar logo</Button>
          </CardContent>
        </Card>
      )}

      {/* Panel Footer */}
      {activeTab === 'footer' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-5 w-5 text-gold" />
              Información del Footer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="text-gray-300">Dirección</Label><Input value={portadaData.direccion} onChange={(e) => setPortadaData({...portadaData, direccion: e.target.value})} className="bg-gray-900" /></div>
              <div><Label className="text-gray-300">Teléfono</Label><Input value={portadaData.telefono} onChange={(e) => setPortadaData({...portadaData, telefono: e.target.value})} className="bg-gray-900" /></div>
              <div><Label className="text-gray-300">Email</Label><Input value={portadaData.email} onChange={(e) => setPortadaData({...portadaData, email: e.target.value})} className="bg-gray-900" /></div>
              <div><Label className="text-gray-300">WhatsApp</Label><Input value={portadaData.whatsapp} onChange={(e) => setPortadaData({...portadaData, whatsapp: e.target.value})} className="bg-gray-900" /></div>
              <div><Label className="text-gray-300">Instagram</Label><Input value={portadaData.instagram} onChange={(e) => setPortadaData({...portadaData, instagram: e.target.value})} className="bg-gray-900" /></div>
              <div><Label className="text-gray-300">TikTok</Label><Input value={portadaData.tiktok} onChange={(e) => setPortadaData({...portadaData, tiktok: e.target.value})} className="bg-gray-900" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-300">Color fondo footer</Label><input type="color" value={footerBgColor} onChange={(e) => setFooterBgColor(e.target.value)} className="h-10 w-10 rounded border" /></div>
              <div><Label className="text-gray-300">Color texto footer</Label><input type="color" value={footerTextColor} onChange={(e) => setFooterTextColor(e.target.value)} className="h-10 w-10 rounded border" /></div>
            </div>
            <Button onClick={handleSaveLogo} disabled={isSavingLogo} className="bg-gold text-black hover:bg-gold-dark">Guardar información</Button>
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
            <div><Label className="text-gray-300">Nombre</Label><Input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="bg-gray-900" /></div>
            <div><Label className="text-gray-300">Email</Label><Input value={adminEmail} disabled className="bg-gray-800 text-gray-400" /></div>
            <Button onClick={async () => { if (!adminName.trim()) { toast.error('El nombre no puede estar vacío'); return } setIsLoading(true); try { await updateProfile(getAuth(app).currentUser!, { displayName: adminName }); toast.success('Perfil actualizado'); } catch (error) { toast.error('Error'); } finally { setIsLoading(false); } }} disabled={isLoading} className="bg-gold text-black hover:bg-gold-dark">Actualizar perfil</Button>
          </CardContent>
        </Card>
      )}

      {/* Modales de vista previa */}
      <Dialog open={showLogoPreview} onOpenChange={setShowLogoPreview}><DialogContent><DialogHeader><DialogTitle>Vista previa del logo</DialogTitle></DialogHeader><img src={logoPreview} alt="Logo" className="rounded-lg" /></DialogContent></Dialog>
      <Dialog open={showPortadaPreview} onOpenChange={setShowPortadaPreview}><DialogContent><DialogHeader><DialogTitle>Vista previa portada</DialogTitle></DialogHeader><img src={portadaPreview} alt="Preview" /></DialogContent></Dialog>
      <Dialog open={showCartaPreview} onOpenChange={setShowCartaPreview}><DialogContent><DialogHeader><DialogTitle>Vista previa imagen carta</DialogTitle></DialogHeader><img src={cartaImagenPreview} alt="Preview" /></DialogContent></Dialog>
    </div>
  )
}