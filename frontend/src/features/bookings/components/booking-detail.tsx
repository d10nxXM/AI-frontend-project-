import { CalendarClock, MapPin, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { categoryIcons } from '@/lib/categories'
import { NotFoundError } from '@/lib/mock-db'

import { useBooking, useCancelBooking } from '../api/use-bookings'
import type { Booking } from '../types'
import { formatStartsAt } from './format-starts-at'

type BookingDetailProps = {
  id: number
  onCancelled?: (booking: Booking) => void
  // Extra actions for an active booking (e.g. moving it), rendered below the details.
  children?: (booking: Booking) => ReactNode
}

// One booking with loading, not-found and error states; an active one can be cancelled.
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
  const active = booking.status === 'booked'

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <article className="flex flex-col gap-4">
        <img
          src={booking.imageUrl}
          alt={booking.businessName}
          className="aspect-video w-full rounded-lg bg-muted object-cover"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon aria-hidden className="size-4" />
            {booking.businessName}
          </span>
          <Badge variant={active ? 'outline' : 'secondary'}>{active ? 'Booked' : 'Cancelled'}</Badge>
        </div>
        <h1 className="text-3xl font-bold">{booking.serviceName}</h1>
        <p className="text-muted-foreground">{booking.serviceDescription}</p>

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <dt>
              <CalendarClock aria-label="Time" className="size-4 text-muted-foreground" />
            </dt>
            <dd className="tabular-nums">
              {formatStartsAt(booking.startsAt)} · {booking.durationMinutes} min
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>
              <MapPin aria-label="City" className="size-4 text-muted-foreground" />
            </dt>
            <dd>{booking.city}</dd>
          </div>
        </dl>

        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <span className="text-2xl font-semibold tabular-nums">€{booking.price}</span>
          {active && (
            <Button
              variant="outline"
              disabled={cancelBooking.isPending}
              onClick={() => cancelBooking.mutate(booking.id, { onSuccess: () => onCancelled?.(booking) })}
            >
              <XCircle aria-hidden />
              Cancel booking
            </Button>
          )}
        </div>
        {cancelBooking.isError && (
          <p role="alert" className="text-sm text-destructive">
            The booking could not be cancelled. Please try again.
          </p>
        )}
      </article>

      {active && children?.(booking)}
    </div>
  )
}
