import { useState } from 'react'

import { OwnerSchedule } from '@/features/slots/components/owner-schedule'
import { PublishSlotsForm } from '@/features/slots/components/publish-slots-form'
import { OWNER_BUSINESS_ID } from '@/lib/current-owner'
import { localNow } from '@/lib/local-time'

// Owner: publish free times and see or delete them by day or by week.
export function OwnerSlots() {
  // Shared, so the schedule jumps to the day that was just published.
  const [date, setDate] = useState(() => localNow().slice(0, 10))

  return (
    <section className="flex flex-col gap-8">
      <title>Time slots · Zakazi.me</title>
      <h1 className="text-3xl font-bold">Time slots</h1>
      <PublishSlotsForm businessId={OWNER_BUSINESS_ID} onPublished={setDate} />
      <OwnerSchedule businessId={OWNER_BUSINESS_ID} date={date} onDateChange={setDate} />
    </section>
  )
}
