import { NotFoundError, delay } from '@/lib/mock-db'

import type { NewTimeSlot, SlotFilter, TimeSlot } from '../types'

// Opening hours and slot length per business id, used only to generate the mock slots.
const schedules: Record<number, { opensAt: number; closesAt: number; slotMinutes: number }> = {
  1: { opensAt: 9, closesAt: 19, slotMinutes: 30 },
  2: { opensAt: 9, closesAt: 20, slotMinutes: 30 },
  3: { opensAt: 7, closesAt: 21, slotMinutes: 60 },
  4: { opensAt: 8, closesAt: 20, slotMinutes: 60 },
  5: { opensAt: 8, closesAt: 16, slotMinutes: 60 },
  6: { opensAt: 10, closesAt: 18, slotMinutes: 60 },
}

const FIRST_DAY = Date.UTC(2026, 9, 20)
const DAYS = 14
const DAY_MS = 24 * 60 * 60 * 1000

// Slots already taken by the mock bookings in features/bookings.
const bookedSlotIds = new Set([10001, 30111, 50300])

const pad = (n: number) => String(n).padStart(2, '0')

// Mock slot ids encode business, day and position: 10001 = business 1, day 0, slot 1.
function generateSlots() {
  return Object.entries(schedules).flatMap(([id, { opensAt, closesAt, slotMinutes }]) => {
    const businessId = Number(id)
    return Array.from({ length: DAYS }, (_, day) => new Date(FIRST_DAY + day * DAY_MS))
      .map((date, day) => ({ date, day }))
      .filter(({ date }) => date.getUTCDay() !== 0)
      .flatMap(({ date, day }) =>
        Array.from({ length: ((closesAt - opensAt) * 60) / slotMinutes }, (_, index): TimeSlot => {
          const minutes = opensAt * 60 + index * slotMinutes
          const slotId = businessId * 10000 + day * 100 + index
          const taken = bookedSlotIds.has(slotId) || (slotId * 7) % 5 === 0
          return {
            id: slotId,
            businessId,
            startsAt: `${date.toISOString().slice(0, 10)}T${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`,
            durationMinutes: slotMinutes,
            status: taken ? 'booked' : 'free',
          }
        }),
      )
  })
}

let slots = generateSlots()

const matches = (slot: TimeSlot, { businessId, date, status }: SlotFilter) =>
  (businessId === undefined || slot.businessId === businessId) &&
  (!date || slot.startsAt.startsWith(date)) &&
  (!status || slot.status === status)

export const slotsApi = {
  list: (filter: SlotFilter = {}) => delay(slots.filter((s) => matches(s, filter))),

  get: (id: number) => {
    const slot = slots.find((s) => s.id === id)
    if (!slot) return Promise.reject(new NotFoundError('TimeSlot', id))
    return delay(slot)
  },

  create: (input: NewTimeSlot) => {
    const slot: TimeSlot = { ...input, id: Date.now(), status: 'free' }
    slots = [...slots, slot].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    return delay(slot)
  },

  update: (id: number, changes: Partial<Omit<TimeSlot, 'id'>>) => {
    slots = slots.map((s) => (s.id === id ? { ...s, ...changes } : s))
    return slotsApi.get(id)
  },

  remove: (id: number) => {
    slots = slots.filter((s) => s.id !== id)
    return delay(undefined)
  },
}
