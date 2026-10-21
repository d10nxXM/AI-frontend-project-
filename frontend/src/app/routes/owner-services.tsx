import { ManageServices } from '@/features/services/components/manage-services'
import { OWNER_BUSINESS_ID } from '@/lib/current-owner'

// The owner's services: what clients can book, with price and length.
export function OwnerServices() {
  return (
    <section className="flex flex-col gap-6">
      <title>Services · Zakazi.me</title>
      <h1 className="text-3xl font-bold">Services</h1>
      <ManageServices businessId={OWNER_BUSINESS_ID} />
    </section>
  )
}
