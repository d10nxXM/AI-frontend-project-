import { describe, expect, it } from 'vitest'

import type { TimeSlot } from '../types'
import { fitsAt, slotsInRange } from './slot-range'

// 30 min slots on one day from 09:00; `booked` lists the times that are taken.
function day(times: string[], booked: string[] = [], date = '2026-10-21'): TimeSlot[] {
  return times.map((time, i) => ({
    id: i + 1,
    businessId: 1,
    startsAt: `${date}T${time}`,
    durationMinutes: 30,
    status: booked.includes(time) ? 'booked' : 'free',
  }))
}

const free = (slot: TimeSlot) => slot.status === 'free'
const MORNING = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30']

describe('fitsAt', () => {
  it('fits when consecutive free slots cover the duration exactly', () => {
    const slots = day(MORNING, ['11:30'])
    // 09:30 + 120 min ends at 11:30, right where the booked slot starts.
    expect(fitsAt(slots, 1, 120, free)).toBe(true)
  })

  it('does not fit when the duration runs into a booked slot', () => {
    const slots = day(MORNING, ['11:30'])
    expect(fitsAt(slots, 2, 120, free)).toBe(false)
  })

  it('does not fit past closing time (no more slots)', () => {
    const slots = day(MORNING)
    expect(fitsAt(slots, 4, 90, free)).toBe(false)
    expect(fitsAt(slots, 4, 60, free)).toBe(true)
  })

  it('does not fit across a gap between slots', () => {
    const slots = day(['09:00', '09:30', '11:00', '11:30'])
    expect(fitsAt(slots, 0, 90, free)).toBe(false)
  })

  it('a short service fits in one slot', () => {
    expect(fitsAt(day(MORNING), 5, 30, free)).toBe(true)
  })

  it('may reuse the slots of the booking being moved', () => {
    const slots = day(MORNING, ['10:00', '10:30'])
    const ownIds = new Set([3, 4])
    expect(fitsAt(slots, 1, 120, free)).toBe(false)
    expect(fitsAt(slots, 1, 120, (s) => free(s) || ownIds.has(s.id))).toBe(true)
  })
})

describe('slotsInRange', () => {
  it('returns every slot that a booking covers', () => {
    const slots = day(MORNING)
    const covered = slotsInRange(slots, '2026-10-21T09:30', 120).map((s) => s.startsAt.slice(11))
    expect(covered).toEqual(['09:30', '10:00', '10:30', '11:00'])
  })

  it('ignores the same times on another day', () => {
    const slots = [...day(MORNING, [], '2026-10-21'), ...day(MORNING, [], '2026-10-22')]
    expect(slotsInRange(slots, '2026-10-22T09:00', 60)).toHaveLength(2)
    expect(
      slotsInRange(slots, '2026-10-22T09:00', 60).every((s) => s.startsAt.startsWith('2026-10-22')),
    ).toBe(true)
  })
})
