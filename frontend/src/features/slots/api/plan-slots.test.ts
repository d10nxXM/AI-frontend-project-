import { describe, expect, it } from 'vitest'

import type { TimeSlot } from '../types'
import { planSlots } from './plan-slots'

const plan = { businessId: 1, date: '2026-10-21', from: '09:00', to: '11:00', slotMinutes: 30 }
const NOW = '2026-10-20T08:00'

const existing = (startsAt: string, durationMinutes = 30, businessId = 1): TimeSlot => ({
  id: 1,
  businessId,
  startsAt,
  durationMinutes,
  status: 'free',
})

const starts = (result: ReturnType<typeof planSlots>) => result.slots.map((s) => s.startsAt.slice(11))

describe('planSlots', () => {
  it('fills the range back to back', () => {
    const result = planSlots(plan, [], NOW)
    expect(starts(result)).toEqual(['09:00', '09:30', '10:00', '10:30'])
    expect(result.slots[0]).toEqual({ businessId: 1, startsAt: '2026-10-21T09:00', durationMinutes: 30 })
    expect(result.skipped).toBe(0)
  })

  it('drops a last slot that would end after the range', () => {
    expect(starts(planSlots({ ...plan, to: '10:45' }, [], NOW))).toEqual(['09:00', '09:30', '10:00'])
  })

  it('skips times that overlap a slot already published that day', () => {
    // 09:45–10:45 overlaps the 09:30, 10:00 and 10:30 slots.
    const result = planSlots(plan, [existing('2026-10-21T09:45', 60)], NOW)
    expect(starts(result)).toEqual(['09:00'])
    expect(result.skipped).toBe(3)
  })

  it('lets slots touch an existing one without overlapping', () => {
    expect(starts(planSlots(plan, [existing('2026-10-21T11:00')], NOW))).toHaveLength(4)
  })

  it('ignores slots of other days and other businesses', () => {
    const others = [existing('2026-10-22T09:00'), existing('2026-10-21T09:00', 30, 2)]
    expect(starts(planSlots(plan, others, NOW))).toHaveLength(4)
  })

  it('skips times that already passed today', () => {
    const result = planSlots(plan, [], '2026-10-21T09:40')
    expect(starts(result)).toEqual(['10:00', '10:30'])
    expect(result.skipped).toBe(2)
  })
})
