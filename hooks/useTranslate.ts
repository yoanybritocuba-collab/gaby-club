'use client'

import { useI18n } from '@/lib/i18n'

export function useTranslate() {
  const { language, t } = useI18n()

  const translateText = (key: string): string => {
    return t(key)
  }

  const translateItem = (item: any, field: string): string => {
    if (!item) return ''
    // Los campos traducidos ya vienen en el objeto desde Firestore
    // según el idioma seleccionado
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

  const translateCategory = (category: any): string => {
    if (!category) return ''
    return translateItem(category, 'name')
  }

  const translateProduct = (product: any): { name: string; description: string } => {
    if (!product) return { name: '', description: '' }
    return {
      name: translateItem(product, 'name'),
      description: translateItem(product, 'description')
    }
  }

  return { language, translateText, translateItem, translateCategory, translateProduct }
}