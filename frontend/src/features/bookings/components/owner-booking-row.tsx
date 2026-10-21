import { MessageSquare, Phone } from 'lucide-react'

import type { Booking } from '../types'
import { formatStartsAt } from './format-starts-at'
import { OwnerCancelBookingButton } from './owner-cancel-booking-button'

type OwnerBookingRowProps = {
  booking: Booking
  // Today only the time matters; later days also need the date.
  timeOnly: boolean
  onCancel: (booking: Booking) => void
  isCancelling: boolean
}

// One booking as the business sees it: when, what, and who to expect.
// Phones: everything stacked. From sm up: time column, details, then price and cancel.
export function OwnerBookingRow({ booking, timeOnly, onCancel, isCancelling }: OwnerBookingRowProps) {
  // Only digits and a leading + go into the tel: link.
  const phoneHref = `tel:${booking.clientPhone.replace(/[^\d+]/g, '')}`

  return (
    <article className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-6">
      <div className="flex items-baseline gap-2 sm:w-40 sm:shrink-0 sm:flex-col sm:gap-0">
        <span className="text-base font-semibold whitespace-nowrap tabular-nums">
          {timeOnly ? booking.startsAt.slice(11, 16) : formatStartsAt(booking.startsAt)}
        </span>
        <span className="text-sm text-muted-foreground tabular-nums">{booking.durationMinutes} min</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="font-medium">{booking.serviceName}</h3>
        <p className="text-sm">{booking.clientName}</p>
        <a
          href={phoneHref}
          className="flex w-fit items-center gap-2 rounded-sm text-sm text-muted-foreground tabular-nums underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring"
        >
          <Phone aria-hidden className="size-4 shrink-0" />
          {booking.clientPhone}
        </a>
        {booking.note && (
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MessageSquare aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0 break-words">
              <span className="sr-only">Note: </span>
              {booking.note}
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <span className="font-semibold tabular-nums">€{booking.price}</span>
        <OwnerCancelBookingButton
          booking={booking}
          pending={isCancelling}
          onConfirm={() => onCancel(booking)}
        />
      </div>
    </article>
  )
}
