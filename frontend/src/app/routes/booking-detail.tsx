import { ArrowLeft, Check } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'

import { NotFound } from '@/app/routes/not-found'
import { BookingDetail as BookingInfo } from '@/features/bookings/components/booking-detail'
import { RescheduleConfirm } from '@/features/bookings/components/reschedule-confirm'
import type { Booking } from '@/features/bookings/types'
import { ReviewForm } from '@/features/reviews/components/review-form'
import { useBookRange, useReleaseRange } from '@/features/slots/api/use-slots'
import { SlotsByDay } from '@/features/slots/components/slots-by-day'
import type { TimeSlot } from '@/features/slots/types'

// Set by the booking flow when it lands here right after "Book".
const isJustBooked = (state: unknown) =>
  typeof state === 'object' && state !== null && 'justBooked' in state && state.justBooked === true

// One booking: details, cancel, and moving it to another free time at the same business.
export function BookingDetail() {
  const id = Number(useParams().id)
  const location = useLocation()
  const bookRange = useBookRange()
  const releaseRange = useReleaseRange()
  const [slot, setSlot] = useState<TimeSlot>()
  const [message, setMessage] = useState(isJustBooked(location.state) ? 'Booked. See you there!' : '')

  if (!Number.isInteger(id) || id <= 0) return <NotFound />

  // The real backend swaps the slots in PATCH /bookings/:id; with the mock the route does it here.
  const swapSlots = (moved: Booking, previous: Booking) => {
    releaseRange.mutate(previous, {
      onSettled: () =>
        bookRange.mutate(moved, {
          onSettled: () => {
            setSlot(undefined)
            setMessage('Time changed. Your booking is now at the new time.')
          },
        }),
    })
  }

  return (
    <section className="flex flex-col gap-8">
      <Link
        to="/bookings"
        className="flex w-fit items-center gap-2 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden className="size-4" />
        My bookings
      </Link>

      {message && (
        <p role="status" className="flex items-center gap-2 font-medium">
          <Check aria-hidden className="size-4 shrink-0" />
          {message}
        </p>
      )}

      <BookingInfo
        id={id}
        pastActions={(booking) => (
          <ReviewForm
            booking={{
              businessId: booking.businessId,
              bookingId: booking.id,
              clientName: booking.clientName,
            }}
          />
        )}
        onCancelled={(booking) => {
          setMessage('')
          releaseRange.mutate(booking)
        }}
      >
        {(booking) => (
          <div className="flex min-w-0 flex-col gap-4">
            <h2 className="text-xl font-semibold">Change time</h2>
            <SlotsByDay
              businessId={booking.businessId}
              durationMinutes={booking.durationMinutes}
              currentId={booking.slotId}
              selectedId={slot?.id}
              onSelect={(next) => {
                setSlot(next)
                setMessage('')
              }}
            />
            <RescheduleConfirm
              booking={booking}
              slot={slot}
              finishing={releaseRange.isPending || bookRange.isPending}
              onRescheduled={swapSlots}
            />
          </div>
        )}
      </BookingInfo>
    </section>
  )
}
