import { cva } from 'class-variance-authority'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useSlots } from '../api/use-slots'
import type { TimeSlot } from '../types'

const slotVariants = cva('flex flex-col items-center rounded-lg border p-2 text-sm tabular-nums', {
  variants: { status: { free: '', booked: 'bg-muted text-muted-foreground' } },
})

const slotTimeVariants = cva('font-medium', {
  variants: { status: { free: '', booked: 'line-through' } },
})

// startsAt is local time without a zone, so dates are formatted as UTC to keep the day as written.
const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

const formatDay = (date: string) => dayFormat.format(new Date(`${date}T00:00Z`))

function groupByDay(slots: TimeSlot[]) {
  const days = new Map<string, TimeSlot[]>()
  for (const slot of slots) {
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
}

// Day chips and the slot times of the chosen day; booked slots say "Booked", not only a color.
export function SlotsByDay({ businessId }: SlotsByDayProps) {
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
    return <p className="text-destructive">Time slots failed to load. Please try again.</p>
  }

  const days = groupByDay(slots ?? [])
  if (days.every((d) => d.freeCount === 0)) {
    return <p className="text-muted-foreground">No free time slots in the next two weeks.</p>
  }

  // Until the user picks a day, show the first one that still has a free slot.
  const day = days.find((d) => d.date === selectedDate) ?? days.find((d) => d.freeCount > 0) ?? days[0]

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="Day"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0"
      >
        {days.map((d) => (
          <Button
            key={d.date}
            size="sm"
            variant={d.date === day.date ? 'secondary' : 'outline'}
            aria-pressed={d.date === day.date}
            onClick={() => setSelectedDate(d.date)}
            className="shrink-0 flex-col gap-0 py-6 tabular-nums"
          >
            <span>{formatDay(d.date)}</span>
            <span className="text-xs font-normal text-muted-foreground">{d.freeCount} free</span>
          </Button>
        ))}
      </div>

      {day.freeCount === 0 ? (
        <p className="text-muted-foreground">Fully booked on {formatDay(day.date)}. Pick another day.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {day.slots.map((slot) => (
            <li key={slot.id} className={slotVariants({ status: slot.status })}>
              <span className={slotTimeVariants({ status: slot.status })}>{slot.startsAt.slice(11, 16)}</span>
              <span className="text-xs text-muted-foreground">
                {slot.status === 'booked' ? 'Booked' : `${slot.durationMinutes} min`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
