import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router'

import { BusinessProfileForm } from '@/features/businesses/components/business-profile-form'
import { OWNER_BUSINESS_ID } from '@/lib/current-owner'

// The owner edits name, city, address, photo and opening hours of their business.
export function OwnerProfile() {
  return (
    <section className="flex flex-col gap-8">
      <title>Business profile · Zakazi.me</title>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h1 className="text-3xl font-bold">Business profile</h1>
        <Link
          to={`/businesses/${OWNER_BUSINESS_ID}`}
          className="flex w-fit items-center gap-2 rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring"
        >
          <ExternalLink aria-hidden className="size-4" />
          View public page
        </Link>
      </div>
      <BusinessProfileForm id={OWNER_BUSINESS_ID} />
    </section>
  )
}
