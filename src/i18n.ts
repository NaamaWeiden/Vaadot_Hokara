import { createI18n } from 'vue-i18n'
import he from './locales/he.json'

const messages = {
  he
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'he',
  fallbackLocale: 'he',
  messages
})