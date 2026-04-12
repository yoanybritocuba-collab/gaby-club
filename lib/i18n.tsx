'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Language = 'es' | 'en' | 'fr' | 'de' | 'ru'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<string, Record<Language, string>> = {
  // Navbar
  'nav.home': { es: 'Inicio', en: 'Home', fr: 'Accueil', de: 'Startseite', ru: 'Главная' },
  'nav.menu': { es: 'La Carta', en: 'Menu', fr: 'Menu', de: 'Speisekarte', ru: 'Меню' },
  'nav.reservations': { es: 'Reservas', en: 'Reservations', fr: 'Réservations', de: 'Reservierungen', ru: 'Бронирования' },
  'nav.suggestions': { es: 'Sugerencias', en: 'Suggestions', fr: 'Suggestions', de: 'Empfehlungen', ru: 'Рекомендации' },
  'nav.location': { es: 'Ubicación', en: 'Location', fr: 'Emplacement', de: 'Standort', ru: 'Расположение' },
  'nav.admin': { es: 'Admin', en: 'Admin', fr: 'Admin', de: 'Admin', ru: 'Админ' },

  // Carta page
  'carta.title': { es: 'La Carta', en: 'The Menu', fr: 'La Carte', de: 'Die Karte', ru: 'Меню' },
  'menu.suggestionsCategory': { es: 'Sugerencias del Chef', en: "Chef's Suggestions", fr: 'Suggestions du Chef', de: 'Empfehlungen des Küchenchefs', ru: 'Рекомендации шеф-повара' },
  'menu.todo': { es: 'Todo', en: 'All', fr: 'Tout', de: 'Alle', ru: 'Все' },
  'menu.addToOrder': { es: 'Agregar al pedido', en: 'Add to order', fr: 'Ajouter à la commande', de: 'Zur Bestellung hinzufügen', ru: 'Добавить к заказу' },
  'menu.noProducts': { es: 'No hay productos disponibles', en: 'No products available', fr: 'Aucun produit disponible', de: 'Keine Produkte verfügbar', ru: 'Нет доступных продуктов' },
  'menu.noProductsInCategory': { es: 'No hay productos en esta categoría', en: 'No products in this category', fr: 'Aucun produit dans cette catégorie', de: 'Keine Produkte in dieser Kategorie', ru: 'Нет продуктов в этой категории' },

  // Hero
  'hero.cta.menu': { es: 'Ver Carta', en: 'View Menu', fr: 'Voir la carte', de: 'Menü ansehen', ru: 'Посмотреть меню' },
  'hero.cta.reserve': { es: 'Reservar', en: 'Book', fr: 'Réserver', de: 'Reservieren', ru: 'Забронировать' },

  // Features
  'features.delivery.title': { es: 'Envío a Domicilio', en: 'Delivery', fr: 'Livraison', de: 'Lieferung', ru: 'Доставка' },
  'features.homemade.title': { es: 'Sabor Casero', en: 'Homemade', fr: 'Fait maison', de: 'Hausgemacht', ru: 'Домашний' },
  'features.quality.title': { es: 'Calidad', en: 'Quality', fr: 'Qualité', de: 'Qualität', ru: 'Качество' },
  'features.flexible.title': { es: 'Horario Flexible', en: 'Flexible', fr: 'Flexible', de: 'Flexibel', ru: 'Гибкий' },

  // Home
  'home.mostRequested': { es: 'Lo más pedido', en: 'Most requested', fr: 'Les plus demandés', de: 'Am häufigsten bestellt', ru: 'Самые популярные' },
  'home.specialties': { es: 'Especialidades', en: 'Specialties', fr: 'Spécialités', de: 'Spezialitäten', ru: 'Особенности' },
  'home.ofTheHouse': { es: 'de la Casa', en: 'of the House', fr: 'de la Maison', de: 'des Hauses', ru: 'дома' },
  'home.discoverMenu': { es: 'Descubrir toda la carta', en: 'Discover full menu', fr: 'Découvrir toute la carte', de: 'Entdecken Sie die ganze Karte', ru: 'Открыть полное меню' },
  'home.cta.title': { es: '¿Listo para disfrutar?', en: 'Ready to enjoy?', fr: 'Prêt à profiter?', de: 'Bereit zu genießen?', ru: 'Готовы наслаждаться?' },
  'home.cta.button': { es: 'Reservar ahora', en: 'Book now', fr: 'Réserver maintenant', de: 'Jetzt buchen', ru: 'Забронировать сейчас' },

  // Footer
  'footer.links': { es: 'Enlaces', en: 'Links', fr: 'Liens', de: 'Links', ru: 'Ссылки' },
  'footer.rights': { es: 'Todos los derechos reservados', en: 'All rights reserved', fr: 'Tous droits réservés', de: 'Alle Rechte vorbehalten', ru: 'Все права защищены' },

  // Common
  'common.added': { es: 'agregado', en: 'added', fr: 'ajouté', de: 'hinzugefügt', ru: 'добавлено' },
  'common.quantity': { es: 'Cantidad', en: 'Quantity', fr: 'Quantité', de: 'Menge', ru: 'Количество' },
  'common.total': { es: 'Total', en: 'Total', fr: 'Total', de: 'Gesamt', ru: 'Итого' },
  'common.loading': { es: 'Cargando...', en: 'Loading...', fr: 'Chargement...', de: 'Laden...', ru: 'Загрузка...' },
  'common.confirm': { es: 'Confirmar', en: 'Confirm', fr: 'Confirmer', de: 'Bestätigen', ru: 'Подтвердить' },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')

  useEffect(() => {
    const stored = localStorage.getItem('gaby-club-language') as Language
    if (stored && ['es', 'en', 'fr', 'de', 'ru'].includes(stored)) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('gaby-club-language', lang)
    window.location.reload()
  }

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language]
    }
    console.warn(`Missing translation for key: ${key}`)
    return key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}