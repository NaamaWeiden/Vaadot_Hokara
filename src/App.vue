<template>
  <v-app>
    <router-view />
    <GenericPopup
      :model-value="appStore.isUnauthorized"
      persistent
      min-width="24rem"
      max-width="24rem"
    >
      <div class="unauthorized-message">
        <v-icon size="48" color="error">mdi-lock</v-icon>
        <h2>{{ t('unauthorized.title') }}</h2>
        <p>{{ t('unauthorized.message') }}</p>
      </div>
    </GenericPopup>
  </v-app>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import GenericPopup from './components/GenericPopup.vue'
import { useAppStore } from './stores/appStore'

const { t } = useI18n()
const appStore = useAppStore()
</script>

<style scoped>
* {
  direction: rtl;
}

.unauthorized-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 1rem;
}
</style>
