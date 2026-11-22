<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="updateValue"
    width="auto"
    :min-width="minWidth"
    :max-width="maxWidth"
    :persistent="persistent"
    :scroll-strategy="scrollStrategy"
    :retain-focus="retainFocus"
    dir="rtl"
  >
    <div class="generic-popup" dir="rtl">
      <div v-if="$slots.header" class="generic-popup__header">
        <slot name="header" />
      </div>

      <div class="generic-popup__body" :class="{ 'generic-popup__body--no-padding': noPadding }">
        <slot />
      </div>

      <div v-if="$slots.footer" class="generic-popup__footer">
        <slot name="footer" />
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  maxWidth: { type: String, default: '36rem' },
  minWidth: { type: String, default: '36rem' },
  persistent: { type: Boolean, default: false },
  noPadding: { type: Boolean, default: false },
  scrollStrategy: {
    type: String as PropType<'block' | 'close' | 'none' | 'reposition'>,
    default: 'none'
  },
  retainFocus: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue'])

function updateValue(value: boolean) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.generic-popup {
  background-color: var(--color-white);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  box-shadow:
    0 1rem 2.5rem -0.3125rem rgba(0, 0, 0, 0.1),
    0 0.5rem 0.625rem -0.375rem rgba(0, 0, 0, 0.1);
}

.generic-popup__header,
.generic-popup__footer {
  padding: 1rem 2rem;
  flex-shrink: 0;
  background-color: var(--color-bg-lighter);
  border-top: 1px solid var(--color-border-main);
}

.generic-popup__body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

.generic-popup__body--no-padding {
  padding: 0;
  gap: 0;
}

.generic-popup__footer {
  /* background-color: var(--color-bg-lighter);
  border-top: 1px solid var(--color-border-main); */
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}
</style>
