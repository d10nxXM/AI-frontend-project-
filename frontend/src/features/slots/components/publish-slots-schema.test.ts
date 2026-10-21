import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { publishSlotsSchema } from './publish-slots-schema'

const valid = { date: '2026-10-21', from: '09:00', to: '17:00', slotMinutes: '30' }
const errorFor = (input: Record<string, string>) =>
  publishSlotsSchema.safeParse({ ...valid, ...input }).error?.issues[0]?.message

describe('publishSlotsSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 20, 8, 0))
  })
  afterEach(() => vi.useRealTimers())

  it('accepts a day and a time range, with the slot length as a number', () => {
    expect(publishSlotsSchema.parse(valid)).toEqual({ ...valid, slotMinutes: 30 })
  })

  it('accepts today but not a past day', () => {
    expect(errorFor({ date: '2026-10-20' })).toBeUndefined()
    expect(errorFor({ date: '2026-10-19' })).toMatch(/today or a later date/)
    expect(errorFor({ date: '' })).toMatch(/Choose a date/)
  })

  it('needs 24-hour times', () => {
    expect(errorFor({ from: '9:00' })).toMatch(/24-hour/)
    expect(errorFor({ to: '24:00' })).toMatch(/24-hour/)
    expect(errorFor({ from: '08:60' })).toMatch(/24-hour/)
  })

  it('needs the end after the start', () => {
    expect(errorFor({ from: '17:00', to: '09:00' })).toMatch(/End after/)
    expect(errorFor({ from: '09:00', to: '09:00' })).toMatch(/End after/)
  })

  it('needs room for at least one slot', () => {
    expect(errorFor({ from: '09:00', to: '09:45', slotMinutes: '60' })).toMatch(/at least 60 min/)
    expect(errorFor({ from: '09:00', to: '10:00', slotMinutes: '60' })).toBeUndefined()
  })

  it('only takes the offered slot lengths', () => {
    expect(errorFor({ slotMinutes: '25' })).toMatch(/slot length/)
    expect(errorFor({ slotMinutes: '0' })).toMatch(/slot length/)
  })
})
