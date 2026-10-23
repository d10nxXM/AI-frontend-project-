import { cva } from 'class-variance-authority'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { localNow } from '@/lib/local-time'

import { SlotBookedError, useDeleteSlot, useSlots } from '../api/use-slots'
import type { TimeSlot } from '../types'
import { DeleteSlotButton } from './delete-slot-button'
import { addDays, formatDay, weekDays } from './schedule-dates'

type Mode = 'day' | 'week'
type OwnerSlotState = 'free' | 'booked' | 'past'

// Status is written out, never shown by color alone (DESIGN.md).
const stateLabels: Record<OwnerSlotState, string> = { free: 'Free', booked: 'Booked', past: 'Past' }

const chipVariants = cva(
  'flex items-center justify-between gap-2 rounded-lg border px-2 py-1 text-sm tabular-nums',
  {
    variants: {
      state: {
        free: 'border-border',
        booked: 'border-transparent bg-secondary text-muted-foreground',
        past: 'border-dashed border-muted-foreground/50 text-muted-foreground',
      },
    },
  },
)

// A segmented control: a gray track, the chosen segment a raised thumb (aria-pressed says which).
const segmentClassName =
  'pressable h-8 rounded-full px-4 text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring aria-pressed:bg-card aria-pressed:font-semibold aria-pressed:text-foreground aria-pressed:shadow-sm dark:aria-pressed:bg-popover'

type OwnerScheduleProps = {
  businessId: number
  // The day shown (in week view: a day of the shown week).
  date: string
  onDateChange: (date: string) => void
}

// The owner's published slots by day or by week; free future slots can be deleted.
export function OwnerSchedule({ businessId, date, onDateChange }: OwnerScheduleProps) {
  const headingId = useId()
  const [mode, setMode] = useState<Mode>('day')
  const [message, setMessage] = useState('')
  const messageRef = useRef<HTMLParagraphElement>(null)
  const { data: slots, isLoading, error } = useSlots({ businessId })
  const deleteSlot = useDeleteSlot()

  const now = localNow()
  const today = now.slice(0, 10)
  const days = mode === 'day' ? [date] : weekDays(date)
  const step = mode === 'day' ? 1 : 7
  const rangeLabel = mode === 'day' ? formatDay(date) : `${formatDay(days[0])} – ${formatDay(days[6])}`

  const stateOf = (slot: TimeSlot): OwnerSlotState =>
    slot.status === 'booked' ? 'booked' : slot.startsAt < now ? 'past' : 'free'

  const slotsOn = (day: string) => (slots ?? []).filter((s) => s.startsAt.startsWith(day))

  // The deleted row and its button are gone, so focus moves to the confirmation instead.
  useEffect(() => {
    if (message) messageRef.current?.focus()
  }, [message])

  const remove = (slot: TimeSlot) => {
    setMessage('')
    deleteSlot.mutate(slot.id, {
      onSuccess: () => setMessage(`${formatDay(date)}, ${slot.startsAt.slice(11, 16)} deleted.`),
    })
  }

  // Messages are about the day they happened on, so they go when another day is shown.
  const changeDate = (next: string) => {
    setMessage('')
    deleteSlot.reset()
    onDateChange(next)
  }

  function body() {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-2xl" />
          ))}
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

    if (days.every((day) => slotsOn(day).length === 0)) {
      return (
        <p className="rounded-2xl bg-card p-4 text-muted-foreground">
          {mode === 'day' ? 'No time slots on this day.' : 'No time slots in this week.'} Publish some above.
        </p>
      )
    }

    if (mode === 'day') {
      return (
        <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-card">
          {slotsOn(date).map((slot) => {
            const state = stateOf(slot)
            const time = slot.startsAt.slice(11, 16)
            return (
              <li key={slot.id} className="flex min-h-14 items-center gap-4 px-4 py-2">
                <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 tabular-nums">
                  <span className="font-semibold">{time}</span>
                  <span className="text-sm text-muted-foreground">{slot.durationMinutes} min</span>
                </span>
                {/* A fixed column, so "Free", "Booked" and "Past" line up from row to row. */}
                <span className="w-16 shrink-0">
                  <Badge variant={state === 'free' ? 'outline' : 'secondary'}>{stateLabels[state]}</Badge>
                </span>
                {/* Booked slots belong to a client and past ones cannot be booked anymore. */}
                <span className="w-24 shrink-0 text-right">
                  {state === 'free' && (
                    <DeleteSlotButton
                      label={`${formatDay(date)}, ${time}`}
                      time={time}
                      pending={deleteSlot.isPending && deleteSlot.variables === slot.id}
                      onConfirm={() => remove(slot)}
                    />
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )
    }

    // Week: stacked days on phones, seven columns on desktop. Delete from the day view.
    return (
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-7 lg:gap-2">
        {days.map((day) => {
          const daySlots = slotsOn(day)
          const free = daySlots.filter((s) => stateOf(s) === 'free').length
          const booked = daySlots.filter((s) => s.status === 'booked').length
          return (
            <li key={day} className="flex min-w-0 flex-col gap-2 rounded-2xl bg-card p-3 lg:p-2">
              <button
                type="button"
                onClick={() => {
                  changeDate(day)
                  setMode('day')
                }}
                aria-label={`${formatDay(day)}: ${free} free, ${booked} booked. Open day`}
                className="pressable flex flex-col items-start rounded-lg p-1 text-left outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring"
              >
                <span className="font-semibold tabular-nums">{formatDay(day)}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {free} free · {booked} booked
                </span>
                {/* Every header has this line, empty on other days, so the columns stay level. */}
                <span className="min-h-4 text-xs font-semibold text-tint">
                  {day === today ? 'Today' : ''}
                </span>
              </button>
              {daySlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slots</p>
              ) : (
                <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                  {daySlots.map((slot) => {
                    const state = stateOf(slot)
                    return (
                      <li key={slot.id} className={chipVariants({ state })}>
                        <span className="font-medium">{slot.startsAt.slice(11, 16)}</span>
                        <span className="text-xs">{stateLabels[state]}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 id={headingId} className="text-xl font-semibold">
          Schedule
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="View" className="flex gap-1 rounded-full bg-secondary p-1">
            {(['day', 'week'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={segmentClassName}
              >
                {m === 'day' ? 'Day' : 'Week'}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDate(today)}
            disabled={days.includes(today)}
          >
            Today
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-full bg-card p-1">
        <Button
          variant="outline"
          size="icon"
          aria-label={mode === 'day' ? 'Previous day' : 'Previous week'}
          onClick={() => changeDate(addDays(date, -step))}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <p aria-live="polite" className="text-center font-semibold tabular-nums">
          {rangeLabel}
        </p>
        <Button
          variant="outline"
          size="icon"
          aria-label={mode === 'day' ? 'Next day' : 'Next week'}
          onClick={() => changeDate(addDays(date, step))}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>

      {message && (
        <p
          ref={messageRef}
          tabIndex={-1}
          role="status"
          className="flex items-center gap-2 rounded-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
          <Check aria-hidden className="size-4 shrink-0" />
          {message}
        </p>
      )}
      {deleteSlot.isError && (
        <p role="alert" className="text-destructive">
          {deleteSlot.error instanceof SlotBookedError
            ? 'This time was just booked by a client, so it cannot be deleted.'
            : 'The time slot could not be deleted. Please try again.'}
        </p>
      )}

      {body()}
    </section>
  )
}
