import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { NotFound } from '@/app/routes/not-found'
import { BusinessDetail as BusinessInfo } from '@/features/businesses/components/business-detail'
import { ServicesList } from '@/features/services/components/services-list'
import { SlotsByDay } from '@/features/slots/components/slots-by-day'

export function BusinessDetail() {
  const id = Number(useParams().id)
  if (!Number.isInteger(id) || id <= 0) return <NotFound />

  return (
    <section className="flex flex-col gap-8">
      <Link
        to="/businesses"
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All businesses
      </Link>

      <BusinessInfo id={id}>
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Free time slots</h2>
            <SlotsByDay businessId={id} />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Services</h2>
            <ServicesList businessId={id} />
          </div>
        </div>
      </BusinessInfo>
    </section>
  )
}
