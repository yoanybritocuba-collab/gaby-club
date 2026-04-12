'use client'

import { useI18n } from '@/lib/i18n'

export function LanguageToggle() {
  const { language, setLanguage } = useI18n()

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ]

  const handleChange = (code: 'es' | 'en' | 'fr' | 'de' | 'ru') => {
    setLanguage(code)
  }

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code as any)}
          className={`h-9 w-9 rounded-full text-xl transition-all hover:scale-110 ${
            language === lang.code
              ? 'bg-yellow-500/20 ring-2 ring-yellow-500'
              : 'opacity-60 hover:opacity-100'
          }`}
          title={lang.name}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  )
}