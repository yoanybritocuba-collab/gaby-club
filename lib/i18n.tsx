'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Language = 'es' | 'en' | 'fr' | 'de' | 'ru'

interface Translations {
  [key: string]: {
    es: string
    en: string
    fr: string
    de: string
    ru: string
  }
}

const translations: Translations = {
  // Navigation
  'nav.home': { es: 'Inicio', en: 'Home', fr: 'Accueil', de: 'Startseite', ru: 'Главная' },
  'nav.menu': { es: 'La Carta', en: 'Menu', fr: 'Menu', de: 'Speisekarte', ru: 'Меню' },
  'nav.reservations': { es: 'Reservas', en: 'Reservations', fr: 'Réservations', de: 'Reservierungen', ru: 'Бронирования' },
  'nav.suggestions': { es: 'Sugerencias', en: 'Suggestions', fr: 'Suggestions', de: 'Empfehlungen', ru: 'Рекомендации' },
  'nav.about': { es: 'Sobre Nosotros', en: 'About Us', fr: 'À propos', de: 'Über uns', ru: 'О нас' },
  'nav.location': { es: 'Ubicación', en: 'Location', fr: 'Emplacement', de: 'Standort', ru: 'Расположение' },
  'nav.admin': { es: 'Admin', en: 'Admin', fr: 'Admin', de: 'Admin', ru: 'Админ' },
  'nav.added': { es: 'agregado al pedido', en: 'added to cart', fr: 'ajouté au panier', de: 'zum Warenkorb hinzugefügt', ru: 'добавлено в корзину' },
  
  // Hero
  'hero.title': { es: 'Sabores del Caribe', en: 'Caribbean Flavors', fr: 'Saveurs des Caraïbes', de: 'Karibische Aromen', ru: 'Карибские вкусы' },
  'hero.subtitle': { es: 'Auténtica cocina dominicana en el corazón de Barcelona', en: 'Authentic Dominican cuisine in the heart of Barcelona', fr: 'Cuisine dominicaine authentique au cœur de Barcelone', de: 'Authentische dominikanische Küche im Herzen Barcelonas', ru: 'Аутентичная доминиканская кухня в центре Барселоны' },
  'hero.cta.menu': { es: 'Ver Carta', en: 'View Menu', fr: 'Voir la carte', de: 'Menü ansehen', ru: 'Посмотреть меню' },
  'hero.cta.reserve': { es: 'Reservar Mesa', en: 'Book a Table', fr: 'Réserver une table', de: 'Tisch reservieren', ru: 'Забронировать стол' },
  
  // Menu
  'menu.title': { es: 'Nuestra Carta', en: 'Our Menu', fr: 'Notre carte', de: 'Unsere Speisekarte', ru: 'Наше меню' },
  'menu.subtitle': { es: 'Platos tradicionales dominicanos preparados con amor', en: 'Traditional Dominican dishes prepared with love', fr: 'Plats dominicains traditionnels préparés avec amour', de: 'Traditionelle dominikanische Gerichte mit Liebe zubereitet', ru: 'Традиционные доминиканские блюда, приготовленные с любовью' },
  'menu.suggestions': { es: 'Sugerencias de la Casa', en: 'Chef\'s Suggestions', fr: 'Suggestions du Chef', de: 'Empfehlungen des Küchenchefs', ru: 'Рекомендации шеф-повара' },
  'menu.allergens': { es: 'Alérgenos', en: 'Allergens', fr: 'Allergènes', de: 'Allergene', ru: 'Аллергены' },
  'menu.categories': { es: 'Categorías', en: 'Categories', fr: 'Catégories', de: 'Kategorien', ru: 'Категории' },
  'menu.suggestionsCategory': { es: 'Sugerencias del Chef', en: 'Chef\'s Suggestions', fr: 'Suggestions du Chef', de: 'Empfehlungen des Küchenchefs', ru: 'Рекомендации шеф-повара' },
  'menu.suggestions.description': { es: 'Nuestras recomendaciones especiales para ti', en: 'Our special recommendations for you', fr: 'Nos recommandations spéciales pour vous', de: 'Unsere speziellen Empfehlungen für Sie', ru: 'Наши особые рекомендации для вас' },
  'menu.all.description': { es: 'Todos nuestros platos disponibles', en: 'All our available dishes', fr: 'Tous nos plats disponibles', de: 'Alle unsere verfügbaren Gerichte', ru: 'Все наши доступные блюда' },
  
  // Reservations
  'reservations.title': { es: 'Reservar Mesa', en: 'Book a Table', fr: 'Réserver une table', de: 'Tisch reservieren', ru: 'Забронировать стол' },
  'reservations.subtitle': { es: 'Reserva tu experiencia caribeña', en: 'Reserve your Caribbean experience', fr: 'Réservez votre expérience caribéenne', de: 'Buchen Sie Ihr karibisches Erlebnis', ru: 'Забронируйте свой карибский опыт' },
  'reservations.form.name': { es: 'Nombre completo', en: 'Full name', fr: 'Nom complet', de: 'Vollständiger Name', ru: 'Полное имя' },
  'reservations.form.email': { es: 'Correo electrónico', en: 'Email', fr: 'Email', de: 'E-Mail', ru: 'Электронная почта' },
  'reservations.form.phone': { es: 'Teléfono', en: 'Phone', fr: 'Téléphone', de: 'Telefon', ru: 'Телефон' },
  'reservations.form.date': { es: 'Fecha', en: 'Date', fr: 'Date', de: 'Datum', ru: 'Дата' },
  'reservations.form.time': { es: 'Hora', en: 'Time', fr: 'Heure', de: 'Zeit', ru: 'Время' },
  'reservations.form.guests': { es: 'Número de personas', en: 'Number of guests', fr: 'Nombre de convives', de: 'Anzahl der Gäste', ru: 'Количество гостей' },
  'reservations.form.notes': { es: 'Notas especiales', en: 'Special notes', fr: 'Notes spéciales', de: 'Besondere Hinweise', ru: 'Особые заметки' },
  'reservations.form.submit': { es: 'Confirmar Reserva', en: 'Confirm Reservation', fr: 'Confirmer la réservation', de: 'Reservierung bestätigen', ru: 'Подтвердить бронирование' },
  'reservations.success': { es: 'Reserva enviada con éxito. Te contactaremos pronto.', en: 'Reservation submitted successfully. We will contact you soon.', fr: 'Réservation envoyée avec succès. Nous vous contacterons bientôt.', de: 'Reservierung erfolgreich übermittelt. Wir werden Sie bald kontaktieren.', ru: 'Бронирование успешно отправлено. Мы свяжемся с вами в ближайшее время.' },
  
  // About
  'about.title': { es: 'Sobre Nosotros', en: 'About Us', fr: 'À propos', de: 'Über uns', ru: 'О нас' },
  'about.story.title': { es: 'Nuestra Historia', en: 'Our Story', fr: 'Notre Histoire', de: 'Unsere Geschichte', ru: 'Наша история' },
  'about.story.p1': { es: 'Típico Caribeño nació del sueño de traer los auténticos sabores de la República Dominicana a Barcelona.', en: 'Típico Caribeño was born from the dream of bringing authentic Dominican flavors to Barcelona.', fr: 'Típico Caribeño est né du rêve d\'apporter les saveurs authentiques de la République dominicaine à Barcelone.', de: 'Típico Caribeño wurde aus dem Traum geboren, authentische dominikanische Aromen nach Barcelona zu bringen.', ru: 'Típico Caribeño родился из мечты привезти аутентичные доминиканские вкусы в Барселону.' },
  'about.story.p2': { es: 'Cada plato es preparado con recetas familiares transmitidas por generaciones, usando ingredientes frescos y las especias tradicionales que dan a nuestra cocina su sabor único.', en: 'Each dish is prepared with family recipes passed down through generations, using fresh ingredients and traditional spices that give our cuisine its unique flavor.', fr: 'Chaque plat est préparé avec des recettes familiales transmises de génération en génération, en utilisant des ingrédients frais et des épices traditionnelles qui donnent à notre cuisine sa saveur unique.', de: 'Jedes Gericht wird mit Familienrezepten zubereitet, die über Generationen weitergegeben wurden, unter Verwendung frischer Zutaten und traditioneller Gewürze, die unserer Küche ihren einzigartigen Geschmack verleihen.', ru: 'Каждое блюдо готовится по семейным рецептам, передаваемым из поколения в поколение, с использованием свежих ингредиентов и традиционных специй, которые придают нашей кухне неповторимый вкус.' },
  'about.cuisine.title': { es: 'Nuestra Cocina', en: 'Our Cuisine', fr: 'Notre Cuisine', de: 'Unsere Küche', ru: 'Наша кухня' },
  'about.cuisine.p1': { es: 'La cocina dominicana es una fusión de influencias taínas, españolas y africanas que resulta en sabores únicos y reconfortantes.', en: 'Dominican cuisine is a fusion of Taíno, Spanish and African influences that results in unique and comforting flavors.', fr: 'La cuisine dominicaine est une fusion d\'influences taïnos, espagnoles et africaines qui donne des saveurs uniques et réconfortantes.', de: 'Die dominikanische Küche ist eine Fusion aus Taíno-, spanischen und afrikanischen Einflüssen, die einzigartige und wohltuende Aromen hervorbringt.', ru: 'Доминиканская кухня представляет собой смесь влияний таино, испанцев и африканцев, что придает уникальный и уютный вкус.' },
  
  // Location
  'location.title': { es: 'Encuéntranos', en: 'Find Us', fr: 'Trouvez-nous', de: 'Finden Sie uns', ru: 'Найдите нас' },
  'location.address': { es: 'Dirección', en: 'Address', fr: 'Adresse', de: 'Adresse', ru: 'Адрес' },
  'location.hours': { es: 'Horario', en: 'Opening Hours', fr: 'Horaires', de: 'Öffnungszeiten', ru: 'Часы работы' },
  'location.contact': { es: 'Contacto', en: 'Contact', fr: 'Contact', de: 'Kontakt', ru: 'Контакты' },
  'location.directions': { es: 'Cómo llegar', en: 'Get Directions', fr: 'Itinéraire', de: 'Wegbeschreibung', ru: 'Как добраться' },
  
  // Days of week
  'day.monday': { es: 'Lunes', en: 'Monday', fr: 'Lundi', de: 'Montag', ru: 'Понедельник' },
  'day.tuesday': { es: 'Martes', en: 'Tuesday', fr: 'Mardi', de: 'Dienstag', ru: 'Вторник' },
  'day.wednesday': { es: 'Miércoles', en: 'Wednesday', fr: 'Mercredi', de: 'Mittwoch', ru: 'Среда' },
  'day.thursday': { es: 'Jueves', en: 'Thursday', fr: 'Jeudi', de: 'Donnerstag', ru: 'Четверг' },
  'day.friday': { es: 'Viernes', en: 'Friday', fr: 'Vendredi', de: 'Freitag', ru: 'Пятница' },
  'day.saturday': { es: 'Sábado', en: 'Saturday', fr: 'Samedi', de: 'Samstag', ru: 'Суббота' },
  'day.sunday': { es: 'Domingo', en: 'Sunday', fr: 'Dimanche', de: 'Sonntag', ru: 'Воскресенье' },
  'day.closed': { es: 'Cerrado', en: 'Closed', fr: 'Fermé', de: 'Geschlossen', ru: 'Закрыто' },
  
  // Footer
  'footer.rights': { es: 'Todos los derechos reservados', en: 'All rights reserved', fr: 'Tous droits réservés', de: 'Alle Rechte vorbehalten', ru: 'Все права защищены' },
  'footer.followUs': { es: 'Síguenos', en: 'Follow Us', fr: 'Suivez-nous', de: 'Folgen Sie uns', ru: 'Подписывайтесь на нас' },
  
  // Common
  'common.loading': { es: 'Cargando...', en: 'Loading...', fr: 'Chargement...', de: 'Laden...', ru: 'Загрузка...' },
  'common.error': { es: 'Ha ocurrido un error', en: 'An error occurred', fr: 'Une erreur est survenue', de: 'Ein Fehler ist aufgetreten', ru: 'Произошла ошибка' },
  'common.save': { es: 'Guardar', en: 'Save', fr: 'Enregistrer', de: 'Speichern', ru: 'Сохранить' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel', fr: 'Annuler', de: 'Abbrechen', ru: 'Отмена' },
  'common.edit': { es: 'Editar', en: 'Edit', fr: 'Modifier', de: 'Bearbeiten', ru: 'Редактировать' },
  'common.delete': { es: 'Eliminar', en: 'Delete', fr: 'Supprimer', de: 'Löschen', ru: 'Удалить' },
  'common.add': { es: 'Añadir', en: 'Add', fr: 'Ajouter', de: 'Hinzufügen', ru: 'Добавить' },
  'common.search': { es: 'Buscar', en: 'Search', fr: 'Rechercher', de: 'Suchen', ru: 'Поиск' },
  'common.price': { es: 'Precio', en: 'Price', fr: 'Prix', de: 'Preis', ru: 'Цена' },
  'common.description': { es: 'Descripción', en: 'Description', fr: 'Description', de: 'Beschreibung', ru: 'Описание' },
  'common.status': { es: 'Estado', en: 'Status', fr: 'Statut', de: 'Status', ru: 'Статус' },
  'common.added': { es: 'agregado al pedido', en: 'added to cart', fr: 'ajouté au panier', de: 'zum Warenkorb hinzugefügt', ru: 'добавлено в корзину' },
  'common.quantity': { es: 'Cantidad', en: 'Quantity', fr: 'Quantité', de: 'Menge', ru: 'Количество' },
  'common.total': { es: 'Total', en: 'Total', fr: 'Total', de: 'Gesamt', ru: 'Итого' },
  'common.noProducts': { es: 'Pronto agregaremos nuestros deliciosos platos.', en: 'Soon we will add our delicious dishes.', fr: 'Bientôt nous ajouterons nos délicieux plats.', de: 'Bald werden wir unsere köstlichen Gerichte hinzufügen.', ru: 'Скоро мы добавим наши вкусные блюда.' },
  'common.noCategories': { es: 'No hay categorías con productos disponibles.', en: 'No categories with available products.', fr: 'Aucune catégorie avec des produits disponibles.', de: 'Keine Kategorien mit verfügbaren Produkten.', ru: 'Нет категорий с доступными продуктами.' },
  'common.grid': { es: 'Vista en cuadrícula', en: 'Grid view', fr: 'Vue en grille', de: 'Rasteransicht', ru: 'Сетка' },
  'common.list': { es: 'Vista en lista', en: 'List view', fr: 'Vue en liste', de: 'Listenansicht', ru: 'Список' },
  'common.scrollTop': { es: 'Volver arriba', en: 'Scroll to top', fr: 'Remonter', de: 'Nach oben scrollen', ru: 'Наверх' },
  'common.since': { es: 'Desde 1985', en: 'Since 1985', fr: 'Depuis 1985', de: 'Seit 1985', ru: 'С 1985 года' },
  
  // Carousel
  'carousel.main.title': { es: 'Platos Fuertes', en: 'Main Dishes', fr: 'Plats principaux', de: 'Hauptgerichte', ru: 'Основные блюда' },
  'carousel.main.subtitle': { es: 'Sabores auténticos de la República Dominicana', en: 'Authentic flavors of the Dominican Republic', fr: 'Saveurs authentiques de la République dominicaine', de: 'Authentische Aromen der Dominikanischen Republik', ru: 'Аутентичные вкусы Доминиканской Республики' },
  'carousel.salads.title': { es: 'Ensaladas Frescas', en: 'Fresh Salads', fr: 'Salades fraîches', de: 'Frische Salate', ru: 'Свежие салаты' },
  'carousel.salads.subtitle': { es: 'Ingredientes naturales y saludables', en: 'Natural and healthy ingredients', fr: 'Ingrédients naturels et sains', de: 'Natürliche und gesunde Zutaten', ru: 'Натуральные и полезные ингредиенты' },
  'carousel.drinks.title': { es: 'Bebidas Tropicales', en: 'Tropical Drinks', fr: 'Boissons tropicales', de: 'Tropische Getränke', ru: 'Тропические напитки' },
  'carousel.drinks.subtitle': { es: 'Refrescantes cócteles y jugos naturales', en: 'Refreshing cocktails and natural juices', fr: 'Cocktails rafraîchissants et jus naturels', de: 'Erfrischende Cocktails und natürliche Säfte', ru: 'Освежающие коктейли и натуральные соки' },
  'carousel.desserts.title': { es: 'Postres Caseros', en: 'Homemade Desserts', fr: 'Desserts maison', de: 'Hausgemachte Desserts', ru: 'Домашние десерты' },
  'carousel.desserts.subtitle': { es: 'Dulce tentación tradicional', en: 'Traditional sweet temptation', fr: 'Douce tentation traditionnelle', de: 'Traditionelle süße Versuchung', ru: 'Традиционное сладкое искушение' },
  'carousel.meat.title': { es: 'Parrillada Caribeña', en: 'Caribbean Grill', fr: 'Grillade caribéenne', de: 'Karibischer Grill', ru: 'Карибский гриль' },
  'carousel.meat.subtitle': { es: 'Carnes a la brasa con toque dominicano', en: 'Grilled meats with Dominican touch', fr: 'Viandes grillées avec touche dominicaine', de: 'Gegrilltes Fleisch mit dominikanischer Note', ru: 'Мясо на гриле с доминиканским акцентом' },
  'carousel.grilled.title': { es: 'Carnes Asadas', en: 'Roasted Meats', fr: 'Viandes rôties', de: 'Gebratenes Fleisch', ru: 'Жареное мясо' },
  'carousel.grilled.subtitle': { es: 'Jugosidad y tradición', en: 'Juicy and traditional', fr: 'Juteux et traditionnel', de: 'Saftig und traditionell', ru: 'Сочное и традиционное' },

  // Features
  'features.delivery.title': { es: 'Envío a Domicilio', en: 'Delivery', fr: 'Livraison', de: 'Lieferung', ru: 'Доставка' },
  'features.delivery.subtitle': { es: 'Pedidos a toda la ciudad', en: 'Orders throughout the city', fr: 'Commandes dans toute la ville', de: 'Bestellungen in der ganzen Stadt', ru: 'Заказы по всему городу' },
  'features.homemade.title': { es: 'Sabor Casero', en: 'Homemade Flavor', fr: 'Saveur maison', de: 'Hausgemachter Geschmack', ru: 'Домашний вкус' },
  'features.homemade.subtitle': { es: 'Recetas tradicionales', en: 'Traditional recipes', fr: 'Recettes traditionnelles', de: 'Traditionelle Rezepte', ru: 'Традиционные рецепты' },
  'features.quality.title': { es: 'Calidad Garantizada', en: 'Guaranteed Quality', fr: 'Qualité garantie', de: 'Garantierte Qualität', ru: 'Гарантированное качество' },
  'features.quality.subtitle': { es: 'Ingredientes frescos', en: 'Fresh ingredients', fr: 'Ingrédients frais', de: 'Frische Zutaten', ru: 'Свежие ингредиенты' },
  'features.flexible.title': { es: 'Horario Flexible', en: 'Flexible Schedule', fr: 'Horaires flexibles', de: 'Flexibler Zeitplan', ru: 'Гибкий график' },
  'features.flexible.subtitle': { es: 'Lunes a Domingo', en: 'Monday to Sunday', fr: 'Lundi à dimanche', de: 'Montag bis Sonntag', ru: 'С понедельника по воскресенье' },

  // Home page
  'home.mostRequested': { es: 'Lo más pedido', en: 'Most requested', fr: 'Les plus demandés', de: 'Am häufigsten angefordert', ru: 'Самые популярные' },
  'home.specialties': { es: 'Especialidades', en: 'Specialties', fr: 'Spécialités', de: 'Spezialitäten', ru: 'Особенности' },
  'home.ofTheHouse': { es: 'de la Casa', en: 'of the House', fr: 'de la Maison', de: 'des Hauses', ru: 'дома' },
  'home.favoritesDescription': { es: 'Los favoritos de nuestros comensales, seleccionados por el chef', en: 'Our diners favorites, selected by the chef', fr: 'Les favoris de nos convives, sélectionnés par le chef', de: 'Die Favoriten unserer Gäste, ausgewählt vom Küchenchef', ru: 'Любимые блюда наших гостей, выбранные шеф-поваром' },
  'home.discoverMenu': { es: 'Descubrir toda la carta', en: 'Discover the full menu', fr: 'Découvrir toute la carte', de: 'Entdecken Sie die gesamte Speisekarte', ru: 'Откройте полное меню' },
  'home.cta.title': { es: '¿Listo para una experiencia caribeña?', en: 'Ready for a Caribbean experience?', fr: 'Prêt pour une expérience caribéenne?', de: 'Bereit für ein karibisches Erlebnis?', ru: 'Готовы к карибскому опыту?' },
  'home.cta.subtitle': { es: 'Reserva tu mesa y disfruta de los auténticos sabores de la República Dominicana', en: 'Book your table and enjoy the authentic flavors of the Dominican Republic', fr: 'Réservez votre table et profitez des saveurs authentiques de la République dominicaine', de: 'Buchen Sie Ihren Tisch und genießen Sie die authentischen Aromen der Dominikanischen Republik', ru: 'Забронируйте столик и насладитесь аутентичными вкусами Доминиканской Республики' },
  'home.cta.button': { es: 'Reservar ahora', en: 'Book now', fr: 'Réserver maintenant', de: 'Jetzt buchen', ru: 'Забронировать сейчас' },
  
  // Admin
  'admin.dashboard': { es: 'Panel de Control', en: 'Dashboard', fr: 'Tableau de bord', de: 'Dashboard', ru: 'Панель управления' },
  'admin.sections': { es: 'Secciones', en: 'Sections', fr: 'Sections', de: 'Abschnitte', ru: 'Разделы' },
  'admin.products': { es: 'Productos', en: 'Products', fr: 'Produits', de: 'Produkte', ru: 'Продукты' },
  'admin.combos': { es: 'Combos', en: 'Combos', fr: 'Combos', de: 'Kombos', ru: 'Комбо' },
  'admin.events': { es: 'Eventos', en: 'Events', fr: 'Événements', de: 'Veranstaltungen', ru: 'События' },
  'admin.reservations': { es: 'Reservas', en: 'Reservations', fr: 'Réservations', de: 'Reservierungen', ru: 'Бронирования' },
  'admin.stats.pending': { es: 'Reservas Pendientes', en: 'Pending Reservations', fr: 'Réservations en attente', de: 'Ausstehende Reservierungen', ru: 'Ожидающие бронирования' },
  'admin.stats.products': { es: 'Productos Activos', en: 'Active Products', fr: 'Produits actifs', de: 'Aktive Produkte', ru: 'Активные продукты' },
  'admin.stats.sections': { es: 'Secciones', en: 'Sections', fr: 'Sections', de: 'Abschnitte', ru: 'Разделы' },
  'admin.stats.events': { es: 'Eventos Próximos', en: 'Upcoming Events', fr: 'Événements à venir', de: 'Bevorstehende Veranstaltungen', ru: 'Предстоящие события' },
  
  // Reservation status
  'status.pending': { es: 'Pendiente', en: 'Pending', fr: 'En attente', de: 'Ausstehend', ru: 'Ожидает' },
  'status.confirmed': { es: 'Confirmada', en: 'Confirmed', fr: 'Confirmée', de: 'Bestätigt', ru: 'Подтверждено' },
  'status.cancelled': { es: 'Cancelada', en: 'Cancelled', fr: 'Annulée', de: 'Storniert', ru: 'Отменено' },
  
  // Allergens
  'allergen.gluten': { es: 'Gluten', en: 'Gluten', fr: 'Gluten', de: 'Gluten', ru: 'Глютен' },
  'allergen.dairy': { es: 'Lácteos', en: 'Dairy', fr: 'Produits laitiers', de: 'Milchprodukte', ru: 'Молочные продукты' },
  'allergen.eggs': { es: 'Huevos', en: 'Eggs', fr: 'Œufs', de: 'Eier', ru: 'Яйца' },
  'allergen.fish': { es: 'Pescado', en: 'Fish', fr: 'Poisson', de: 'Fisch', ru: 'Рыба' },
  'allergen.shellfish': { es: 'Mariscos', en: 'Shellfish', fr: 'Crustacés', de: 'Schalentiere', ru: 'Моллюски' },
  'allergen.tree nuts': { es: 'Frutos secos', en: 'Tree nuts', fr: 'Fruits à coque', de: 'Baumnüsse', ru: 'Орехи' },
  'allergen.peanuts': { es: 'Cacahuetes', en: 'Peanuts', fr: 'Cacahuètes', de: 'Erdnüsse', ru: 'Арахис' },
  'allergen.soy': { es: 'Soja', en: 'Soy', fr: 'Soja', de: 'Soja', ru: 'Соя' },

  // Events
  'events.title': { es: 'Próximos Eventos', en: 'Upcoming Events', fr: 'Événements à venir', de: 'Bevorstehende Veranstaltungen', ru: 'Предстоящие события' },
  'events.occupiesVenue': { es: 'Evento privado - Local reservado', en: 'Private event - Venue reserved', fr: 'Événement privé - Lieu réservé', de: 'Private Veranstaltung - Veranstaltungsort reserviert', ru: 'Частное мероприятие - Место забронировано' },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  getLocalizedField: (item: any, field: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')

  useEffect(() => {
    const stored = localStorage.getItem('gaby-club-language') as Language
    if (stored && (stored === 'es' || stored === 'en' || stored === 'fr' || stored === 'de' || stored === 'ru')) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('gaby-club-language', lang)
  }

  const t = (key: string): string => {
    const translation = translations[key]
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`)
      return key
    }
    return translation[language]
  }

  const getLocalizedField = (item: any, field: string): string => {
    if (language === 'en' && item[`${field}En`]) {
      return item[`${field}En`]
    }
    if (language === 'fr' && item[`${field}Fr`]) {
      return item[`${field}Fr`]
    }
    if (language === 'de' && item[`${field}De`]) {
      return item[`${field}De`]
    }
    if (language === 'ru' && item[`${field}Ru`]) {
      return item[`${field}Ru`]
    }
    return item[field] || ''
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, getLocalizedField }}>
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