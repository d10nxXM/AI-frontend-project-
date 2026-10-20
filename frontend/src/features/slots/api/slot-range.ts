import type { TimeSlot } from '../types'

// Minutes since midnight of a local `YYYY-MM-DDTHH:mm` time.
const toMinutes = (startsAt: string) => Number(startsAt.slice(11, 13)) * 60 + Number(startsAt.slice(14, 16))

// The slots of that day whose start falls inside [startsAt, startsAt + durationMinutes).
export function slotsInRange(slots: TimeSlot[], startsAt: string, durationMinutes: number) {
  const day = startsAt.slice(0, 10)
  const start = toMinutes(startsAt)
  return slots.filter((s) => {
    const minutes = toMinutes(s.startsAt)
    return s.startsAt.startsWith(day) && minutes >= start && minutes < start + durationMinutes
  })
}

// True when consecutive slots from daySlots[index] cover durationMinutes without a gap,
// and every one of them passes isAvailable.
export function fitsAt(
  daySlots: TimeSlot[],
  index: number,
  durationMinutes: number,
  isAvailable: (slot: TimeSlot) => boolean,
) {
  let covered = 0
  for (let i = index; i < daySlots.length && covered < durationMinutes; i++) {
    const slot = daySlots[i]
    const previous = daySlots[i - 1]
    const contiguous =
      i === index || toMinutes(slot.startsAt) === toMinutes(previous.startsAt) + previous.durationMinutes
    if (!contiguous || !isAvailable(slot)) return false
    covered += slot.durationMinutes
  }
  return covered >= durationMinutes
}
