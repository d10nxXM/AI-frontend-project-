import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { NotFound } from '@/app/routes/not-found'
import { BookingDetail as BookingInfo } from '@/features/bookings/components/booking-detail'
import { RescheduleConfirm } from '@/features/bookings/components/reschedule-confirm'
import { useBookSlot, useReleaseSlot } from '@/features/slots/api/use-slots'
import { SlotsByDay } from '@/features/slots/components/slots-by-day'
import type { TimeSlot } from '@/features/slots/types'

// One booking: details, cancel, and moving it to another free slot of the same business.
export function BookingDetail() {
  const id = Number(useParams().id)
  const bookSlot = useBookSlot()
  const releaseSlot = useReleaseSlot()
  const [slot, setSlot] = useState<TimeSlot>()
  const [saved, setSaved] = useState(false)

  if (!Number.isInteger(id) || id <= 0) return <NotFound />

  // The real backend swaps the slots in PATCH /bookings/:id; with the mock the route does it here.
  const swapSlots = (newSlotId: number, previousSlotId: number) => {
    releaseSlot.mutate(previousSlotId)
    bookSlot.mutate(newSlotId, {
      onSettled: () => {
        setSlot(undefined)
        setSaved(true)
      },
    })
  }

  return (
    <section className="flex flex-col gap-8">
      <Link
        to="/bookings"
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        My bookings
      </Link>

      <BookingInfo id={id} onCancelled={(booking) => releaseSlot.mutate(booking.slotId)}>
        {(booking) => (
          <div className="flex min-w-0 flex-col gap-4">
            <h2 className="text-xl font-semibold">Change time</h2>
            {saved && (
              <p role="status" className="text-sm text-muted-foreground">
                Time changed. Your booking is now at the new time.
              </p>
            )}
            <SlotsByDay
              businessId={booking.businessId}
              currentId={booking.slotId}
              selectedId={slot?.id}
              onSelect={(next) => {
                setSlot(next)
                setSaved(false)
              }}
            />
            <RescheduleConfirm
              booking={booking}
              slot={slot}
              finishing={bookSlot.isPending}
              onRescheduled={(updated, previousSlotId) => swapSlots(updated.slotId, previousSlotId)}
            />
          </div>
        )}
      </BookingInfo>
    </section>
  )
}
