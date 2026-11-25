import { computed, reactive, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { Candidate, CandidateGroup } from '@/types/candidates'
import type { TableHeader } from '@/types/table'
import type { FilterValueOption } from '@/components/ColumnFilterMenu.vue'
import { getCandidateValue, formatCandidateValue, compareCandidateValues } from '@/utils/candidates.utils'

const SUGGESTIONS_LIMIT = 8

// Search, column filter and sort for the candidates table, applied inside every group.
// Based on usePopulationTable from allocation-infrastructure (without pagination).
export function useCandidatesTable(
  groupsSource: MaybeRefOrGetter<CandidateGroup[]>,
  columnsSource: MaybeRefOrGetter<TableHeader[]>,
  defaultSort = { sortBy: 'name', desc: false }
) {
  const search = ref('')
  const sortBy = ref(defaultSort.sortBy)
  const sortDesc = ref(defaultSort.desc)
  const columnFilters = reactive<Record<string, Set<string>>>({})

  function matchesSearch(candidate: Candidate, term: string): boolean {
    return [candidate.name, candidate.pernr, candidate.unit, candidate.rank].some((value) =>
      value.toLowerCase().includes(term)
    )
  }

  // An empty Set means "nothing selected" -> the row is hidden, like in the original table
  function matchesColumnFilters(candidate: Candidate): boolean {
    return toValue(columnsSource).every((column) => {
      const selected = columnFilters[column.value]
      return !selected || selected.has(getCandidateValue(candidate, column.value))
    })
  }

  function compareCandidates(a: Candidate, b: Candidate): number {
    const column = toValue(columnsSource).find((c) => c.value === sortBy.value)
    if (!column) return 0
    const result = compareCandidateValues(
      getCandidateValue(a, column.value),
      getCandidateValue(b, column.value),
      column
    )
    return sortDesc.value ? -result : result
  }

  const visibleGroups = computed<CandidateGroup[]>(() => {
    const term = search.value.trim().toLowerCase()
    return toValue(groupsSource).map((group) => ({
      ...group,
      candidates: group.candidates
        .filter((candidate) => !term || matchesSearch(candidate, term))
        .filter(matchesColumnFilters)
        .sort(compareCandidates),
    }))
  })

  // Suggestions under the search field: the first matching candidates in table order
  // (visibleGroups is already searched, column-filtered and sorted). Empty while nothing is typed.
  const suggestions = computed<Candidate[]>(() => {
    if (!search.value.trim()) return []
    return visibleGroups.value.flatMap((group) => group.candidates).slice(0, SUGGESTIONS_LIMIT)
  })

  const visibleCount = computed(() =>
    visibleGroups.value.reduce((count, group) => count + group.candidates.length, 0)
  )

  // All distinct values of a column (across all groups), for the column filter menu
  function getValueOptions(column: TableHeader): FilterValueOption[] {
    const map = new Map<string, string>()
    for (const group of toValue(groupsSource)) {
      for (const candidate of group.candidates) {
        const raw = getCandidateValue(candidate, column.value)
        map.set(raw, formatCandidateValue(raw, column))
      }
    }
    return [...map.entries()]
      .map(([raw, display]) => ({ raw, display }))
      .sort((a, b) => compareCandidateValues(a.raw, b.raw, column))
  }

  function setSort(field: string, desc: boolean) {
    sortBy.value = field
    sortDesc.value = desc
  }

  function setFilter(field: string, values: Set<string> | null) {
    if (!values) {
      delete columnFilters[field]
    } else {
      columnFilters[field] = values
    }
  }

  // Clears the search and every column filter, so all the candidates are shown
  function resetFilters() {
    search.value = ''
    for (const field of Object.keys(columnFilters)) {
      delete columnFilters[field]
    }
  }

  return {
    search,
    sortBy,
    sortDesc,
    columnFilters,
    visibleGroups,
    visibleCount,
    suggestions,
    getValueOptions,
    setSort,
    setFilter,
    resetFilters,
  }
}
