<template>
  <button
    :class="['btn', isPrimary ? 'btn-primary' : 'btn-secondary']"
    :disabled="disabled"
    :title="text"
    @click="emit('clicked')"
  >
    <span class="btn-text">{{ text }}</span>
    <v-icon class="btn-icon" v-if="icon">{{ icon }}</v-icon>
    <span v-if="badge !== undefined" class="btn-badge">{{ badge }}</span>
  </button>
</template>

<script lang="ts" setup>
interface Props {
  text: string
  icon?: string
  disabled?: boolean
  isPrimary?: boolean
  badge?: number
}

const props = defineProps<Props>()

const emit = defineEmits(['clicked'])
</script>

<style scoped>
.btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0.75rem 1.125rem;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  color: var(--color-primary);
  width: fit-content;
  position: relative;
}

.btn-badge {
  position: absolute;
  top: -0.35rem;
  left: -0.35rem;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e8b04b;
  border: 2px solid #20213b;
  color: #20213b;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}
.btn-primary:not(:disabled):hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}
.btn-secondary:not(:disabled):hover {
  background-color: var(--color-primary-light-hover);
}
</style>
