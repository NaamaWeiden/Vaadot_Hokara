import { defineStore } from 'pinia'
import { i18n } from '@/i18n'
import { sapGatewayMessage } from '@/utils/sapError'

export type NotificationType = 'success' | 'info' | 'warning' | 'error'

export interface NotificationAction {
  text: string
  onClick: () => void
}

// One global snackbar (AppSnackbar in App.vue) - a new message replaces the current one
export const useNotificationStore = defineStore('notification', {
  state: () => ({
    visible: false as boolean,
    message: '' as string,
    type: 'info' as NotificationType,
    action: null as NotificationAction | null,
    // Changes on every message, so the snackbar restarts its timer even when the previous one is still open
    id: 0 as number,
  }),

  actions: {
    show(message: string, type: NotificationType, action?: NotificationAction) {
      this.message = message
      this.type = type
      this.action = action ?? null
      this.id++
      this.visible = true
    },

    success(message: string, action?: NotificationAction) {
      this.show(message, 'success', action)
    },

    info(message: string, action?: NotificationAction) {
      this.show(message, 'info', action)
    },

    warning(message: string, action?: NotificationAction) {
      this.show(message, 'warning', action)
    },

    // Accepts a message or an error from the server - shows the server's message, or a generic one when it has none
    error(errorOrMessage: unknown) {
      const message =
        typeof errorOrMessage === 'string'
          ? errorOrMessage
          : sapGatewayMessage(errorOrMessage) ?? i18n.global.t('notifications.genericError')
      this.show(message, 'error')
    },

    close() {
      this.visible = false
    },
  },
})
