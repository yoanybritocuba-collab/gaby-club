'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function LanguageToggle() {
  const { language, setLanguage } = useI18n()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ]

  const currentLanguage = languages.find(l => l.code === language) || languages[0]

  const handleChange = (code: 'es' | 'en' | 'fr' | 'de' | 'ru') => {
    setLanguage(code)
    window.location.reload()
  }

  if (!mounted) {
    return (
      <button className="relative h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center">
        <Globe className="h-5 w-5 text-yellow-500" />
      </button>
    )
  }

  return (
    <div className="relative group">
      {/* Botón principal con mundo y bandera pequeña */}
      <button className="relative h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-all">
        <Globe className="h-5 w-5 text-yellow-500" />
        <span className="absolute -bottom-1 -right-1 text-[10px] leading-none drop-shadow-md">
          {currentLanguage.flag}
        </span>
      </button>

      {/* Menú desplegable con todas las banderas */}
      <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50">
        <div className="bg-gray-950 border border-gray-800 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                language === lang.code
                  ? 'bg-yellow-500/20 text-yellow-500'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto text-yellow-500">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}