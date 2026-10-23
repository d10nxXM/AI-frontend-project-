import { CalendarClock, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { categoryIcons } from '@/lib/categories'
import { localNow } from '@/lib/local-time'

import { useBookings } from '../api/use-bookings'
import { formatStartsAt } from './format-starts-at'

// The client's soonest upcoming booking as a shortcut; shows nothing when there is none.
export function NextBooking() {
  const { data: bookings, isLoading, error } = useBookings('')

  if (isLoading) return <Skeleton className="h-20" />

  if (error) {
    return <p className="text-destructive">Your bookings failed to load. Please try again.</p>
  }

  const now = localNow()
  // The list is sorted by time, so the first upcoming one is the next.
  const next = bookings?.find((b) => b.status === 'booked' && b.startsAt >= now)
  if (!next) return null

  const Icon = categoryIcons[next.category]

  return (
    <section aria-label="Your next booking" className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-muted-foreground">Your next booking</h2>
      <Link
        to={`/bookings/${next.id}`}
        className="flex items-center gap-4 pressable rounded-2xl bg-card p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
          <Icon aria-hidden className="size-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold">{next.serviceName}</span>
          <span className="truncate text-sm text-muted-foreground">{next.businessName}</span>
          <span className="flex items-center gap-2 text-sm font-medium tabular-nums">
            <CalendarClock aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            {formatStartsAt(next.startsAt)}
          </span>
        </span>
        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </section>
  )
}
