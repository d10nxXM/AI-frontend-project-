// Calendar math on `YYYY-MM-DD` dates. They have no zone, so they are read and formatted as UTC
// to keep the day as written (like slots-by-day.tsx).
const DAY_MS = 24 * 60 * 60 * 1000

const toDate = (date: string) => new Date(`${date}T00:00Z`)

export const addDays = (date: string, days: number) =>
  new Date(toDate(date).getTime() + days * DAY_MS).toISOString().slice(0, 10)

// Weeks start on Monday.
export const weekStart = (date: string) => addDays(date, -((toDate(date).getUTCDay() + 6) % 7))

export const weekDays = (date: string) => Array.from({ length: 7 }, (_, i) => addDays(weekStart(date), i))

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

export const formatDay = (date: string) => dayFormat.format(toDate(date))
