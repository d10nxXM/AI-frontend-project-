import { ArrowRight, CalendarSync, LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useRescheduleBooking } from '../api/use-bookings'
import type { Booking, BookingDraft } from '../types'
import { formatStartsAt } from './format-starts-at'

type RescheduleConfirmProps = {
  booking: Booking
  slot?: BookingDraft['slot']
  // True while the caller finishes up after the move (e.g. swapping the slots).
  finishing?: boolean
  onRescheduled: (booking: Booking, previousSlotId: number) => void
}

// Old time -> new time and the one main action, "Change time".
export function RescheduleConfirm({
  booking,
  slot,
  finishing = false,
  onRescheduled,
}: RescheduleConfirmProps) {
  const reschedule = useRescheduleBooking()
  const pending = reschedule.isPending || finishing

  function confirm() {
    if (!slot) return
    reschedule.mutate(
      { id: booking.id, slot },
      { onSuccess: (updated) => onRescheduled(updated, booking.slotId) },
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <p className="flex flex-wrap items-center gap-2 text-sm tabular-nums">
        <span className="text-muted-foreground">{formatStartsAt(booking.startsAt)}</span>
        <ArrowRight aria-label="to" className="size-4 text-muted-foreground" />
        <span className="font-semibold">{slot ? formatStartsAt(slot.startsAt) : 'Choose a new time'}</span>
      </p>

      {reschedule.isError && (
        <p role="alert" className="text-sm text-destructive">
          The time could not be changed. Please try again.
        </p>
      )}

      <Button
        size="lg"
        disabled={!slot || pending}
        onClick={confirm}
        className="w-full sm:w-auto sm:self-end"
      >
        {pending ? <LoaderCircle aria-hidden className="animate-spin" /> : <CalendarSync aria-hidden />}
        {pending ? 'Changing…' : 'Change time'}
      </Button>
    </div>
  )
}
