import { OwnerBookings } from '@/features/bookings/components/owner-bookings'
import { useReleaseRange } from '@/features/slots/api/use-slots'
import { OWNER_BUSINESS_ID } from '@/lib/current-owner'

// The owner's day at a glance: today's and upcoming bookings, each can be cancelled.
export function OwnerDashboard() {
  // The real backend frees the slots on cancel; with the mock the route does it here.
  const releaseRange = useReleaseRange()

  return (
    <section className="flex flex-col gap-6">
      <title>Dashboard · Zakazi.me</title>
      <h1 className="text-3xl leading-tight font-bold md:text-4xl">Dashboard</h1>
      <OwnerBookings businessId={OWNER_BUSINESS_ID} onCancelled={(booking) => releaseRange.mutate(booking)} />
    </section>
  )
}
