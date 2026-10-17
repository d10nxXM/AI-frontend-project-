import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { BookingsList } from '@/features/bookings/components/bookings-list'

export function Bookings() {
  const [search, setSearch] = useState('')

  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="text-3xl font-bold">My bookings</h1>
        <Input
          aria-label="Search bookings"
          placeholder="Search by service, business or city"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-xs"
        />
      </div>

      <BookingsList search={search} />
    </section>
  )
}
