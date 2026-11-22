<template>
  <div class="no-content-container">
    <img class="alligator" src="@/assets/alligator.png" />
    <span>{{ text || t('noResults') }}</span>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({
  text: {
    type: String,
    required: false
  }
})
</script>

<style scoped>
.no-content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-muted);
}

.alligator {
  width: 10rem;
  height: 10rem;
}
</style>
