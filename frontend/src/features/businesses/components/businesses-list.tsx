import { Skeleton } from '@/components/ui/skeleton'

import { useBusinesses } from '../api/use-businesses'
import type { BusinessFilter } from '../types'
import { BusinessCard } from './business-card'

type BusinessesListProps = {
  filter: BusinessFilter
}

// Businesses with all three states: loading, empty and error.
export function BusinessesList({ filter }: BusinessesListProps) {
  const { data: businesses, isLoading, error } = useBusinesses(filter)

  if (isLoading) {
    return (
      <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-24 sm:h-80" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="mt-8 text-destructive">Businesses failed to load. Please try again.</p>
  }

  if (!businesses || businesses.length === 0) {
    return <p className="mt-8 text-muted-foreground">No businesses match your search and filters.</p>
  }

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {businesses.map((business) => (
        <li key={business.id}>
          <BusinessCard business={business} />
        </li>
      ))}
    </ul>
  )
}
