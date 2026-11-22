<template>
  <v-menu
    v-model="open"
    location="bottom end"
    origin="top end"
    :close-on-content-click="false"
    :width="168"
    content-class="column-filter-menu-overlay"
  >
    <template #activator="{ props: menuProps }">
      <button
        type="button"
        class="col-filter-trigger"
        :class="{ 'col-filter-trigger--active': filterActive || isSorted }"
        v-bind="menuProps"
        @click.stop
      >
        <span class="col-filter-trigger__label">{{ header.text }}</span>
        <v-icon size="13" :color="filterActive || isSorted ? '#1a56db' : '#94a3b8'"
          >mdi-filter-variant</v-icon
        >
      </button>
    </template>

    <div class="column-filter-menu" dir="rtl">
      <button
        type="button"
        class="cfm-option"
        :class="{ 'cfm-option--active': isSortedAsc }"
        @click="applySort(false)"
      >
        <v-icon size="18" :color="isSortedAsc ? '#fff' : '#1a56db'">{{ sortAscIcon }}</v-icon>
        <span class="cfm-option__label">{{ sortAscLabel }}</span>
      </button>

      <button
        type="button"
        class="cfm-option"
        :class="{ 'cfm-option--active': isSortedDesc }"
        @click="applySort(true)"
      >
        <v-icon size="18" :color="isSortedDesc ? '#fff' : '#1a56db'">{{ sortDescIcon }}</v-icon>
        <span class="cfm-option__label">{{ sortDescLabel }}</span>
      </button>

      <div class="cfm-divider" />

      <div class="cfm-search-wrap">
        <v-icon size="16" color="#cbd5e1" class="cfm-search__icon">mdi-magnify</v-icon>
        <input
          v-model="valueSearch"
          type="text"
          class="cfm-search__input"
          :placeholder="t('population.filterSearch')"
        />
      </div>

      <div class="cfm-divider" />

      <button type="button" class="cfm-value-row" @click="toggleSelectAll">
        <span class="cfm-check" :class="{ 'cfm-check--on': allSelected }" />
        <span class="cfm-value-row__label">{{ t('population.selectAll') }}</span>
      </button>

      <div class="cfm-divider" />

      <div class="cfm-values-list">
        <template v-for="(item, index) in filteredValueOptions" :key="item.raw">
          <button type="button" class="cfm-value-row" @click="toggleValue(item.raw)">
            <span class="cfm-check" :class="{ 'cfm-check--on': isValueSelected(item.raw) }" />
            <span class="cfm-value-row__label">{{ item.display }}</span>
          </button>
          <div v-if="index < filteredValueOptions.length - 1" class="cfm-divider" />
        </template>
      </div>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TableHeader } from '@/types/table'

export interface FilterValueOption {
  raw: string
  display: string
}

const props = defineProps<{
  header: TableHeader
  valueOptions: FilterValueOption[]
  sortField: string
  sortDesc: boolean
  selectedValues?: Set<string> | null
}>()

const emit = defineEmits<{
  sort: [field: string, desc: boolean]
  filter: [field: string, values: Set<string> | null]
}>()

const { t } = useI18n()

const open = ref(false)
const valueSearch = ref('')
const localSelected = ref<Set<string>>(new Set())

const isSorted = computed(() => props.sortField === props.header.value)
const isSortedAsc = computed(() => isSorted.value && !props.sortDesc)
const isSortedDesc = computed(() => isSorted.value && props.sortDesc)

const filterActive = computed(() => {
  if (!props.selectedValues) return false
  return props.selectedValues.size < props.valueOptions.length
})

const sortAscLabel = computed(() => {
  if (props.header.type === 'N') return t('population.sortAscNumber')
  if (props.header.type === 'D') return t('population.sortAscDate')
  return t('population.sortAscText')
})

const sortDescLabel = computed(() => {
  if (props.header.type === 'N') return t('population.sortDescNumber')
  if (props.header.type === 'D') return t('population.sortDescDate')
  return t('population.sortDescText')
})

