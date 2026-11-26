<template>
  <GenericPopup :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <template #header>
      <div class="d-flex align-center justify-space-between">
        <h2 class="committee-form__title">{{ title }}</h2>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          :aria-label="t('close')"
          @click="close"
        />
      </div>
    </template>

    <div class="committee-form__field">
      <label for="committee-name" class="committee-form__label">
        {{ t('committee.form.fields.name') }}
      </label>
      <v-text-field
        id="committee-name"
        v-model="form.name"
        :placeholder="t('committee.form.placeholders.name')"
        v-bind="fieldProps"
      />
    </div>

    <div class="committee-form__row">
      <div class="committee-form__field">
        <label for="committee-type" class="committee-form__label">
          {{ t('committee.form.fields.type') }}
        </label>
        <v-select id="committee-type" v-model="form.type" :items="typeOptions" v-bind="fieldProps" />
      </div>

      <div class="committee-form__field">
        <label for="committee-unit" class="committee-form__label">
          {{ t('committee.form.fields.unit') }}
        </label>
        <v-autocomplete
          id="committee-unit"
          v-model="form.unit"
          :items="unitOptions"
          append-inner-icon="mdi-magnify"
          v-bind="fieldProps"
        />
      </div>
    </div>

    <div class="committee-form__row">
      <div class="committee-form__field">
        <label for="committee-start-date" class="committee-form__label">
          {{ t('committee.form.fields.startDate') }}
        </label>
        <v-text-field
          id="committee-start-date"
          v-model="form.startDate"
          type="date"
          v-bind="fieldProps"
        />
      </div>

      <div class="committee-form__field">
        <label for="committee-end-date" class="committee-form__label">
          {{ t('committee.form.fields.endDate') }}
        </label>
        <!-- min: the end date cannot be before the start date -->
        <v-text-field
          id="committee-end-date"
          v-model="form.endDate"
          type="date"
          :min="form.startDate"
          v-bind="fieldProps"
        />
      </div>
    </div>

    <div class="committee-form__field">
      <label for="committee-managers" class="committee-form__label">
        {{ t('committee.form.fields.managers') }}
      </label>
      <v-autocomplete
        id="committee-managers"
        v-model="form.managers"
        :items="peopleOptions"
        :placeholder="t('committee.form.placeholders.searchPeople')"
        append-inner-icon="mdi-account-search-outline"
        multiple
        chips
        closable-chips
        v-bind="fieldProps"
      />
    </div>

    <div class="committee-form__field">
      <label for="committee-viewers" class="committee-form__label">
        {{ t('committee.form.fields.viewers') }}
      </label>
      <v-autocomplete
        id="committee-viewers"
        v-model="form.viewers"
        :items="peopleOptions"
        :placeholder="t('committee.form.placeholders.searchPeople')"
        append-inner-icon="mdi-account-search-outline"
        multiple
        chips
        closable-chips
        v-bind="fieldProps"
      />
    </div>

    <div class="committee-form__field">
      <label for="committee-columns" class="committee-form__label">
        {{ t('committee.form.fields.displayColumns') }}
      </label>
      <!-- TODO: drag the chips to change the columns order -->
      <v-autocomplete
        id="committee-columns"
        v-model="form.displayColumns"
        :items="columnOptions"
        :item-props="columnItemProps"
        :placeholder="t('committee.form.placeholders.selectColumns')"
        append-inner-icon="mdi-table-large"
        multiple
        chips
        closable-chips
        v-bind="fieldProps"
      />
    </div>

    <template #footer>
      <Btn
        :text="t('committee.form.save')"
        :isPrimary="true"
        :disabled="saving"
        @clicked="save"
      />
      <button type="button" class="committee-form__cancel" @click="close">
        {{ t('committee.form.cancel') }}
      </button>
    </template>
  </GenericPopup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import GenericPopup from './GenericPopup.vue'
import Btn from './Btn.vue'
import type { Committee, CommitteeForm } from '@/types/treeTypes'

const props = defineProps<{
  modelValue: boolean
  // null = create a new committee, otherwise = edit this committee
  committee: Committee | null
  // true while the committee is being saved on the server - the save button is disabled
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', form: CommitteeForm): void
}>()

const { t } = useI18n()

const isEditMode = computed(() => props.committee !== null)

const title = computed(() =>
  isEditMode.value ? t('committee.form.editTitle') : t('committee.form.createTitle')
)

// Builds a draft from the committee (edit) or an empty draft (create).
// Arrays are copied so editing the draft never changes the original committee.
function toForm(committee: Committee | null): CommitteeForm {
  return {
    name: committee?.name ?? '',
    unit: committee?.unit ?? '',
    type: committee?.type ?? '',
    startDate: committee?.startDate ?? '',
    endDate: committee?.endDate ?? '',
    managers: [...(committee?.managers ?? [])],
    viewers: [...(committee?.viewers ?? [])],
    displayColumns: [...(committee?.displayColumns ?? [])],
  }
}

const form = ref<CommitteeForm>(toForm(null))

// Refill the draft every time the popup opens, so no leftovers remain from the previous time
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) form.value = toForm(props.committee)
  }
)

// Same look for every field in the form
const fieldProps = {
  variant: 'outlined',
  density: 'compact',
  rounded: 'lg',
  bgColor: 'var(--color-bg-lighter)',
  hideDetails: true,
} as const

// TODO: mock options - load them from the server once it exists
const typeOptions = ['ועדת  הוקרה']
const unitOptions = ['פיקוד תקשוב', 'פיקוד צפון', 'פיקוד מרכז', 'פיקוד דרום']
const peopleOptions = ['אלון כהן', 'מיה לוי', 'דור לוי', 'רס"ן ומעלה', 'קציני סגל', 'קציני משא"ן']

// The candidates table columns the user can choose to show
const columnOptions = computed(() => [
  { value: 'name', title: t('candidates.columns.name') },
  { value: 'unit', title: t('candidates.columns.unit') },
  { value: 'rank', title: t('candidates.columns.rank') },
  { value: 'age', title: t('candidates.columns.age') },
  { value: 'tatash', title: t('candidates.columns.tatash') },
  { value: 'notes', title: t('candidates.columns.notes') },
])

const MAX_DISPLAY_COLUMNS = 10

// Once the limit is reached, the columns that are not selected yet are disabled in the list
function columnItemProps(item: { value: string }) {
  const isFull = form.value.displayColumns.length >= MAX_DISPLAY_COLUMNS
  return { disabled: isFull && !form.value.displayColumns.includes(item.value) }
}

function close() {
  emit('update:modelValue', false)
}

// The parent closes the popup only after the server saved the committee,
// so on an error the popup stays open with what the user filled in
function save() {
  emit('save', { ...form.value })
}
</script>

<style scoped>
.committee-form__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-main);
}

.committee-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.committee-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.committee-form__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-main);
}

.committee-form__cancel {
  padding: 0.75rem 1.125rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  background-color: var(--color-error-icon);
  color: var(--color-white);
  transition: opacity 0.2s;
}

.committee-form__cancel:hover {
  opacity: 0.85;
}
</style>
