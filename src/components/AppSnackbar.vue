<template>
  <!-- color uses the theme colors (success / info / warning / error) defined in plugins/vuetify.ts -->
  <v-snackbar
    :key="notification.id"
    v-model="notification.visible"
    :color="notification.type"
    :timeout="notification.type === 'error' ? ERROR_TIMEOUT_MS : TIMEOUT_MS"
    location="bottom"
  >
    <div class="d-flex align-center ga-2">
      <v-icon>{{ ICONS[notification.type] }}</v-icon>
      <span>{{ notification.message }}</span>
    </div>

    <template #actions>
      <v-btn v-if="notification.action" variant="text" @click="runAction">
        {{ notification.action.text }}
      </v-btn>
      <v-btn v-else icon="mdi-close" variant="text" size="small" :aria-label="t('close')" @click="notification.close()" />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useNotificationStore, type NotificationType } from '@/stores/notificationStore'

const TIMEOUT_MS = 5000
// Server errors can be long - give the user more time to read them
const ERROR_TIMEOUT_MS = 8000

const ICONS: Record<NotificationType, string> = {
  success: 'mdi-check-circle-outline',
  info: 'mdi-information-outline',
  warning: 'mdi-alert-outline',
  error: 'mdi-alert-circle-outline',
}

const { t } = useI18n()
const notification = useNotificationStore()

function runAction() {
  const action = notification.action
  notification.close()
  action?.onClick()
}
</script>
