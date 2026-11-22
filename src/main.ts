import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from './i18n'
import { vuetify } from './plugins/vuetify'

import App from './App.vue'
import router from './router'
import './styles/main.css'
import '@mdi/font/css/materialdesignicons.css'
import { bootstrapApp} from './bootstrap/stores'

async function bootstrap() {
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(vuetify)

bootstrapApp();

app.mount('#app')

}

bootstrap()
