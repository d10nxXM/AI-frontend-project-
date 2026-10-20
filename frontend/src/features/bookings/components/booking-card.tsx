import { CalendarClock, MapPin, XCircle } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { categoryIcons } from '@/lib/categories'

import type { Booking, BookingStatus } from '../types'
import { formatStartsAt } from './format-starts-at'

// Status is always shown as text, never by color alone (DESIGN.md).
const statusBadges: Record<BookingStatus, { label: string; variant: 'outline' | 'secondary' }> = {
  booked: { label: 'Booked', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
}

type BookingCardProps = {
  booking: Booking
  onCancel: (id: number) => void
  isCancelling: boolean
}

export function BookingCard({ booking, onCancel, isCancelling }: BookingCardProps) {
  const CategoryIcon = categoryIcons[booking.category]
  const status = statusBadges[booking.status]

  return (
    <Card className="h-full overflow-hidden pt-0 shadow-none">
      <img
        src={booking.imageUrl}
        alt={booking.businessName}
        className="aspect-video w-full bg-muted object-cover"
      />
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <CategoryIcon aria-hidden className="size-4" />
            {booking.businessName}
          </span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <CardTitle className="text-lg">
          <Link
            to={`/bookings/${booking.id}`}
            className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {booking.serviceName}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{booking.serviceDescription}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <span className="flex items-center gap-2 tabular-nums">
          <CalendarClock aria-hidden className="size-4 text-muted-foreground" />
          {formatStartsAt(booking.startsAt)} · {booking.durationMinutes} min
        </span>
        <span className="flex items-center gap-2">
          <MapPin aria-hidden className="size-4 text-muted-foreground" />
          {booking.city}
        </span>
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-4">
        <span className="text-lg font-semibold tabular-nums">€{booking.price}</span>
        {booking.status === 'booked' && (
          <Button variant="outline" size="sm" disabled={isCancelling} onClick={() => onCancel(booking.id)}>
            <XCircle aria-hidden />
            Cancel booking
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
