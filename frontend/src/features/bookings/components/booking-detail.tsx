import { cva } from 'class-variance-authority'
import { CalendarClock, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { categoryIcons } from '@/lib/categories'
import { localNow } from '@/lib/local-time'
import { NotFoundError } from '@/lib/mock-db'

import { useBooking, useCancelBooking } from '../api/use-bookings'
import type { Booking } from '../types'
import { CancelBookingButton } from './cancel-booking-button'
import { formatStartsAt } from './format-starts-at'

// Two columns only while there is something to show next to the details (moving the booking).
const layoutVariants = cva('grid grid-cols-1 gap-8', {
  variants: {
    columns: { one: 'lg:max-w-2xl', two: 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' },
  },
})

const articleVariants = cva('flex flex-col gap-4', {
  variants: { columns: { one: '', two: 'lg:sticky lg:top-8 lg:self-start' } },
})

type BookingDetailProps = {
  id: number
  onCancelled?: (booking: Booking) => void
  // Extra actions for an upcoming booking (e.g. moving it), rendered next to the details.
  children?: (booking: Booking) => ReactNode
}

// One booking with loading, not-found and error states; an upcoming one can be cancelled.
export function BookingDetail({ id, onCancelled, children }: BookingDetailProps) {
  const { data: booking, isLoading, error } = useBooking(id)
  const cancelBooking = useCancelBooking()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-video w-full md:w-1/2" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error instanceof NotFoundError) {
    return <p className="text-muted-foreground">This booking does not exist.</p>
  }

  if (error || !booking) {
    return <p className="text-destructive">Booking failed to load. Please try again.</p>
  }

  const Icon = categoryIcons[booking.category]
  const cancelled = booking.status === 'cancelled'
  const upcoming = !cancelled && booking.startsAt >= localNow()
  const columns = upcoming && children ? 'two' : 'one'

  return (
    <div className={layoutVariants({ columns })}>
      <title>{`${booking.serviceName} · Zakazi.me`}</title>
      <article className={articleVariants({ columns })}>
        <img
          src={booking.imageUrl}
          alt={booking.businessName}
          className="aspect-video w-full rounded-lg bg-muted object-cover"
        />
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/businesses/${booking.businessId}`}
            className="flex items-center gap-2 rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring"
          >
            <Icon aria-hidden className="size-4" />
            {booking.businessName}
          </Link>
          <Badge variant={upcoming ? 'outline' : 'secondary'}>
            {cancelled ? 'Cancelled' : upcoming ? 'Booked' : 'Past'}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-balance">{booking.serviceName}</h1>
        <p className="text-muted-foreground">{booking.serviceDescription}</p>

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <dt>
              <CalendarClock aria-label="Time" className="size-4 text-muted-foreground" />
            </dt>
            <dd className="text-base font-semibold tabular-nums">
              {formatStartsAt(booking.startsAt)}
              <span className="font-normal text-muted-foreground"> · {booking.durationMinutes} min</span>
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>
              <MapPin aria-label="Address" className="size-4 text-muted-foreground" />
            </dt>
            <dd>
              {booking.address}, {booking.city}
            </dd>
          </div>
        </dl>

        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <span className="text-2xl font-semibold tabular-nums">€{booking.price}</span>
          {upcoming && (
            <CancelBookingButton
              booking={booking}
              pending={cancelBooking.isPending}
              onConfirm={() => cancelBooking.mutate(booking.id, { onSuccess: () => onCancelled?.(booking) })}
            />
          )}
        </div>
        {cancelBooking.isError && (
          <p role="alert" className="text-sm text-destructive">
            The booking could not be cancelled. Please try again.
          </p>
        )}
        {cancelled && (
          <p role="status" className="text-sm">
            This booking is cancelled.{' '}
            <Link
              to={`/businesses/${booking.businessId}`}
              className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring"
            >
              Book again at {booking.businessName}
            </Link>
          </p>
        )}
      </article>

      {columns === 'two' && children?.(booking)}
    </div>
  )
}
