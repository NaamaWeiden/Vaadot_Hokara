// Column definition shared by the table header row and ColumnFilterMenu.
// type: S = string, N = number, D = date (YYYYMMDD string)
export interface TableHeader {
  value: string
  text: string
  type: 'S' | 'N' | 'D'
}
