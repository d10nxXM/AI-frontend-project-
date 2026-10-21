import { describe, expect, it } from 'vitest'

import { addDays, formatDay, weekDays, weekStart } from './schedule-dates'

describe('schedule dates', () => {
  it('adds days across month ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31')
  })

  it('starts the week on Monday', () => {
    // Tue 20 Oct 2026 and Sun 25 Oct 2026 are in the week of Mon 19 Oct.
    expect(weekStart('2026-10-20')).toBe('2026-10-19')
    expect(weekStart('2026-10-25')).toBe('2026-10-19')
    expect(weekStart('2026-10-19')).toBe('2026-10-19')
  })

  it('lists the seven days of the week', () => {
    expect(weekDays('2026-10-21')).toEqual([
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
    ])
  })

  it('formats the day as written, whatever the time zone', () => {
    expect(formatDay('2026-10-20')).toBe('Tue 20 Oct')
  })
})
