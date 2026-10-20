import { useId } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { localNow } from '@/lib/local-time'

import { useBookings, useCancelBooking } from '../api/use-bookings'
import type { Booking } from '../types'
import { BookingCard } from './booking-card'

type BookingsListProps = {
  search: string
  onCancelled?: (booking: Booking) => void
  onClearSearch?: () => void
}

// Upcoming bookings first, then past and cancelled ones; with loading, empty and error states.
export function BookingsList({ search, onCancelled, onClearSearch }: BookingsListProps) {
  const { data: bookings, isLoading, error } = useBookings(search)
  const cancelBooking = useCancelBooking()
  // Sections are named by their headings, so screen readers list them as regions.
  const upcomingId = useId()
  const pastId = useId()

  if (isLoading) {
    return (
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-36 sm:h-96" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="mt-8 text-destructive">Bookings failed to load. Please try again.</p>
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-start gap-4">
        <p className="text-muted-foreground">
          {search ? `No bookings match "${search}".` : 'You have no bookings yet.'}
        </p>
        {search && onClearSearch && (
          <Button variant="outline" onClick={onClearSearch}>
            Clear search
          </Button>
        )}
      </div>
    )
  }

  const now = localNow()
  const isUpcoming = (b: Booking) => b.status === 'booked' && b.startsAt >= now
  const upcoming = bookings.filter(isUpcoming)
  const earlier = bookings.filter((b) => !isUpcoming(b)).reverse()

  const cancel = (booking: Booking) =>
    cancelBooking.mutate(booking.id, { onSuccess: () => onCancelled?.(booking) })

  const renderList = (list: Booking[], past: boolean) => (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {list.map((booking) => (
        <li key={booking.id}>
          <BookingCard
            booking={booking}
            past={past}
            onCancel={cancel}
            isCancelling={cancelBooking.isPending && cancelBooking.variables === booking.id}
          />
        </li>
      ))}
    </ul>
  )

  return (
    <div className="mt-8 flex flex-col gap-8">
      {cancelBooking.isError && (
        <p role="alert" className="text-destructive">
          The booking could not be cancelled. Please try again.
        </p>
      )}

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

      {earlier.length > 0 && (
        <section aria-labelledby={pastId} className="flex flex-col gap-4">
          <h2 id={pastId} className="text-xl font-semibold">
            Past and cancelled
          </h2>
          {renderList(earlier, true)}
        </section>
      )}
    </div>
  )
}
