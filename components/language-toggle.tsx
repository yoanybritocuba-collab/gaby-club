'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function LanguageToggle() {
  const { language, setLanguage } = useI18n()
  const [mounted, setMounted] = useState(false)

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ]

  const currentIndex = languages.findIndex(l => l.code === language)
  const nextIndex = (currentIndex + 1) % languages.length
  const nextLanguage = languages[nextIndex]

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = () => {
    setLanguage(nextLanguage.code as any)
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
    <button
      onClick={handleClick}
      className="relative h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-all"
      title={`Cambiar idioma (${nextLanguage.name})`}
    >
      <Globe className="h-5 w-5 text-yellow-500" />
      <span className="absolute -bottom-1 -right-1 text-[10px] leading-none drop-shadow-md">
        {nextLanguage.flag}
      </span>
    </button>
  )
}