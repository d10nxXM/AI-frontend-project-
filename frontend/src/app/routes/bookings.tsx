import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { BookingsList } from '@/features/bookings/components/bookings-list'
import { useReleaseRange } from '@/features/slots/api/use-slots'
import { useDebouncedValue } from '@/lib/use-debounced-value'

export function Bookings() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  // The real backend frees the slots on cancel; with the mock the route does it here.
  const releaseRange = useReleaseRange()

  return (
    <section>
      <title>My bookings · Zakazi.me</title>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="text-3xl leading-tight font-bold md:text-4xl">My bookings</h1>
        <Input
          aria-label="Search bookings"
          placeholder="Search by service, business or city"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-xs"
        />
      </div>

      <BookingsList
        search={debouncedSearch}
        onCancelled={(booking) => releaseRange.mutate(booking)}
        onClearSearch={() => setSearch('')}
      />
    </section>
  )
}
