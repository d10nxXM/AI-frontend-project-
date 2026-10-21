import type { NewTimeSlot, TimeSlot } from '../types'

export type SlotPlan = {
  businessId: number
  date: string
  from: string
  to: string
  slotMinutes: number
}

const pad = (n: number) => String(n).padStart(2, '0')
const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))
const toTime = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`

// The free slots to create for one day: back to back from `from` until the last one that ends
// by `to`. Times that already passed, or that overlap a slot of that day, are skipped.
export function planSlots(plan: SlotPlan, existing: TimeSlot[], now: string) {
  const taken = existing
    .filter((s) => s.businessId === plan.businessId && s.startsAt.startsWith(plan.date))
    .map((s) => {
      const start = toMinutes(s.startsAt.slice(11, 16))
      return { start, end: start + s.durationMinutes }
    })

  const slots: NewTimeSlot[] = []
  let skipped = 0
  const last = toMinutes(plan.to) - plan.slotMinutes
  for (let start = toMinutes(plan.from); start <= last; start += plan.slotMinutes) {
    const end = start + plan.slotMinutes
    const startsAt = `${plan.date}T${toTime(start)}`
    if (startsAt < now || taken.some((t) => start < t.end && t.start < end)) {
      skipped++
      continue
    }
    slots.push({ businessId: plan.businessId, startsAt, durationMinutes: plan.slotMinutes })
  }
  return { slots, skipped }
}
