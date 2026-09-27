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
  'nav.dartos': { es: 'Dardos', en: 'Darts', fr: 'Fléchettes', de: 'Darts', ru: 'Дартс' },
  'nav.reservations': { es: 'Reservas', en: 'Reservations', fr: 'Réservations', de: 'Reservierungen', ru: 'Бронирования' },
  'nav.suggestions': { es: 'Sugerencias', en: 'Suggestions', fr: 'Suggestions', de: 'Empfehlungen', ru: 'Рекомендации' },
  'nav.location': { es: 'Ubicación', en: 'Location', fr: 'Emplacement', de: 'Standort', ru: 'Расположение' },
  'nav.admin': { es: 'Admin', en: 'Admin', fr: 'Admin', de: 'Admin', ru: 'Админ' },

  // Carta page
  'carta.title': { es: 'La Carta', en: 'The Menu', fr: 'La Carte', de: 'Die Karte', ru: 'Меню' },
  'menu.suggestionsCategory': { es: 'Sugerencias del Cantinero', en: "Bartender's Suggestions", fr: 'Suggestions du Barman', de: 'Empfehlungen des Barkeepers', ru: 'Рекомендации бармена' },
  'menu.todo': { es: 'Todo', en: 'All', fr: 'Tout', de: 'Alle', ru: 'Все' },
  'menu.addToOrder': { es: 'Agregar al pedido', en: 'Add to order', fr: 'Ajouter à la commande', de: 'Zur Bestellung hinzufügen', ru: 'Добавить к заказу' },
  'menu.noProducts': { es: 'No hay productos disponibles', en: 'No products available', fr: 'Aucun produit disponible', de: 'Keine Produkte verfügbar', ru: 'Нет доступных продуктов' },
  'menu.noProductsInCategory': { es: 'No hay productos en esta categoría', en: 'No products in this category', fr: 'Aucun produit dans cette catégorie', de: 'Keine Produkte in dieser Kategorie', ru: 'Нет продуктов в этой категории' },
  'menu.gridView': { es: 'Vista en cuadrícula', en: 'Grid view', fr: 'Vue en grille', de: 'Rasteransicht', ru: 'Сетка' },
  'menu.listView': { es: 'Vista en lista', en: 'List view', fr: 'Vue en liste', de: 'Listenansicht', ru: 'Список' },

  // Days
  'day.monday': { es: 'Lunes', en: 'Monday', fr: 'Lundi', de: 'Montag', ru: 'Понедельник' },
  'day.tuesday': { es: 'Martes', en: 'Tuesday', fr: 'Mardi', de: 'Dienstag', ru: 'Вторник' },
  'day.wednesday': { es: 'Miércoles', en: 'Wednesday', fr: 'Mercredi', de: 'Mittwoch', ru: 'Среда' },
  'day.thursday': { es: 'Jueves', en: 'Thursday', fr: 'Jeudi', de: 'Donnerstag', ru: 'Четверг' },
  'day.friday': { es: 'Viernes', en: 'Friday', fr: 'Vendredi', de: 'Freitag', ru: 'Пятница' },
  'day.saturday': { es: 'Sábado', en: 'Saturday', fr: 'Samedi', de: 'Samstag', ru: 'Суббота' },
  'day.sunday': { es: 'Domingo', en: 'Sunday', fr: 'Dimanche', de: 'Sonntag', ru: 'Воскресенье' },
  'day.closed': { es: 'Cerrado', en: 'Closed', fr: 'Fermé', de: 'Geschlossen', ru: 'Закрыто' },

  // Location
  'location.hours': { es: 'Horario', en: 'Hours', fr: 'Horaires', de: 'Öffnungszeiten', ru: 'Часы работы' },
  'location.address': { es: 'Dirección', en: 'Address', fr: 'Adresse', de: 'Adresse', ru: 'Адрес' },
  'location.contact': { es: 'Contacto', en: 'Contact', fr: 'Contact', de: 'Kontakt', ru: 'Контакты' },
  'location.directions': { es: 'Cómo llegar', en: 'Get Directions', fr: 'Itinéraire', de: 'Wegbeschreibung', ru: 'Как добраться' },

  // Hero
  'hero.welcome': { es: 'Bienvenido', en: 'Welcome', fr: 'Bienvenue', de: 'Willkommen', ru: 'Добро пожаловать' },
  'hero.cta.menu': { es: 'Ver Carta', en: 'View Menu', fr: 'Voir la carte', de: 'Menü ansehen', ru: 'Посмотреть меню' },
  'hero.cta.reserve': { es: 'Reservar', en: 'Book', fr: 'Réserver', de: 'Reservieren', ru: 'Забронировать' },

  // Features
  'features.delivery.title': { es: 'Envío a Domicilio', en: 'Delivery', fr: 'Livraison', de: 'Lieferung', ru: 'Доставка' },
  'features.delivery.subtitle': { es: 'Pedidos a toda la ciudad', en: 'City-wide delivery', fr: 'Livraison dans toute la ville', de: 'Lieferung in der ganzen Stadt', ru: 'Доставка по всему городу' },
  'features.homemade.title': { es: 'Sabor Casero', en: 'Homemade', fr: 'Fait maison', de: 'Hausgemacht', ru: 'Домашний' },
  'features.homemade.subtitle': { es: 'Recetas tradicionales', en: 'Traditional recipes', fr: 'Recettes traditionnelles', de: 'Traditionelle Rezepte', ru: 'Традиционные рецепты' },
  'features.quality.title': { es: 'Calidad', en: 'Quality', fr: 'Qualité', de: 'Qualität', ru: 'Качество' },
  'features.quality.subtitle': { es: 'Ingredientes frescos', en: 'Fresh ingredients', fr: 'Ingrédients frais', de: 'Frische Zutaten', ru: 'Свежие ингредиенты' },
  'features.flexible.title': { es: 'Horario Flexible', en: 'Flexible', fr: 'Flexible', de: 'Flexibel', ru: 'Гибкий' },
  'features.flexible.subtitle': { es: 'Todos los días', en: 'Every day', fr: 'Tous les jours', de: 'Jeden Tag', ru: 'Каждый день' },

  // Home
  'home.mostRequested': { es: 'Lo más pedido', en: 'Most requested', fr: 'Les plus demandés', de: 'Am häufigsten bestellt', ru: 'Самые популярные' },
  'home.specialties': { es: 'Especialidades', en: 'Specialties', fr: 'Spécialités', de: 'Spezialitäten', ru: 'Особенности' },
  'home.ofTheHouse': { es: 'de la Casa', en: 'of the House', fr: 'de la Maison', de: 'des Hauses', ru: 'дома' },
  'home.favoritesDescription': { es: 'Los favoritos de nuestros comensales, seleccionados por el cantinero', en: 'Our customers favorites, selected by the bartender', fr: 'Les favoris de nos convives, sélectionnés par le barman', de: 'Die Favoriten unserer Gäste, ausgewählt vom Barkeeper', ru: 'Любимые блюда наших гостей, выбранные барменом' },
  'home.discoverMenu': { es: 'Descubrir toda la carta', en: 'Discover full menu', fr: 'Découvrir toute la carte', de: 'Entdecken Sie die ganze Karte', ru: 'Открыть полное меню' },
  'home.cta.title': { es: '¿Listo para disfrutar?', en: 'Ready to enjoy?', fr: 'Prêt à profiter?', de: 'Bereit zu genießen?', ru: 'Готовы наслаждаться?' },
  'home.cta.subtitle': { es: 'Reserva tu mesa', en: 'Book your table', fr: 'Réservez votre table', de: 'Reservieren Sie Ihren Tisch', ru: 'Забронируйте столик' },
  'home.cta.button': { es: 'Reservar ahora', en: 'Book now', fr: 'Réserver maintenant', de: 'Jetzt buchen', ru: 'Забронировать сейчас' },

  // Footer
  'footer.links': { es: 'Enlaces', en: 'Links', fr: 'Liens', de: 'Links', ru: 'Ссылки' },
  'footer.rights': { es: 'Todos los derechos reservados', en: 'All rights reserved', fr: 'Tous droits réservés', de: 'Alle Rechte vorbehalten', ru: 'Все права защищены' },
  'footer.followUs': { es: 'Síguenos', en: 'Follow Us', fr: 'Suivez-nous', de: 'Folgen Sie uns', ru: 'Подписывайтесь на нас' },

  // Reservations
  'reservations.title': { es: 'Reservar Mesa', en: 'Book a Table', fr: 'Réserver une table', de: 'Tisch reservieren', ru: 'Забронировать стол' },
  'reservations.form.name': { es: 'Nombre completo', en: 'Full name', fr: 'Nom complet', de: 'Vollständiger Name', ru: 'Полное имя' },
  'reservations.form.email': { es: 'Correo electrónico', en: 'Email', fr: 'Email', de: 'E-Mail', ru: 'Электронная почта' },
  'reservations.form.phone': { es: 'Teléfono', en: 'Phone', fr: 'Téléphone', de: 'Telefon', ru: 'Телефон' },
  'reservations.form.date': { es: 'Fecha', en: 'Date', fr: 'Date', de: 'Datum', ru: 'Дата' },
  'reservations.form.time': { es: 'Hora', en: 'Time', fr: 'Heure', de: 'Zeit', ru: 'Время' },
  'reservations.form.guests': { es: 'Número de personas', en: 'Number of guests', fr: 'Nombre de convives', de: 'Anzahl der Gäste', ru: 'Количество гостей' },
  'reservations.form.notes': { es: 'Notas especiales', en: 'Special notes', fr: 'Notes spéciales', de: 'Besondere Hinweise', ru: 'Особые заметки' },
  'reservations.form.submit': { es: 'Confirmar Reserva', en: 'Confirm Reservation', fr: 'Confirmer la réservation', de: 'Reservierung bestätigen', ru: 'Подтвердить бронирование' },
  'reservations.success': { es: 'Reserva enviada con éxito. Te contactaremos pronto.', en: 'Reservation submitted successfully. We will contact you soon.', fr: 'Réservation envoyée avec succès. Nous vous contacterons bientôt.', de: 'Reservierung erfolgreich übermittelt. Wir werden Sie bald kontaktieren.', ru: 'Бронирование успешно отправлено. Мы свяжемся с вами в ближайшее время.' },

  // Admin
  'admin.dashboard': { es: 'Panel de Control', en: 'Dashboard', fr: 'Tableau de bord', de: 'Dashboard', ru: 'Панель управления' },
  'admin.products': { es: 'Productos', en: 'Products', fr: 'Produits', de: 'Produkte', ru: 'Продукты' },
  'admin.categories': { es: 'Categorías', en: 'Categories', fr: 'Catégories', de: 'Kategorien', ru: 'Категории' },
  'admin.configuration': { es: 'Configuración', en: 'Configuration', fr: 'Configuration', de: 'Konfiguration', ru: 'Конфигурация' },
  'admin.users': { es: 'Usuarios', en: 'Users', fr: 'Utilisateurs', de: 'Benutzer', ru: 'Пользователи' },
  'admin.dartReservations': { es: 'Reservas Dardos', en: 'Dart Reservations', fr: 'Réservations Fléchettes', de: 'Dart-Reservierungen', ru: 'Бронирования Дартс' },
  'admin.save': { es: 'Guardar', en: 'Save', fr: 'Enregistrer', de: 'Speichern', ru: 'Сохранить' },
  'admin.cancel': { es: 'Cancelar', en: 'Cancel', fr: 'Annuler', de: 'Abbrechen', ru: 'Отмена' },
  'admin.delete': { es: 'Eliminar', en: 'Delete', fr: 'Supprimer', de: 'Löschen', ru: 'Удалить' },
  'admin.edit': { es: 'Editar', en: 'Edit', fr: 'Modifier', de: 'Bearbeiten', ru: 'Редактировать' },
  'admin.active': { es: 'Activo', en: 'Active', fr: 'Actif', de: 'Aktiv', ru: 'Активный' },
  'admin.inactive': { es: 'Inactivo', en: 'Inactive', fr: 'Inactif', de: 'Inaktiv', ru: 'Неактивный' },

  // Common
  'common.loading': { es: 'Cargando...', en: 'Loading...', fr: 'Chargement...', de: 'Laden...', ru: 'Загрузка...' },
  'common.error': { es: 'Ha ocurrido un error', en: 'An error occurred', fr: 'Une erreur est survenue', de: 'Ein Fehler ist aufgetreten', ru: 'Произошла ошибка' },
  'common.success': { es: 'Operación exitosa', en: 'Success', fr: 'Succès', de: 'Erfolg', ru: 'Успех' },
  'common.added': { es: 'agregado', en: 'added', fr: 'ajouté', de: 'hinzugefügt', ru: 'добавлено' },
  'common.quantity': { es: 'Cantidad', en: 'Quantity', fr: 'Quantité', de: 'Menge', ru: 'Количество' },
  'common.total': { es: 'Total', en: 'Total', fr: 'Total', de: 'Gesamt', ru: 'Итого' },
  'common.since': { es: 'Desde 2024', en: 'Since 2024', fr: 'Depuis 2024', de: 'Seit 2024', ru: 'С 2024 года' },
  'common.back': { es: 'Volver', en: 'Back', fr: 'Retour', de: 'Zurück', ru: 'Назад' },
  'common.confirm': { es: 'Confirmar', en: 'Confirm', fr: 'Confirmer', de: 'Bestätigen', ru: 'Подтвердить' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel', fr: 'Annuler', de: 'Abbrechen', ru: 'Отмена' },
  'common.search': { es: 'Buscar', en: 'Search', fr: 'Rechercher', de: 'Suchen', ru: 'Поиск' },
  'common.filter': { es: 'Filtrar', en: 'Filter', fr: 'Filtrer', de: 'Filtern', ru: 'Фильтр' },
  'common.clearFilters': { es: 'Limpiar filtros', en: 'Clear filters', fr: 'Effacer les filtres', de: 'Filter löschen', ru: 'Очистить фильтры' },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
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
    return key
  }

  if (!isClient) {
    return <div className="min-h-screen bg-black" />
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