import { Skeleton } from '@/components/ui/skeleton'

import { useBookings, useCancelBooking } from '../api/use-bookings'
import { BookingCard } from './booking-card'

type BookingsListProps = {
  search: string
}

// Bookings with all three states: loading, empty and error.
export function BookingsList({ search }: BookingsListProps) {
  const { data: bookings, isLoading, error } = useBookings(search)
  const cancelBooking = useCancelBooking()

  if (isLoading) {
    return (
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="mt-8 text-destructive">Bookings failed to load. Please try again.</p>
  }

  if (!bookings || bookings.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground">
        {search ? `No bookings match "${search}".` : 'You have no bookings yet.'}
      </p>
    )
  }

  return (
    <>
      {cancelBooking.isError && (
        <p role="alert" className="mt-8 text-destructive">
          The booking could not be cancelled. Please try again.
        </p>
      )}
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <BookingCard
              booking={booking}
              onCancel={cancelBooking.mutate}
              isCancelling={cancelBooking.isPending && cancelBooking.variables === booking.id}
            />
          </li>
        ))}
      </ul>
    </>
  )
}
