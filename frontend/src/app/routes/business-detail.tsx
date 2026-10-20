import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { NotFound } from '@/app/routes/not-found'
import { BookingSummary } from '@/features/bookings/components/booking-summary'
import type { Booking } from '@/features/bookings/types'
import { BusinessDetail as BusinessInfo } from '@/features/businesses/components/business-detail'
import { ServicesList } from '@/features/services/components/services-list'
import type { Service } from '@/features/services/types'
import { useBookRange } from '@/features/slots/api/use-slots'
import { SlotsByDay } from '@/features/slots/components/slots-by-day'
import type { TimeSlot } from '@/features/slots/types'

// Booking flow on the business page: 1. service, 2. time slot, 3. confirm.
export function BusinessDetail() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const bookRange = useBookRange()
  const [service, setService] = useState<Service>()
  const [slot, setSlot] = useState<TimeSlot>()

  if (!Number.isInteger(id) || id <= 0) return <NotFound />

  // A different service has a different length, so the chosen time may no longer fit.
  const chooseService = (next: Service) => {
    setService(next)
    setSlot(undefined)
  }

  // The real POST /bookings takes the slots itself; with the mock the route does it here.
  const handleBooked = (booking: Booking) =>
    bookRange.mutate(booking, {
      onSettled: () => navigate(`/bookings/${booking.id}`, { state: { justBooked: true } }),
    })

  return (
    <section className="flex flex-col gap-8">
      <Link
        to="/businesses"
        className="flex w-fit items-center gap-2 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All businesses
      </Link>

      <BusinessInfo id={id}>
        {(business) => (
          <div className="flex min-w-0 flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">1. Choose a service</h2>
              <ServicesList businessId={id} selectedId={service?.id} onSelect={chooseService} />
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">2. Choose a time</h2>
              {!service && <p className="text-sm text-muted-foreground">Choose a service first.</p>}
              <SlotsByDay
                businessId={id}
                durationMinutes={service?.durationMinutes}
                selectedId={slot?.id}
                onSelect={setSlot}
                disabled={!service}
              />
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">3. Confirm</h2>
              <BookingSummary
                business={business}
                service={service}
                slot={slot}
                finishing={bookRange.isPending}
                onBooked={handleBooked}
              />
            </div>
          </div>
        )}
      </BusinessInfo>
    </section>
  )
}
