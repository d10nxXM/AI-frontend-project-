import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { BusinessFilters } from '@/features/businesses/components/business-filters'
import { BusinessesList } from '@/features/businesses/components/businesses-list'
import type { BusinessFilter } from '@/features/businesses/types'

export function Businesses() {
  const [filter, setFilter] = useState<BusinessFilter>({})

  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="text-3xl font-bold">Businesses</h1>
        <Input
          aria-label="Search businesses"
          placeholder="Search by name"
          value={filter.search ?? ''}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="md:max-w-xs"
        />
      </div>

      <BusinessFilters filter={filter} onChange={setFilter} />
      <BusinessesList filter={filter} />
    </section>
  )
}
