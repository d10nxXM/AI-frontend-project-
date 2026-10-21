import { useId } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { localNow } from '@/lib/local-time'

import { useBusinessBookings, useCancelBooking } from '../api/use-bookings'
import type { Booking } from '../types'
import { OwnerBookingRow } from './owner-booking-row'

type OwnerBookingsProps = {
  businessId: number
  onCancelled?: (booking: Booking) => void
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

// Today's and later active bookings of one business; past and cancelled ones are left out.
export function OwnerBookings({ businessId, onCancelled }: OwnerBookingsProps) {
  const { data: bookings, isLoading, error } = useBusinessBookings(businessId)
  const cancelBooking = useCancelBooking()
  const todayId = useId()
  const upcomingId = useId()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-48" />
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  if (error || !bookings) {
    return <p className="text-destructive">Bookings failed to load. Please try again.</p>
  }

  const now = localNow()
  const today = now.slice(0, 10)
  const active = bookings.filter((b) => b.status === 'booked' && b.startsAt >= now)
  const todays = active.filter((b) => b.startsAt.startsWith(today))
  const upcoming = active.filter((b) => !b.startsAt.startsWith(today))

  const cancel = (booking: Booking) =>
    cancelBooking.mutate(booking.id, { onSuccess: () => onCancelled?.(booking) })

  const renderList = (list: Booking[], timeOnly: boolean) => (
    <ul className="divide-y rounded-lg border">
      {list.map((booking) => (
        <li key={booking.id}>
          <OwnerBookingRow
            booking={booking}
            timeOnly={timeOnly}
            onCancel={cancel}
            isCancelling={cancelBooking.isPending && cancelBooking.variables === booking.id}
          />
        </li>
      ))}
    </ul>
  )

  return (
    <div className="flex flex-col gap-8">
      <p className="text-muted-foreground tabular-nums">
        {plural(todays.length, 'booking')} today · {upcoming.length} upcoming
      </p>

      {cancelBooking.isError && (
        <p role="alert" className="text-destructive">
          The booking could not be cancelled. Please try again.
        </p>
      )}

      <section aria-labelledby={todayId} className="flex flex-col gap-4">
        <h2 id={todayId} className="text-xl font-semibold">
          Today
        </h2>
        {todays.length > 0 ? (
          renderList(todays, true)
        ) : (
          <p className="text-muted-foreground">No bookings today.</p>
        )}
      </section>

      <section aria-labelledby={upcomingId} className="flex flex-col gap-4">
        <h2 id={upcomingId} className="text-xl font-semibold">
          Upcoming
        </h2>
        {upcoming.length > 0 ? (
          renderList(upcoming, false)
        ) : (
          <p className="text-muted-foreground">No upcoming bookings.</p>
        )}
      </section>
    </div>
  )
}
