import { z } from 'zod'

import { localNow } from '@/lib/local-time'

// Slot lengths an owner can choose; a booking for a longer service takes several in a row.
export const slotLengths = ['15', '30', '45', '60', '90', '120'] as const

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a time like 09:00 (24-hour).')

const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))

// A day that exists on the calendar: "2026-02-31" has the right shape but rolls over to March.
const isRealDate = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  const parsed = new Date(Date.UTC(y, m - 1, d))
  return parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d
}

// The same day a year from today; slots further ahead are refused (the backend checks it too).
const oneYearAhead = (today: string) => `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`

// Rules for publishing a run of free slots on one day, e.g. 09:00–17:00 in 30 min slots.
export const publishSlotsSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date.')
      .refine(isRealDate, 'Choose a date.')
      .refine((date) => date >= localNow().slice(0, 10), 'Choose today or a later date.')
      .refine((date) => date <= oneYearAhead(localNow().slice(0, 10)), 'Choose a date within a year.'),
    from: time,
    to: time,
    slotMinutes: z.enum(slotLengths, 'Choose a slot length.').transform(Number),
  })
  .superRefine(({ from, to, slotMinutes }, ctx) => {
    if (to <= from) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: 'End after the start time.' })
    } else if (toMinutes(to) - toMinutes(from) < slotMinutes) {
      ctx.addIssue({
        code: 'custom',
        path: ['to'],
        message: `Leave at least ${slotMinutes} min for one slot.`,
      })
    }
  })

export type PublishSlotsInput = z.output<typeof publishSlotsSchema>
