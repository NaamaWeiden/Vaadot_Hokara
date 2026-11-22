<template>
  <div v-if="visible" class="loading-overlay" :style="{ 'background-color': colors.background }">
    <v-progress-circular class="loader" indeterminate size="70" width="5" />
  </div>
</template>

<script setup lang="ts">
import { colors } from '@/styles/colors'

const props = defineProps({
  visible: { type: Boolean, default: false }
})
</script>

<style scoped>
.loading-overlay {
  z-index: 10;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  inset: 0;
  opacity: 0.7;
}

.loader {
  color: var(--color-primary);
}
</style>
