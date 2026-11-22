// src/plugins/vuetify.ts
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { colors } from '@/styles/colors'


export const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: 'he',
    rtl: {
      he: true
    }
  },  
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme: {
        colors: {
          primary: colors.primary,
          secondary: colors.darkBlue,
          background: colors.background,
          surface: colors.background,
          error: colors.error,
          info: colors.primary,
          success: colors.teal,
          warning: '#FF9800',
          lightGray: colors.lightGray,
          'on-primary': colors.background,
          'on-secondary': colors.background
        }
      }
    }
  }
})