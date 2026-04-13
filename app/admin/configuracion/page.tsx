'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, Shield, User, Bell, Globe, Palette, ChevronRight, Loader2, Key, Moon, Sun,
  Upload, X, Eye, Image as ImageIcon, LayoutTemplate, Type, AlignLeft, Maximize2,
  Instagram, Facebook, MapPin, Phone, MessageCircle, Mail, Clock, Save,
  Monitor, MoveHorizontal, Gauge, Repeat, AlignCenter, AlignLeft as AlignLeftIcon, AlignRight,
  Brush, Contrast, Eye as EyeIcon, Sliders, Box, Layers, Zap, Droplet,
  Menu, Home, Star, Heart, Truck, Coffee, Utensils, Wine, ShoppingCart, Plus, Minus,
  ChevronLeft, Search, Filter, Grid3x3, List, ArrowUp, ArrowRight
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

// ============ TIPOS ============
interface ColorSettings {
  primary: string
  primaryDark: string
  primaryLight: string
  secondary: string
  text: string
  textMuted: string
  background: string
  backgroundCard: string
  border: string
  success: string
  error: string
  warning: string
}

interface TypographySettings {
  fontFamily: string
  fontSizeBase: string
  headingFont: string
  letterSpacing: string
  lineHeight: string
  fontWeight: string
}

interface NavbarSettings {
  logoUrl: string
  logoSize: number
  logoPosition: 'left' | 'center' | 'right'
  logoRounded: number
  showName: boolean
  nameText: string
  nameColor: string
  nameSize: number
  nameFont: string
  linkColor: string
  linkColorHover: string
  linkSize: number
  linkSpacing: number
  iconColor: string
  iconColorHover: string
  iconSize: number
  iconBgColor: string
  iconRounded: number
  navbarBgColor: string
  navbarBlur: number
  navbarBorderColor: string
  navbarBorderWidth: number
  navbarHeight: number
  hoverEffect: string
  transitionDuration: number
}

interface HeroSettings {
  imageUrl: string
  imagePosition: string
  imageSize: string
  overlayColor: string
  overlayOpacity: number
  titleText: string
  titleColor: string
  titleSize: number
  titleFont: string
  titleWeight: string
  titleShadow: string
  titlePosition: string
  subtitleText: string
  subtitleColor: string
  subtitleSize: number
  subtitleFont: string
  subtitleWeight: string
  subtitleShadow: string
  buttonText: string
  buttonTextColor: string
  buttonBgColor: string
  buttonBgHover: string
  buttonBorderRadius: number
  buttonShadow: string
  sectionHeight: number
  parallax: boolean
}

interface FeaturesSettings {
  iconType: string
  iconColor: string
  iconColorHover: string
  iconSize: number
  iconBgColor: string
  iconRounded: number
  titleColor: string
  titleSize: number
  titleFont: string
  descColor: string
  descSize: number
  descFont: string
  columns: number
  spacing: number
  hoverEffect: string
}

interface SuggestionsSettings {
  sectionTitle: string
  titleColor: string
  titleSize: number
  titleFont: string
  cardBgColor: string
  cardBorderColor: string
  cardBorderRadius: number
  cardShadow: string
  cardPadding: number
  imageRounded: number
  imageAspect: string
  productNameColor: string
  productNameSize: number
  productNameFont: string
  productPriceColor: string
  productPriceSize: number
  productDescColor: string
  productDescSize: number
  buttonColor: string
  buttonBgColor: string
  buttonBgHover: string
  buttonRounded: number
  cardHoverEffect: string
}

interface CTASettings {
  titleText: string
  titleColor: string
  titleSize: number
  titleFont: string
  subtitleText: string
  subtitleColor: string
  subtitleSize: number
  subtitleFont: string
  buttonText: string
  buttonTextColor: string
  buttonBgColor: string
  buttonBgHover: string
  buttonRounded: number
  buttonShadow: string
  bgType: 'color' | 'gradient'
  bgColor: string
  gradientStart: string
  gradientEnd: string
  gradientAngle: number
  sectionHeight: number
}

interface TickerSettings {
  activo: boolean
  texto: string
  colorTexto: string
  colorFondo: string
  tamanioLetra: number
  tipoLetra: string
  velocidad: number
  tiempoEntre: number
  altura: number
  posicion: 'top' | 'bottom'
  ancho: number
}

interface FooterSettings {
  bgColor: string
  textColor: string
  textSize: number
  textFont: string
  iconColor: string
  iconColorHover: string
  iconSize: number
  linkColor: string
  linkColorHover: string
  linkSize: number
  copyrightText: string
  copyrightColor: string
  copyrightSize: number
  paddingTop: number
  paddingBottom: number
  columns: number
  spacing: number
}

// Fuentes disponibles
const FUENTES = [
  'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
  'Playfair Display', 'Montserrat', 'Poppins', 'Roboto', 'Open Sans', 'Lato',
  'Oswald', 'Raleway', 'Ubuntu', 'Nunito', 'DM Sans', 'Plus Jakarta Sans'
]

// Efectos hover disponibles
const HOVER_EFFECTS = [
  { value: 'scale', label: 'Escalar' },
  { value: 'shadow', label: 'Sombra' },
  { value: 'glow', label: 'Resplandor' },
  { value: 'underline', label: 'Subrayado' },
  { value: 'none', label: 'Ninguno' }
]

// Iconos disponibles para features
const FEATURE_ICONS = [
  { value: 'Truck', label: '🚚 Delivery', icon: Truck },
  { value: 'Heart', label: '❤️ Corazón', icon: Heart },
  { value: 'Shield', label: '🛡️ Escudo', icon: Shield },
  { value: 'Clock', label: '⏰ Reloj', icon: Clock },
  { value: 'Star', label: '⭐ Estrella', icon: Star },
  { value: 'Coffee', label: '☕ Café', icon: Coffee },
  { value: 'Utensils', label: '🍽️ Cubiertos', icon: Utensils },
  { value: 'Wine', label: '🍷 Vino', icon: Wine }
]

