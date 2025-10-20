'use client'

import { useEffect } from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import tr from '../locales/tr/common.json'
import en from '../locales/en/common.json'
import ru from '../locales/ru/common.json'

const resources = {
  tr: { common: tr },
  en: { common: en },
  ru: { common: ru },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr',
    fallbackLng: 'tr',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // i18n initialization is handled above
  }, [])

  return <>{children}</>
}
