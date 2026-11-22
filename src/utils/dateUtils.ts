/**
 * Get an array of years including the current year and the specified number of previous years
 * @param previousYearsCount - Number of previous years to include (default: 2)
 * @returns Array of years in descending order
 */
export function getYearsRange(previousYearsCount: number = 2): number[] {
  const currentYear = new Date().getFullYear()
  const years: number[] = []

  for (let i = 0; i <= previousYearsCount; i++) {
    years.push(currentYear - i)
  }

  return years
}

export function sapStringDateToDate(date: string): Date {
  return new Date(Number(date.slice(0,4)),
                  Number(date.slice(4,6)) - 1,
                  Number(date.slice(6,8)))
}

// SAP "YYYYMMDD" -> "DD/MM/YYYY" ("20260101" -> "01/01/2026").
// SAP sends "00000000" for an empty date - shown as an empty string.
export function formatDateString(raw: string): string {
  if (raw === '00000000') return ''
  if (raw.length !== 8) return raw
  return `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}`
}

// export function toSapDateTime(date: Date): string {
//   return `Date(${date.getTime()})`
// }

export function toOdata(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

export function parseSapDate(sapDate: string): string {
  const match = /\/Date\((\d+)\)\//.exec(sapDate)
  if (!match) return ''
  const date = new Date(Number(match[1]))
  const pad = ((n:number)=> String(n).padStart(2, '0'))
  return `${date.getFullYear()}${pad(date.getMonth() +1)}${pad(date.getDate())}`
}

export function formatSapTime(sapTime: string): string {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(sapTime)
  if(!match) return sapTime

  const hours = (match[1] ?? '0').padStart(2, '0')
  const minutes = (match[2] ?? '0').padStart(2, '0')
  const seconds = (match[3] ?? '0').padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
}


export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}