export default function ConfiguracionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('navbar')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [darkMode, setDarkMode] = useState(true)

  // Estados para cada área
  const [navbar, setNavbar] = useState<NavbarSettings>({
    logoUrl: '/logo.png', logoSize: 80, logoPosition: 'left', logoRounded: 0,
    showName: true, nameText: "Gaby's Club", nameColor: '#d1b275', nameSize: 24, nameFont: 'Playfair Display',
    linkColor: '#ffffff', linkColorHover: '#d1b275', linkSize: 14, linkSpacing: 24,
    iconColor: '#d1b275', iconColorHover: '#e0c898', iconSize: 20, iconBgColor: 'transparent', iconRounded: 9999,
    navbarBgColor: '#000000', navbarBlur: 80, navbarBorderColor: '#374151', navbarBorderWidth: 1, navbarHeight: 70,
    hoverEffect: 'scale', transitionDuration: 200
  })

  const [hero, setHero] = useState<HeroSettings>({
    imageUrl: '', imagePosition: 'center', imageSize: 'cover', overlayColor: '#000000', overlayOpacity: 50,
    titleText: "Gaby's Club", titleColor: '#ffffff', titleSize: 72, titleFont: 'Playfair Display', titleWeight: 'bold', titleShadow: 'none', titlePosition: 'center',
    subtitleText: 'Los mejores cócteles de la ciudad', subtitleColor: '#d1b275', subtitleSize: 24, subtitleFont: 'Inter', subtitleWeight: 'normal', subtitleShadow: 'none',
    buttonText: 'Ver Carta', buttonTextColor: '#000000', buttonBgColor: '#d1b275', buttonBgHover: '#b89a5e', buttonBorderRadius: 9999, buttonShadow: 'none',
    sectionHeight: 85, parallax: false
  })

  const [features, setFeatures] = useState<FeaturesSettings>({
    iconType: 'Truck', iconColor: '#d1b275', iconColorHover: '#e0c898', iconSize: 32, iconBgColor: 'transparent', iconRounded: 9999,
    titleColor: '#ffffff', titleSize: 18, titleFont: 'Inter', descColor: '#9ca3af', descSize: 14, descFont: 'Inter',
    columns: 4, spacing: 24, hoverEffect: 'scale'
  })

  const [suggestions, setSuggestions] = useState<SuggestionsSettings>({
    sectionTitle: 'Especialidades de la Casa', titleColor: '#ffffff', titleSize: 48, titleFont: 'Playfair Display',
    cardBgColor: '#111827', cardBorderColor: '#374151', cardBorderRadius: 12, cardShadow: 'none', cardPadding: 16,
    imageRounded: 8, imageAspect: '4/3', productNameColor: '#ffffff', productNameSize: 18, productNameFont: 'Inter',
    productPriceColor: '#d1b275', productPriceSize: 20, productDescColor: '#9ca3af', productDescSize: 14,
    buttonColor: '#000000', buttonBgColor: '#d1b275', buttonBgHover: '#b89a5e', buttonRounded: 9999,
    cardHoverEffect: 'scale'
  })

  const [cta, setCta] = useState<CTASettings>({
    titleText: '¿Listo para disfrutar?', titleColor: '#ffffff', titleSize: 48, titleFont: 'Playfair Display',
    subtitleText: 'Reserva tu mesa o pide a domicilio', subtitleColor: '#d1b275', subtitleSize: 20, subtitleFont: 'Inter',
    buttonText: 'Reservar ahora', buttonTextColor: '#000000', buttonBgColor: '#d1b275', buttonBgHover: '#b89a5e', buttonRounded: 9999, buttonShadow: 'none',
    bgType: 'gradient', bgColor: '#000000', gradientStart: '#2563eb', gradientEnd: '#ef4444', gradientAngle: 90, sectionHeight: 400
  })

  const [ticker, setTicker] = useState<TickerSettings>({
    activo: false, texto: '🍸 Envío gratis desde 20€ | 🍹 Happy Hour 18-20h | 🎵 Música en vivo los viernes',
    colorTexto: '#d1b275', colorFondo: '#000000', tamanioLetra: 14, tipoLetra: 'Arial',
    velocidad: 15, tiempoEntre: 2, altura: 40, posicion: 'top', ancho: 100
  })

  const [footer, setFooter] = useState<FooterSettings>({
    bgColor: '#000000', textColor: '#d1b275', textSize: 14, textFont: 'Inter',
    iconColor: '#d1b275', iconColorHover: '#e0c898', iconSize: 20,
    linkColor: '#9ca3af', linkColorHover: '#d1b275', linkSize: 14,
    copyrightText: 'Gaby\'s Club', copyrightColor: '#6b7280', copyrightSize: 12,
    paddingTop: 48, paddingBottom: 48, columns: 3, spacing: 32
  })

  // Cargar configuración desde Firestore
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          // Cargar navbar
          if (data.navbar) setNavbar(prev => ({ ...prev, ...data.navbar }))
          // Cargar hero
          if (data.hero) setHero(prev => ({ ...prev, ...data.hero }))
          // Cargar features
          if (data.features) setFeatures(prev => ({ ...prev, ...data.features }))
          // Cargar suggestions
          if (data.suggestions) setSuggestions(prev => ({ ...prev, ...data.suggestions }))
          // Cargar cta
          if (data.cta) setCta(prev => ({ ...prev, ...data.cta }))
          // Cargar ticker
          if (data.ticker) setTicker(prev => ({ ...prev, ...data.ticker }))
          // Cargar footer
          if (data.footer) setFooter(prev => ({ ...prev, ...data.footer }))
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

  // Guardar todas las configuraciones
  const handleSaveAll = async () => {
    setIsSaving(true)
    toast.loading('Guardando toda la configuración...', { id: 'saving-all' })
    try {
      await updateDoc(doc(db, 'configuracion', 'vUJ7J8q0KfoLrph2QAgt'), {
        navbar, hero, features, suggestions, cta, ticker, footer,
        updatedAt: new Date().toISOString()
      })
      toast.success('Configuración guardada correctamente', { id: 'saving-all' })
    } catch (error) {
      toast.error('Error al guardar', { id: 'saving-all' })
    } finally {
      setIsSaving(false)
    }
  }

  // Subir imagen (archivo o URL)
  const handleImageUpload = async (file: File | null, url: string, setter: (url: string) => void) => {
    if (file) {
      const imageUrl = await uploadImage(file, `config/${Date.now()}_${file.name}`)
      setter(imageUrl)
      toast.success('Imagen subida correctamente')
    } else if (url) {
      setter(url)
      toast.success('URL guardada')
    }
  }

  const tabs = [
    { id: 'navbar', label: '🧭 Barra Navegación', icon: Menu },
    { id: 'hero', label: '🏠 Portada', icon: Home },
    { id: 'features', label: '✨ Features', icon: Star },
    { id: 'suggestions', label: '🍽️ Sugerencias', icon: Utensils },
    { id: 'cta', label: '🎯 CTA', icon: Heart },
    { id: 'ticker', label: '📢 Línea Informativa', icon: MoveHorizontal },
    { id: 'footer', label: '📞 Footer', icon: Globe },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 p-6 border border-gold/30">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-5 w-5 text-gold" />
              <span className="text-xs font-medium text-gold uppercase tracking-wider">Panel Profesional</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gold">Configuración de la Web</h1>
            <p className="text-gray-400 text-sm mt-1">Personaliza cada área de tu sitio web</p>
          </div>
          <Button onClick={handleSaveAll} disabled={isSaving} className="bg-gold text-black hover:bg-gold-dark">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Guardar todo
          </Button>
        </div>
      </div>

      {/* Tabs de navegación */}
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

      {/* ============ PANEL BARRA DE NAVEGACIÓN ============ */}
      {activeTab === 'navbar' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Menu className="h-5 w-5 text-gold" />
              Barra de Navegación
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personaliza el logo, colores, tamaños y efectos de la barra de navegación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-white font-medium mb-4">🖼️ Logo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Logo actual</Label>
                  <div className="mt-2 p-4 bg-gray-900 rounded-lg flex justify-center">
                    <img src={navbar.logoUrl} alt="Logo" className="h-16 object-contain" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Subir logo</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700 hover:border-gold">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = await uploadImage(file, `logo/${Date.now()}_${file.name}`)
                          setNavbar({...navbar, logoUrl: url})
                        }
                      }} />
                    </label>
                    <div className="flex-1">
                      <Input placeholder="O pega una URL" value={navbar.logoUrl} onChange={(e) => setNavbar({...navbar, logoUrl: e.target.value})} className="bg-gray-900" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Tamaño del logo (px)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min="40" max="160" value={navbar.logoSize} onChange={(e) => setNavbar({...navbar, logoSize: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{navbar.logoSize}px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Posición del logo</Label>
                  <div className="flex gap-2 mt-2">
                    <Button type="button" variant={navbar.logoPosition === 'left' ? 'default' : 'outline'} className="flex-1" onClick={() => setNavbar({...navbar, logoPosition: 'left'})}>Izquierda</Button>
                    <Button type="button" variant={navbar.logoPosition === 'center' ? 'default' : 'outline'} className="flex-1" onClick={() => setNavbar({...navbar, logoPosition: 'center'})}>Centro</Button>
                    <Button type="button" variant={navbar.logoPosition === 'right' ? 'default' : 'outline'} className="flex-1" onClick={() => setNavbar({...navbar, logoPosition: 'right'})}>Derecha</Button>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Redondeo del logo (px)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min="0" max="50" value={navbar.logoRounded} onChange={(e) => setNavbar({...navbar, logoRounded: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{navbar.logoRounded}px</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="text-gray-300">Mostrar nombre</Label>
                    <Switch checked={navbar.showName} onCheckedChange={(checked) => setNavbar({...navbar, showName: checked})} className="mt-2" />
                  </div>
                  {navbar.showName && (
                    <>
                      <div className="flex-1">
                        <Label className="text-gray-300">Texto del nombre</Label>
                        <Input value={navbar.nameText} onChange={(e) => setNavbar({...navbar, nameText: e.target.value})} className="mt-2 bg-gray-900" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-gray-300">Color</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <input type="color" value={navbar.nameColor} onChange={(e) => setNavbar({...navbar, nameColor: e.target.value})} className="h-10 w-10 rounded border" />
                          <Input value={navbar.nameColor} onChange={(e) => setNavbar({...navbar, nameColor: e.target.value})} className="bg-gray-900" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-300">Tamaño (px)</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <input type="range" min="14" max="48" value={navbar.nameSize} onChange={(e) => setNavbar({...navbar, nameSize: parseInt(e.target.value)})} className="flex-1" />
                          <span className="text-gray-400 w-12">{navbar.nameSize}px</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Enlaces */}
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-white font-medium mb-4">🔗 Enlaces del menú</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={navbar.linkColor} onChange={(e) => setNavbar({...navbar, linkColor: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={navbar.linkColor} onChange={(e) => setNavbar({...navbar, linkColor: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Color al pasar ratón</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={navbar.linkColorHover} onChange={(e) => setNavbar({...navbar, linkColorHover: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={navbar.linkColorHover} onChange={(e) => setNavbar({...navbar, linkColorHover: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Tamaño (px)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min="10" max="24" value={navbar.linkSize} onChange={(e) => setNavbar({...navbar, linkSize: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{navbar.linkSize}px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Separación entre enlaces (px)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min="8" max="48" value={navbar.linkSpacing} onChange={(e) => setNavbar({...navbar, linkSpacing: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{navbar.linkSpacing}px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Iconos */}
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-white font-medium mb-4">🎨 Iconos (idioma, tema, admin, menú)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={navbar.iconColor} onChange={(e) => setNavbar({...navbar, iconColor: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={navbar.iconColor} onChange={(e) => setNavbar({...navbar, iconColor: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Color al pasar ratón</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={navbar.iconColorHover} onChange={(e) => setNavbar({...navbar, iconColorHover: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={navbar.iconColorHover} onChange={(e) => setNavbar({...navbar, iconColorHover: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Tamaño (px)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min="16" max="32" value={navbar.iconSize} onChange={(e) => setNavbar({...navbar, iconSize: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{navbar.iconSize}px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fondo y estilos */}
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-white font-medium mb-4">🎨 Fondo y estilos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Color de fondo</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={navbar.navbarBgColor} onChange={(e) => setNavbar({...navbar, navbarBgColor: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={navbar.navbarBgColor} onChange={(e) => setNavbar({...navbar, navbarBgColor: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Desenfoque (blur)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min="0" max="100" value={navbar.navbarBlur} onChange={(e) => setNavbar({...navbar, navbarBlur: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{navbar.navbarBlur}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Color del borde inferior</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={navbar.navbarBorderColor} onChange={(e) => setNavbar({...navbar, navbarBorderColor: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={navbar.navbarBorderColor} onChange={(e) => setNavbar({...navbar, navbarBorderColor: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Grosor del borde (px)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min="0" max="4" value={navbar.navbarBorderWidth} onChange={(e) => setNavbar({...navbar, navbarBorderWidth: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{navbar.navbarBorderWidth}px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Altura de navbar (px)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min="50" max="120" value={navbar.navbarHeight} onChange={(e) => setNavbar({...navbar, navbarHeight: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{navbar.navbarHeight}px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Efecto hover</Label>
                  <select value={navbar.hoverEffect} onChange={(e) => setNavbar({...navbar, hoverEffect: e.target.value})} className="w-full mt-2 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                    {HOVER_EFFECTS.map(effect => <option key={effect.value} value={effect.value}>{effect.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Duración de transición (ms)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min="0" max="500" step="50" value={navbar.transitionDuration} onChange={(e) => setNavbar({...navbar, transitionDuration: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{navbar.transitionDuration}ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vista previa en vivo */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="h-4 w-4 text-green-400" />
                <Label className="text-white font-medium">Vista previa en vivo</Label>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between" style={{ height: `${navbar.navbarHeight}px` }}>
                  <div className="flex items-center gap-3">
                    <img src={navbar.logoUrl} alt="Logo" className="object-contain" style={{ height: `${navbar.logoSize}px`, borderRadius: `${navbar.logoRounded}px` }} />
                    {navbar.showName && (
                      <span style={{ color: navbar.nameColor, fontSize: `${navbar.nameSize}px`, fontFamily: navbar.nameFont }}>{navbar.nameText}</span>
                    )}
                  </div>
                  <div className="flex gap-6">
                    {['Inicio', 'Carta', 'Sugerencias', 'Ubicación'].map((link, i) => (
                      <span key={i} style={{ color: navbar.linkColor, fontSize: `${navbar.linkSize}px` }} className={`hover:${navbar.hoverEffect === 'scale' ? 'hover:scale-105' : navbar.hoverEffect === 'underline' ? 'hover:underline' : ''} transition-all duration-${navbar.transitionDuration}`}>
                        {link}
                      </span>
                    ))}
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: navbar.iconBgColor }}>
                        <Globe style={{ color: navbar.iconColor, width: `${navbar.iconSize}px`, height: `${navbar.iconSize}px` }} />
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: navbar.iconBgColor }}>
                        <Sun style={{ color: navbar.iconColor, width: `${navbar.iconSize}px`, height: `${navbar.iconSize}px` }} />
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: navbar.iconBgColor }}>
                        <Shield style={{ color: navbar.iconColor, width: `${navbar.iconSize}px`, height: `${navbar.iconSize}px` }} />
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: navbar.iconBgColor }}>
                        <Menu style={{ color: navbar.iconColor, width: `${navbar.iconSize}px`, height: `${navbar.iconSize}px` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============ PANEL PORTADA ============ */}
      {activeTab === 'hero' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Home className="h-5 w-5 text-gold" />
              Portada Principal (Héroe)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personaliza la imagen, títulos, botones y efectos de la portada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Imagen de fondo */}
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-white font-medium mb-4">🖼️ Imagen de fondo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Imagen actual</Label>
                  <div className="mt-2 h-32 w-full bg-gray-900 rounded-lg overflow-hidden">
                    {hero.imageUrl && <img src={hero.imageUrl} className="w-full h-full object-cover" />}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Subir/URL</Label>
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-700 hover:border-gold">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="text-sm text-gray-400 ml-2">Subir imagen</span>
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = await uploadImage(file, `hero/${Date.now()}_${file.name}`)
                          setHero({...hero, imageUrl: url})
                        }
                      }} />
                    </label>
                    <Input placeholder="O pega una URL" value={hero.imageUrl} onChange={(e) => setHero({...hero, imageUrl: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Overlay (color)</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={hero.overlayColor} onChange={(e) => setHero({...hero, overlayColor: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={hero.overlayColor} onChange={(e) => setHero({...hero, overlayColor: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Opacidad del overlay (%)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min="0" max="100" value={hero.overlayOpacity} onChange={(e) => setHero({...hero, overlayOpacity: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{hero.overlayOpacity}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Altura de la sección (vh)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min="50" max="100" value={hero.sectionHeight} onChange={(e) => setHero({...hero, sectionHeight: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{hero.sectionHeight}vh</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="text-gray-300">Efecto parallax</Label>
                    <Switch checked={hero.parallax} onCheckedChange={(checked) => setHero({...hero, parallax: checked})} className="mt-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Título */}
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-white font-medium mb-4">📝 Título</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Texto</Label>
                  <Input value={hero.titleText} onChange={(e) => setHero({...hero, titleText: e.target.value})} className="mt-1 bg-gray-900" />
                </div>
                <div>
                  <Label className="text-gray-300">Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={hero.titleColor} onChange={(e) => setHero({...hero, titleColor: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={hero.titleColor} onChange={(e) => setHero({...hero, titleColor: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Tamaño (px)</Label>
                  <div className="flex items-center gap-4 mt-1">
                    <input type="range" min="24" max="120" value={hero.titleSize} onChange={(e) => setHero({...hero, titleSize: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{hero.titleSize}px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Fuente</Label>
                  <select value={hero.titleFont} onChange={(e) => setHero({...hero, titleFont: e.target.value})} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                    {FUENTES.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Peso</Label>
                  <select value={hero.titleWeight} onChange={(e) => setHero({...hero, titleWeight: e.target.value})} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="600">Semi Bold</option>
                    <option value="800">Extra Bold</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Posición</Label>
                  <select value={hero.titlePosition} onChange={(e) => setHero({...hero, titlePosition: e.target.value})} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                    <option value="center">Centro</option>
                    <option value="left">Izquierda</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subtítulo */}
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-white font-medium mb-4">📝 Subtítulo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Texto</Label>
                  <Input value={hero.subtitleText} onChange={(e) => setHero({...hero, subtitleText: e.target.value})} className="mt-1 bg-gray-900" />
                </div>
                <div>
                  <Label className="text-gray-300">Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={hero.subtitleColor} onChange={(e) => setHero({...hero, subtitleColor: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={hero.subtitleColor} onChange={(e) => setHero({...hero, subtitleColor: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Tamaño (px)</Label>
                  <div className="flex items-center gap-4 mt-1">
                    <input type="range" min="14" max="48" value={hero.subtitleSize} onChange={(e) => setHero({...hero, subtitleSize: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{hero.subtitleSize}px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Fuente</Label>
                  <select value={hero.subtitleFont} onChange={(e) => setHero({...hero, subtitleFont: e.target.value})} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                    {FUENTES.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Botón */}
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-white font-medium mb-4">🔘 Botón</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Texto</Label>
                  <Input value={hero.buttonText} onChange={(e) => setHero({...hero, buttonText: e.target.value})} className="mt-1 bg-gray-900" />
                </div>
                <div>
                  <Label className="text-gray-300">Color texto</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={hero.buttonTextColor} onChange={(e) => setHero({...hero, buttonTextColor: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={hero.buttonTextColor} onChange={(e) => setHero({...hero, buttonTextColor: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Color fondo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={hero.buttonBgColor} onChange={(e) => setHero({...hero, buttonBgColor: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={hero.buttonBgColor} onChange={(e) => setHero({...hero, buttonBgColor: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Color hover</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={hero.buttonBgHover} onChange={(e) => setHero({...hero, buttonBgHover: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={hero.buttonBgHover} onChange={(e) => setHero({...hero, buttonBgHover: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Redondeo (px)</Label>
                  <div className="flex items-center gap-4 mt-1">
                    <input type="range" min="0" max="50" value={hero.buttonBorderRadius} onChange={(e) => setHero({...hero, buttonBorderRadius: parseInt(e.target.value)})} className="flex-1" />
                    <span className="text-gray-400 w-12">{hero.buttonBorderRadius}px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vista previa en vivo */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="h-4 w-4 text-green-400" />
                <Label className="text-white font-medium">Vista previa en vivo</Label>
              </div>
              <div className="relative h-64 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${hero.imageUrl || '/default-bg.jpg'})` }} />
                <div className="absolute inset-0" style={{ backgroundColor: hero.overlayColor, opacity: hero.overlayOpacity / 100 }} />
                <div className="relative z-10 flex h-full flex-col items-center justify-center text-center p-4">
                  <h2 style={{ color: hero.titleColor, fontSize: `${hero.titleSize}px`, fontFamily: hero.titleFont, fontWeight: hero.titleWeight }}>{hero.titleText}</h2>
                  <p style={{ color: hero.subtitleColor, fontSize: `${hero.subtitleSize}px`, fontFamily: hero.subtitleFont }} className="mt-2">{hero.subtitleText}</p>
                  <button className="mt-4 px-6 py-2 transition-all" style={{ color: hero.buttonTextColor, backgroundColor: hero.buttonBgColor, borderRadius: `${hero.buttonBorderRadius}px` }}>
                    {hero.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============ PANEL FEATURES ============ */}
      {activeTab === 'features' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-gold" />
              Features (Íconos + Texto)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personaliza los iconos, colores y textos de las características
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">Tipo de icono</Label>
                <select value={features.iconType} onChange={(e) => setFeatures({...features, iconType: e.target.value})} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                  {FEATURE_ICONS.map(icon => <option key={icon.value} value={icon.value}>{icon.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-gray-300">Color del icono</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={features.iconColor} onChange={(e) => setFeatures({...features, iconColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={features.iconColor} onChange={(e) => setFeatures({...features, iconColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Tamaño del icono (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="16" max="64" value={features.iconSize} onChange={(e) => setFeatures({...features, iconSize: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{features.iconSize}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Color del título</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={features.titleColor} onChange={(e) => setFeatures({...features, titleColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={features.titleColor} onChange={(e) => setFeatures({...features, titleColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Tamaño título (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="12" max="32" value={features.titleSize} onChange={(e) => setFeatures({...features, titleSize: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{features.titleSize}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Color descripción</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={features.descColor} onChange={(e) => setFeatures({...features, descColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={features.descColor} onChange={(e) => setFeatures({...features, descColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Columnas</Label>
                <div className="flex gap-2 mt-1">
                  {[2,3,4].map(col => (
                    <Button key={col} type="button" variant={features.columns === col ? 'default' : 'outline'} className="flex-1" onClick={() => setFeatures({...features, columns: col})}>{col}</Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Espaciado (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="16" max="48" value={features.spacing} onChange={(e) => setFeatures({...features, spacing: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{features.spacing}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Efecto hover</Label>
                <select value={features.hoverEffect} onChange={(e) => setFeatures({...features, hoverEffect: e.target.value})} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                  {HOVER_EFFECTS.map(effect => <option key={effect.value} value={effect.value}>{effect.label}</option>)}
                </select>
              </div>
            </div>

            {/* Vista previa en vivo */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="h-4 w-4 text-green-400" />
                <Label className="text-white font-medium">Vista previa en vivo</Label>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${features.columns}, 1fr)`, gap: `${features.spacing}px` }}>
                  {Array.from({ length: features.columns }).map((_, i) => {
                    const IconComponent = FEATURE_ICONS.find(icon => icon.value === features.iconType)?.icon || Star
                    return (
                      <div key={i} className={`text-center transition-all ${features.hoverEffect === 'scale' ? 'hover:scale-105' : features.hoverEffect === 'shadow' ? 'hover:shadow-lg' : ''}`}>
                        <div className="flex justify-center mb-2">
                          <IconComponent style={{ color: features.iconColor, width: `${features.iconSize}px`, height: `${features.iconSize}px` }} />
                        </div>
                        <h3 style={{ color: features.titleColor, fontSize: `${features.titleSize}px`, fontFamily: features.titleFont }}>Título</h3>
                        <p style={{ color: features.descColor, fontSize: `${features.descSize}px`, fontFamily: features.descFont }}>Descripción corta</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============ PANEL SUGERENCIAS ============ */}
      {activeTab === 'suggestions' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Utensils className="h-5 w-5 text-gold" />
              Sugerencias (Productos Destacados)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personaliza las tarjetas de productos destacados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">Título de sección</Label>
                <Input value={suggestions.sectionTitle} onChange={(e) => setSuggestions({...suggestions, sectionTitle: e.target.value})} className="mt-1 bg-gray-900" />
              </div>
              <div>
                <Label className="text-gray-300">Color título</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={suggestions.titleColor} onChange={(e) => setSuggestions({...suggestions, titleColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={suggestions.titleColor} onChange={(e) => setSuggestions({...suggestions, titleColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Tamaño título (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="24" max="72" value={suggestions.titleSize} onChange={(e) => setSuggestions({...suggestions, titleSize: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{suggestions.titleSize}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Fondo tarjeta</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={suggestions.cardBgColor} onChange={(e) => setSuggestions({...suggestions, cardBgColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={suggestions.cardBgColor} onChange={(e) => setSuggestions({...suggestions, cardBgColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Borde tarjeta</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={suggestions.cardBorderColor} onChange={(e) => setSuggestions({...suggestions, cardBorderColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={suggestions.cardBorderColor} onChange={(e) => setSuggestions({...suggestions, cardBorderColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Radio borde (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="0" max="32" value={suggestions.cardBorderRadius} onChange={(e) => setSuggestions({...suggestions, cardBorderRadius: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{suggestions.cardBorderRadius}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Color nombre producto</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={suggestions.productNameColor} onChange={(e) => setSuggestions({...suggestions, productNameColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={suggestions.productNameColor} onChange={(e) => setSuggestions({...suggestions, productNameColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Tamaño nombre (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="12" max="28" value={suggestions.productNameSize} onChange={(e) => setSuggestions({...suggestions, productNameSize: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{suggestions.productNameSize}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Color precio</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={suggestions.productPriceColor} onChange={(e) => setSuggestions({...suggestions, productPriceColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={suggestions.productPriceColor} onChange={(e) => setSuggestions({...suggestions, productPriceColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Tamaño precio (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="12" max="32" value={suggestions.productPriceSize} onChange={(e) => setSuggestions({...suggestions, productPriceSize: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{suggestions.productPriceSize}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Efecto hover tarjeta</Label>
                <select value={suggestions.cardHoverEffect} onChange={(e) => setSuggestions({...suggestions, cardHoverEffect: e.target.value})} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                  {HOVER_EFFECTS.map(effect => <option key={effect.value} value={effect.value}>{effect.label}</option>)}
                </select>
              </div>
            </div>

            {/* Vista previa */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="h-4 w-4 text-green-400" />
                <Label className="text-white font-medium">Vista previa en vivo</Label>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="grid gap-6 grid-cols-3">
                  {[1,2,3].map(i => (
                    <div key={i} className={`rounded-lg overflow-hidden transition-all ${suggestions.cardHoverEffect === 'scale' ? 'hover:scale-105' : suggestions.cardHoverEffect === 'shadow' ? 'hover:shadow-lg' : ''}`} style={{ backgroundColor: suggestions.cardBgColor, border: `1px solid ${suggestions.cardBorderColor}`, borderRadius: `${suggestions.cardBorderRadius}px`, padding: `${suggestions.cardPadding}px` }}>
                      <div className="bg-gray-800 rounded-lg" style={{ borderRadius: `${suggestions.imageRounded}px`, aspectRatio: suggestions.imageAspect as any }} />
                      <h3 style={{ color: suggestions.productNameColor, fontSize: `${suggestions.productNameSize}px`, fontFamily: suggestions.productNameFont }} className="mt-2">Producto {i}</h3>
                      <p style={{ color: suggestions.productPriceColor, fontSize: `${suggestions.productPriceSize}px` }} className="font-bold">€12.90</p>
                      <button className="mt-2 px-4 py-1 text-sm" style={{ color: suggestions.buttonColor, backgroundColor: suggestions.buttonBgColor, borderRadius: `${suggestions.buttonRounded}px` }}>Agregar</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============ PANEL CTA ============ */}
      {activeTab === 'cta' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Heart className="h-5 w-5 text-gold" />
              Llamada a la Acción (CTA)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personaliza la sección de llamada a la acción
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">Título</Label>
                <Input value={cta.titleText} onChange={(e) => setCta({...cta, titleText: e.target.value})} className="mt-1 bg-gray-900" />
              </div>
              <div>
                <Label className="text-gray-300">Color título</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={cta.titleColor} onChange={(e) => setCta({...cta, titleColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={cta.titleColor} onChange={(e) => setCta({...cta, titleColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Tamaño título (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="24" max="72" value={cta.titleSize} onChange={(e) => setCta({...cta, titleSize: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{cta.titleSize}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Subtítulo</Label>
                <Input value={cta.subtitleText} onChange={(e) => setCta({...cta, subtitleText: e.target.value})} className="mt-1 bg-gray-900" />
              </div>
              <div>
                <Label className="text-gray-300">Color subtítulo</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={cta.subtitleColor} onChange={(e) => setCta({...cta, subtitleColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={cta.subtitleColor} onChange={(e) => setCta({...cta, subtitleColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Texto botón</Label>
                <Input value={cta.buttonText} onChange={(e) => setCta({...cta, buttonText: e.target.value})} className="mt-1 bg-gray-900" />
              </div>
              <div>
                <Label className="text-gray-300">Tipo de fondo</Label>
                <select value={cta.bgType} onChange={(e) => setCta({...cta, bgType: e.target.value as 'color' | 'gradient'})} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                  <option value="color">Color sólido</option>
                  <option value="gradient">Gradiente</option>
                </select>
              </div>
              {cta.bgType === 'color' ? (
                <div>
                  <Label className="text-gray-300">Color fondo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={cta.bgColor} onChange={(e) => setCta({...cta, bgColor: e.target.value})} className="h-10 w-10 rounded border" />
                    <Input value={cta.bgColor} onChange={(e) => setCta({...cta, bgColor: e.target.value})} className="bg-gray-900" />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-gray-300">Color inicio gradiente</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={cta.gradientStart} onChange={(e) => setCta({...cta, gradientStart: e.target.value})} className="h-10 w-10 rounded border" />
                      <Input value={cta.gradientStart} onChange={(e) => setCta({...cta, gradientStart: e.target.value})} className="bg-gray-900" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Color fin gradiente</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={cta.gradientEnd} onChange={(e) => setCta({...cta, gradientEnd: e.target.value})} className="h-10 w-10 rounded border" />
                      <Input value={cta.gradientEnd} onChange={(e) => setCta({...cta, gradientEnd: e.target.value})} className="bg-gray-900" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Ángulo (grados)</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="0" max="360" value={cta.gradientAngle} onChange={(e) => setCta({...cta, gradientAngle: parseInt(e.target.value)})} className="flex-1" />
                      <span className="text-gray-400 w-12">{cta.gradientAngle}°</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Vista previa */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="h-4 w-4 text-green-400" />
                <Label className="text-white font-medium">Vista previa en vivo</Label>
              </div>
              <div className="rounded-lg overflow-hidden" style={{
                background: cta.bgType === 'color' ? cta.bgColor : `linear-gradient(${cta.gradientAngle}deg, ${cta.gradientStart}, ${cta.gradientEnd})`,
                height: `${cta.sectionHeight}px`
              }}>
                <div className="flex h-full flex-col items-center justify-center text-center p-4">
                  <h2 style={{ color: cta.titleColor, fontSize: `${cta.titleSize}px`, fontFamily: cta.titleFont }}>{cta.titleText}</h2>
                  <p style={{ color: cta.subtitleColor, fontSize: `${cta.subtitleSize}px`, fontFamily: cta.subtitleFont }} className="mt-2">{cta.subtitleText}</p>
                  <button className="mt-4 px-6 py-2 transition-all" style={{ color: cta.buttonTextColor, backgroundColor: cta.buttonBgColor, borderRadius: `${cta.buttonRounded}px` }}>
                    {cta.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============ PANEL TICKER (LÍNEA INFORMATIVA) ============ */}
      {activeTab === 'ticker' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MoveHorizontal className="h-5 w-5 text-gold" />
              Línea Informativa (Ticker)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configura la línea que se desplaza de extremo a extremo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Activar línea informativa</Label>
                <p className="text-sm text-gray-400">Muestra el ticker en la parte superior o inferior</p>
              </div>
              <Switch checked={ticker.activo} onCheckedChange={(checked) => setTicker({...ticker, activo: checked})} />
            </div>

            {ticker.activo && (
              <>
                <div>
                  <Label className="text-white">Texto</Label>
                  <Textarea value={ticker.texto} onChange={(e) => setTicker({...ticker, texto: e.target.value})} rows={2} className="mt-1 bg-gray-900 border-gray-700 text-white" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Color del texto</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={ticker.colorTexto} onChange={(e) => setTicker({...ticker, colorTexto: e.target.value})} className="h-10 w-10 rounded border" />
                      <Input value={ticker.colorTexto} onChange={(e) => setTicker({...ticker, colorTexto: e.target.value})} className="bg-gray-900" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Color de fondo</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={ticker.colorFondo} onChange={(e) => setTicker({...ticker, colorFondo: e.target.value})} className="h-10 w-10 rounded border" />
                      <Input value={ticker.colorFondo} onChange={(e) => setTicker({...ticker, colorFondo: e.target.value})} className="bg-gray-900" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Tamaño letra (px)</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="10" max="48" value={ticker.tamanioLetra} onChange={(e) => setTicker({...ticker, tamanioLetra: parseInt(e.target.value)})} className="flex-1" />
                      <span className="text-gray-400 w-12">{ticker.tamanioLetra}px</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Tipo de letra</Label>
                    <select value={ticker.tipoLetra} onChange={(e) => setTicker({...ticker, tipoLetra: e.target.value})} className="w-full mt-1 bg-gray-900 border-gray-700 rounded-md p-2 text-white">
                      {FUENTES.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-white">Velocidad (segundos)</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="5" max="30" step="1" value={ticker.velocidad} onChange={(e) => setTicker({...ticker, velocidad: parseInt(e.target.value)})} className="flex-1" />
                      <span className="text-gray-400 w-12">{ticker.velocidad}s</span>
                    </div>
                    <p className="text-xs text-gray-500">Tiempo que tarda en cruzar</p>
                  </div>
                  <div>
                    <Label className="text-white">Tiempo entre repeticiones (s)</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="0" max="10" step="0.5" value={ticker.tiempoEntre} onChange={(e) => setTicker({...ticker, tiempoEntre: parseFloat(e.target.value)})} className="flex-1" />
                      <span className="text-gray-400 w-12">{ticker.tiempoEntre}s</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Altura de la línea (px)</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="24" max="80" step="2" value={ticker.altura} onChange={(e) => setTicker({...ticker, altura: parseInt(e.target.value)})} className="flex-1" />
                      <span className="text-gray-400 w-12">{ticker.altura}px</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Posición</Label>
                    <div className="flex gap-2 mt-1">
                      <Button type="button" variant={ticker.posicion === 'top' ? 'default' : 'outline'} className="flex-1" onClick={() => setTicker({...ticker, posicion: 'top'})}>Arriba</Button>
                      <Button type="button" variant={ticker.posicion === 'bottom' ? 'default' : 'outline'} className="flex-1" onClick={() => setTicker({...ticker, posicion: 'bottom'})}>Abajo</Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Ancho de la línea (%)</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="30" max="100" value={ticker.ancho} onChange={(e) => setTicker({...ticker, ancho: parseInt(e.target.value)})} className="flex-1" />
                      <span className="text-gray-400 w-12">{ticker.ancho}%</span>
                    </div>
                  </div>
                </div>

                {/* Vista previa en vivo */}
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="h-4 w-4 text-green-400" />
                    <Label className="text-white font-medium">Vista previa en vivo</Label>
                  </div>
                  <div className="w-full overflow-hidden rounded-lg" style={{ backgroundColor: ticker.colorFondo, height: `${ticker.altura}px`, width: `${ticker.ancho}%`, margin: '0 auto' }}>
                    <div className="h-full flex items-center">
                      <div className="whitespace-nowrap animate-marquee" style={{ animationDuration: `${ticker.velocidad}s`, fontFamily: ticker.tipoLetra, fontSize: `${ticker.tamanioLetra}px`, color: ticker.colorTexto, display: 'inline-block', padding: '0 20px' }}>
                        {ticker.texto || "Escribe un texto para ver la vista previa..."}
                      </div>
                    </div>
                  </div>
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
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============ PANEL FOOTER ============ */}
      {activeTab === 'footer' && (
        <Card className="border border-gray-800 bg-gray-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-5 w-5 text-gold" />
              Footer
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personaliza el pie de página
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">Color de fondo</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={footer.bgColor} onChange={(e) => setFooter({...footer, bgColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={footer.bgColor} onChange={(e) => setFooter({...footer, bgColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Color del texto</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={footer.textColor} onChange={(e) => setFooter({...footer, textColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={footer.textColor} onChange={(e) => setFooter({...footer, textColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Tamaño texto (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="10" max="24" value={footer.textSize} onChange={(e) => setFooter({...footer, textSize: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{footer.textSize}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Color iconos</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={footer.iconColor} onChange={(e) => setFooter({...footer, iconColor: e.target.value})} className="h-10 w-10 rounded border" />
                  <Input value={footer.iconColor} onChange={(e) => setFooter({...footer, iconColor: e.target.value})} className="bg-gray-900" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Tamaño iconos (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="16" max="32" value={footer.iconSize} onChange={(e) => setFooter({...footer, iconSize: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{footer.iconSize}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Columnas</Label>
                <div className="flex gap-2 mt-1">
                  {[2,3,4].map(col => (
                    <Button key={col} type="button" variant={footer.columns === col ? 'default' : 'outline'} className="flex-1" onClick={() => setFooter({...footer, columns: col})}>{col}</Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Padding superior (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="16" max="96" value={footer.paddingTop} onChange={(e) => setFooter({...footer, paddingTop: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{footer.paddingTop}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Padding inferior (px)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input type="range" min="16" max="96" value={footer.paddingBottom} onChange={(e) => setFooter({...footer, paddingBottom: parseInt(e.target.value)})} className="flex-1" />
                  <span className="text-gray-400 w-12">{footer.paddingBottom}px</span>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Texto copyright</Label>
                <Input value={footer.copyrightText} onChange={(e) => setFooter({...footer, copyrightText: e.target.value})} className="mt-1 bg-gray-900" />
              </div>
            </div>

            {/* Vista previa */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="h-4 w-4 text-green-400" />
                <Label className="text-white font-medium">Vista previa en vivo</Label>
              </div>
              <div className="rounded-lg p-6" style={{ backgroundColor: footer.bgColor }}>
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${footer.columns}, 1fr)`, gap: `${footer.spacing}px` }}>
                  {Array.from({ length: footer.columns }).map((_, i) => (
                    <div key={i}>
                      <h3 style={{ color: footer.textColor, fontSize: `${footer.textSize}px` }}>Columna {i+1}</h3>
                      <p style={{ color: footer.textColor, fontSize: `${footer.textSize}px` }} className="mt-2">Contenido de ejemplo</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t" style={{ borderColor: `${footer.textColor}30` }}>
                  <p style={{ color: footer.copyrightColor, fontSize: `${footer.copyrightSize}px` }} className="text-center">
                    © {new Date().getFullYear()} {footer.copyrightText}. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}