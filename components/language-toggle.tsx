'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

export function LanguageToggle() {
  const { language, setLanguage } = useI18n()
  const [isChanging, setIsChanging] = useState(false)

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ]

  const currentLanguage = languages.find(l => l.code === language) || languages[0]
  
  const currentIndex = languages.findIndex(l => l.code === language)
  const nextIndex = (currentIndex + 1) % languages.length
  const nextLanguage = languages[nextIndex]

  const handleClick = () => {
    setIsChanging(true)
    setLanguage(nextLanguage.code as any)
  }

  return (
    <>
      {isChanging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <p className="text-white text-sm">Cambiando idioma...</p>
          </div>
        </div>
      )}
      <button
        onClick={handleClick}
        className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-all text-lg"
        title={`Cambiar a ${nextLanguage.name}`}
      >
        {currentLanguage.flag}
      </button>
    </>
  )
}