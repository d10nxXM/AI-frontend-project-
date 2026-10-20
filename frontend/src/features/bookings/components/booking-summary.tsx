import { CalendarCheck, LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useCreateBooking } from '../api/use-bookings'
import type { Booking, BookingDraft, ClientDetails } from '../types'
import { formatStartsAt } from './format-starts-at'
import { forgetClient, rememberClient } from './remembered-client'

type BookingSummaryProps = {
  business: BookingDraft['business']
  service?: BookingDraft['service']
  slot?: BookingDraft['slot']
  // Valid details from ClientDetailsForm, or undefined while the form is incomplete.
  client?: ClientDetails
  // Whether the client ticked "Remember my name and phone".
  remember?: boolean
  // True while the caller finishes up after the booking was created (e.g. marking the slot).
  finishing?: boolean
  onBooked: (booking: Booking) => void
}

// The last step: what is about to be booked and the one main action, "Book".
export function BookingSummary({
  business,
  service,
  slot,
  client,
  remember = false,
  finishing = false,
  onBooked,
}: BookingSummaryProps) {
  const createBooking = useCreateBooking()
  const pending = createBooking.isPending || finishing

  function book() {
    if (!service || !slot || !client) return
    createBooking.mutate(
      {
        businessId: business.id,
        businessName: business.name,
        category: business.category,
        city: business.city,
        address: business.address,
        imageUrl: business.imageUrl,
        serviceId: service.id,
        serviceName: service.name,
        serviceDescription: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes,
        slotId: slot.id,
        startsAt: slot.startsAt,
        ...client,
      },
      {
        onSuccess: (booking) => {
          if (remember) rememberClient(client)
          else forgetClient()
          onBooked(booking)
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Service</dt>
        <dd>{service ? service.name : 'Not chosen yet'}</dd>
        <dt className="text-muted-foreground">Time</dt>
        <dd className="tabular-nums">{slot ? formatStartsAt(slot.startsAt) : 'Not chosen yet'}</dd>
        <dt className="text-muted-foreground">Price</dt>
        <dd className="font-semibold tabular-nums">{service ? `€${service.price}` : '–'}</dd>
        <dt className="text-muted-foreground">For</dt>
        <dd>
          {client ? (
            <>
              {client.clientName}, <span className="tabular-nums">{client.clientPhone}</span>
            </>
          ) : (
            'Add your name and phone'
          )}
        </dd>
      </dl>

      {createBooking.error && (
        <p className="text-sm text-destructive">The booking failed. Please try again.</p>
      )}

      <Button
        size="lg"
        disabled={!service || !slot || !client || pending}
        onClick={book}
        className="w-full sm:w-auto sm:self-end"
      >
        {pending ? <LoaderCircle aria-hidden className="animate-spin" /> : <CalendarCheck aria-hidden />}
        {pending ? 'Booking…' : 'Book'}
      </Button>
    </div>
  )
}
