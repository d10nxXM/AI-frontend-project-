import { CalendarClock, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router'

import { DirectionsLink } from '@/components/directions-link'
import { buttonVariants } from '@/components/ui/button'
import { categoryIcons } from '@/lib/categories'
import { localNow } from '@/lib/local-time'

import { useBookings } from '../api/use-bookings'
import { BottomSheet } from './bottom-sheet'
import { formatStartsAt } from './format-starts-at'

// The client's soonest upcoming booking, peeking from the bottom of the screen; drag it up for the
// details. Shows nothing while loading or when there is no upcoming booking.
export function NextBookingSheet() {
  const { data: bookings, error } = useBookings('')

  if (error) {
    return <p className="text-destructive">Your bookings failed to load. Please try again.</p>
  }

  const now = localNow()
  // The list is sorted by time, so the first upcoming one is the next.
  const next = bookings?.find((b) => b.status === 'booked' && b.startsAt >= now)
  if (!next) return null

  const Icon = categoryIcons[next.category]

  return (
    <BottomSheet
      key={next.id}
      label="Your next booking"
      peek={
        <span className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <Icon aria-hidden className="size-5" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-xs font-medium text-muted-foreground">Your next booking</span>
            <span className="truncate font-semibold">{next.serviceName}</span>
            <span className="text-sm font-medium tabular-nums">{formatStartsAt(next.startsAt)}</span>
          </span>
        </span>
      }
    >
      <div className="flex flex-col gap-4 border-t pt-4">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Business</dt>
            <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <dd className="font-medium">{next.businessName}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Address</dt>
            <MapPin aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <dd className="flex flex-wrap gap-x-3 gap-y-1">
              <span>
                {next.address}, {next.city}
              </span>
              <DirectionsLink address={next.address} city={next.city} />
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">When</dt>
            <CalendarClock aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <dd className="tabular-nums">{formatStartsAt(next.startsAt)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Length and price</dt>
            <Clock aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <dd className="tabular-nums">
              {next.durationMinutes} min · <span className="font-semibold">€{next.price}</span>
            </dd>
          </div>
        </dl>
        <Link to={`/bookings/${next.id}`} className={buttonVariants({ variant: 'outline' })}>
          View booking
        </Link>
      </div>
    </BottomSheet>
  )
}
