import { CalendarClock, MapPin } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { categoryIcons } from '@/lib/categories'

import type { Booking } from '../types'
import { CancelBookingButton } from './cancel-booking-button'
import { formatStartsAt } from './format-starts-at'

type BookingCardProps = {
  booking: Booking
  // Past bookings stay readable but cannot be cancelled.
  past: boolean
  onCancel: (booking: Booking) => void
  isCancelling: boolean
}

// Status is always shown as text, never by color alone (DESIGN.md).
const statusLabel = (booking: Booking, past: boolean) =>
  booking.status === 'cancelled' ? 'Cancelled' : past ? 'Past' : 'Booked'

// Mobile: a row with a 64 px photo so several bookings fit on screen. From sm up: a card.
export function BookingCard({ booking, past, onCancel, isCancelling }: BookingCardProps) {
  const CategoryIcon = categoryIcons[booking.category]
  const active = booking.status === 'booked' && !past

  return (
    <Card className="flex h-full flex-row gap-4 overflow-hidden rounded-lg p-4 shadow-none sm:flex-col sm:gap-0 sm:p-0">
      <img
        src={booking.imageUrl}
        alt={booking.businessName}
        className="size-16 shrink-0 rounded-md bg-muted object-cover sm:aspect-video sm:size-auto sm:w-full sm:rounded-none"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <CategoryIcon aria-hidden className="size-4 shrink-0" />
            <span className="truncate">{booking.businessName}</span>
          </span>
          <Badge variant={active ? 'outline' : 'secondary'}>{statusLabel(booking, past)}</Badge>
        </div>
        <h3 className="text-base font-semibold sm:text-lg">
          <Link
            to={`/bookings/${booking.id}`}
            className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
          >
            {booking.serviceName}
          </Link>
        </h3>
        {/* The time is what matters most on a booking, so it is the strongest line. */}
        <span className="flex items-center gap-2 text-base font-semibold tabular-nums">
          <CalendarClock aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          {formatStartsAt(booking.startsAt)}
          <span className="font-normal text-muted-foreground">· {booking.durationMinutes} min</span>
        </span>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin aria-hidden className="size-4 shrink-0" />
          {booking.city}
        </span>
        <div className="mt-auto flex items-center justify-between gap-4 pt-2">
          <span className="font-semibold tabular-nums sm:text-lg">€{booking.price}</span>
          {active && (
            <CancelBookingButton
              booking={booking}
              pending={isCancelling}
              onConfirm={() => onCancel(booking)}
            />
          )}
        </div>
      </div>
    </Card>
  )
}
