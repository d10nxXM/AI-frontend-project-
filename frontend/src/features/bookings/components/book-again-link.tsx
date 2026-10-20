import { RotateCcw } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

import type { Booking } from '../types'

type BookAgainLinkProps = {
  booking: Booking
}

// Opens the business with the same service already chosen, so only a time is left to pick.
export function BookAgainLink({ booking }: BookAgainLinkProps) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link
        // Built from encoded parts, so a malformed id from a future API cannot change the path.
        to={{
          pathname: `/businesses/${encodeURIComponent(String(booking.businessId))}`,
          search: `?${new URLSearchParams({ service: String(booking.serviceId) })}`,
        }}
        // The visible text comes first, so voice control ("click Book again") finds it.
        aria-label={`Book again: ${booking.serviceName} at ${booking.businessName}`}
      >
        <RotateCcw aria-hidden />
        Book again
      </Link>
    </Button>
  )
}
