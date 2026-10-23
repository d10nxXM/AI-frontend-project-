import { cva } from 'class-variance-authority'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { localNow } from '@/lib/local-time'

import { fitsAt, slotsInRange } from '../api/slot-range'
import { useSlots } from '../api/use-slots'
import type { TimeSlot } from '../types'

type SlotState = 'free' | 'tooShort' | 'booked' | 'selected' | 'current'

// Every state differs by text and style, not by color alone (DESIGN.md).
const slotVariants = cva(
  'pressable flex w-full flex-col items-center rounded-xl border p-2 text-sm tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-ring disabled:cursor-not-allowed',
  {
    variants: {
      state: {
        // Before a service is chosen: visibly inactive, but still readable (no opacity).
        free: 'border-transparent bg-card enabled:hover:bg-muted/50 disabled:border-dashed disabled:border-muted-foreground/50 disabled:bg-transparent disabled:text-muted-foreground',
        tooShort: 'border-dashed border-muted-foreground/50 text-muted-foreground',
        booked: 'border-transparent bg-muted text-muted-foreground',
        selected: 'border-transparent bg-primary text-primary-foreground',
        current: 'border-foreground bg-card font-semibold',
      },
    },
  },
)

const slotTimeVariants = cva('font-medium', {
  variants: {
    state: { free: '', tooShort: '', booked: 'line-through', selected: '', current: '' },
  },
})

const slotNoteVariants = cva('text-xs', {
  variants: {
    state: { free: 'text-muted-foreground', tooShort: '', booked: '', selected: '', current: '' },
  },
})

const slotNotes: Partial<Record<SlotState, string>> = {
  tooShort: 'Too short',
  booked: 'Booked',
  selected: 'Selected',
  current: 'Your time',
}

// startsAt is local time without a zone, so dates are formatted as UTC to keep the day as written.
const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

const formatDay = (date: string) => dayFormat.format(new Date(`${date}T00:00Z`))

// The parts of a day chip, styled like the week strip in Apple's Calendar.
const dayParts = (date: string) => {
  const parts = dayFormat.formatToParts(new Date(`${date}T00:00Z`))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return { weekday: part('weekday'), day: part('day'), month: part('month') }
}

// The selected day is filled dark; the label is the same either way, aria-pressed says which.
const dayChipVariants = cva(
  'h-auto w-18 shrink-0 snap-start flex-col gap-0 rounded-2xl px-0 py-2 tabular-nums md:w-auto',
  {
    variants: {
      selected: {
        true: 'bg-foreground text-background hover:bg-foreground/90',
        false: 'bg-card text-foreground hover:bg-muted/50',
      },
    },
  },
)

const dayNoteVariants = cva('text-[0.6875rem] font-medium', {
  variants: { selected: { true: 'text-background/80', false: 'text-muted-foreground' } },
})

// Future slots grouped by day; days with nothing left today are dropped.
function groupByDay(slots: TimeSlot[]) {
  const now = localNow()
  const days = new Map<string, TimeSlot[]>()
  for (const slot of slots) {
    if (slot.startsAt < now) continue
    const date = slot.startsAt.slice(0, 10)
    days.set(date, [...(days.get(date) ?? []), slot])
  }
  return [...days].map(([date, daySlots]) => ({
    date,
    slots: daySlots,
    freeCount: daySlots.filter((s) => s.status === 'free').length,
  }))
}

type SlotsByDayProps = {
  businessId: number
  // Length of the service; a start time is only offered if consecutive free slots cover it.
  durationMinutes?: number
  // With onSelect free slots become buttons; disabled keeps them visible but not clickable.
  selectedId?: number
  // The first slot of the booking being moved; all slots it covers show "Your time".
  currentId?: number
  onSelect?: (slot: TimeSlot) => void
  disabled?: boolean
}

// Day chips and the slot times of the chosen day.
export function SlotsByDay({
  businessId,
  durationMinutes,
  selectedId,
  currentId,
  onSelect,
  disabled = false,
}: SlotsByDayProps) {
  const { data: slots, isLoading, error } = useSlots({ businessId })
  const [selectedDate, setSelectedDate] = useState<string>()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (error) {
    return (
      <p role="alert" className="text-destructive">
        Time slots failed to load. Please try again.
      </p>
    )
  }

  const days = groupByDay(slots ?? [])
  if (days.every((d) => d.freeCount === 0)) {
    return <p className="text-muted-foreground">No free time slots in the next two weeks.</p>
  }

  // Until the user picks a day, show the day of the booking being moved, otherwise the
  // first day that still has a free slot.
  const day =
    days.find((d) => d.date === selectedDate) ??
    days.find((d) => d.slots.some((s) => s.id === currentId)) ??
    days.find((d) => d.freeCount > 0) ??
    days[0]

  const rangeIds = (startId: number | undefined) => {
    const start = day.slots.find((s) => s.id === startId)
    if (!start) return new Set<number>()
    return new Set(
      slotsInRange(day.slots, start.startsAt, durationMinutes ?? start.durationMinutes).map((s) => s.id),
    )
  }
  const currentIds = rangeIds(currentId)
  const selectedIds = rangeIds(selectedId)
  // The booking being moved may overlap its own old time.
  const isAvailable = (slot: TimeSlot) => slot.status === 'free' || currentIds.has(slot.id)

  const stateOf = (slot: TimeSlot, index: number): SlotState => {
    if (currentIds.has(slot.id)) return 'current'
    if (slot.status === 'booked') return 'booked'
    if (selectedIds.has(slot.id)) return 'selected'
    if (durationMinutes && !fitsAt(day.slots, index, durationMinutes, isAvailable)) return 'tooShort'
    return 'free'
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="Day"
        className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-7 md:px-0"
      >
        {days.map((d, index) => {
          const selected = d.date === day.date
          const { weekday, day: dayNumber, month } = dayParts(d.date)
          // The month only where the strip starts or the month changes, like a calendar.
          const showMonth = index === 0 || month !== dayParts(days[index - 1].date).month
          return (
            <Button
              key={d.date}
              variant="outline"
              aria-pressed={selected}
              aria-label={`${formatDay(d.date)}, ${d.freeCount} free`}
              onClick={() => setSelectedDate(d.date)}
              className={dayChipVariants({ selected })}
            >
              <span className={dayNoteVariants({ selected })}>
                {weekday}
                {showMonth && ` ${month}`}
              </span>
              <span className="text-xl leading-tight font-semibold">{dayNumber}</span>
              <span className={dayNoteVariants({ selected })}>{d.freeCount} free</span>
            </Button>
          )
        })}
      </div>

      {day.freeCount === 0 ? (
        <p className="text-muted-foreground">Fully booked on {formatDay(day.date)}. Pick another day.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {day.slots.map((slot, index) => {
            const state = stateOf(slot, index)
            const time = slot.startsAt.slice(11, 16)
            const note = slotNotes[state] ?? `${durationMinutes ?? slot.durationMinutes} min`
            const content = (
              <>
                <span className={slotTimeVariants({ state })}>{time}</span>
                <span className={slotNoteVariants({ state })}>{note}</span>
              </>
            )

            return (
              <li key={slot.id}>
                {onSelect ? (
                  <button
                    type="button"
                    disabled={disabled || (state !== 'free' && state !== 'selected')}
                    aria-pressed={state === 'selected'}
                    aria-label={`${formatDay(day.date)}, ${time}, ${note}`}
                    onClick={() => onSelect(slot)}
                    className={slotVariants({ state })}
                  >
                    {content}
                  </button>
                ) : (
                  <div className={slotVariants({ state })}>{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