const sortAscIcon = computed(() => {
  if (props.header.type === 'N') return 'mdi-sort-numeric-ascending'
  if (props.header.type === 'D') return 'mdi-sort-calendar-ascending'
  return 'mdi-sort-alphabetical-ascending'
})

const sortDescIcon = computed(() => {
  if (props.header.type === 'N') return 'mdi-sort-numeric-descending'
  if (props.header.type === 'D') return 'mdi-sort-calendar-descending'
  return 'mdi-sort-alphabetical-descending'
})

const filteredValueOptions = computed(() => {
  if (!valueSearch.value) return props.valueOptions
  const term = valueSearch.value.toLowerCase()
  return props.valueOptions.filter((v) => v.display.toLowerCase().includes(term))
})

const allSelected = computed(
  () =>
    props.valueOptions.length > 0 && props.valueOptions.every((v) => localSelected.value.has(v.raw))
)

watch(open, (isOpen) => {
  if (!isOpen) return
  valueSearch.value = ''
  if (props.selectedValues) {
    localSelected.value = new Set(props.selectedValues)
  } else {
    localSelected.value = new Set(props.valueOptions.map((v) => v.raw))
  }
})

function isValueSelected(raw: string) {
  return localSelected.value.has(raw)
}

function emitFilter() {
  const allRaws = props.valueOptions.map((v) => v.raw)
  if (localSelected.value.size === 0) {
    emit('filter', props.header.value, new Set())
  } else if (localSelected.value.size >= allRaws.length) {
    emit('filter', props.header.value, null)
  } else {
    emit('filter', props.header.value, new Set(localSelected.value))
  }
}

function applySort(desc: boolean) {
  emit('sort', props.header.value, desc)
}

function toggleValue(raw: string) {
  const next = new Set(localSelected.value)
  if (next.has(raw)) next.delete(raw)
  else next.add(raw)
  localSelected.value = next
  emitFilter()
}

function toggleSelectAll() {
  if (allSelected.value) {
    localSelected.value = new Set()
  } else {
    localSelected.value = new Set(props.valueOptions.map((v) => v.raw))
  }
  emitFilter()
}
</script>

<style scoped>
.col-filter-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
}

.col-filter-trigger__label {
  font-size: 0.78rem;
  font-weight: 500;
  white-space: nowrap;
  color: #94a3b8;
}

.col-filter-trigger--active .col-filter-trigger__label {
  color: #1a56db;
}

.column-filter-menu {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.35rem 0;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

/* RTL rows: icon/check flush right, label to its left */
.cfm-option,
.cfm-value-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.85rem;
  border: none;
  background: none;
  cursor: pointer;
}

.cfm-option:hover:not(.cfm-option--active),
.cfm-value-row:hover {
  background: #f8fafc;
}

.cfm-option--active {
  background: #1a56db;
}

.cfm-option--active:hover {
  background: #1a56db;
}

.cfm-option__label,
.cfm-value-row__label {
  font-size: 0.8rem;
  color: #334155;
  white-space: nowrap;
}

.cfm-option--active .cfm-option__label {
  color: #fff;
}

.cfm-divider {
  height: 1px;
  background: #eef2f6;
}

.cfm-search-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
  margin: 0.35rem 0.65rem;
  padding: 0.35rem 0.55rem;
  background: #f1f5f9;
  border-radius: 0.375rem;
  direction: ltr;
}

.cfm-search__icon {
  flex-shrink: 0;
}

.cfm-search__input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.8rem;
  font-family: inherit;
  color: #334155;
  direction: rtl;
  text-align: right;
  min-width: 0;
}

.cfm-search__input::placeholder {
  color: #94a3b8;
}

.cfm-values-list {
  max-height: 9.5rem;
  overflow-y: auto;
}

.cfm-check {
  position: relative;
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid #c8cfe0;
  background: transparent;
  flex-shrink: 0;
}

.cfm-check--on {
  background: #1a56db;
  border-color: #1a56db;
}

.cfm-check--on::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.3rem;
  height: 0.3rem;
  border-radius: 50%;
  background: #fff;
}
</style>

<style>
.column-filter-menu-overlay {
  direction: rtl;
}
</style>
