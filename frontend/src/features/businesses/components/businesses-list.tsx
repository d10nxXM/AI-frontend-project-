import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useBusinesses } from '../api/use-businesses'
import type { BusinessFilter } from '../types'
import { BusinessCard } from './business-card'

type BusinessesListProps = {
  filter: BusinessFilter
  onClearFilters?: () => void
}

// Businesses with all three states: loading, empty and error.
export function BusinessesList({ filter, onClearFilters }: BusinessesListProps) {
  const { data: businesses, isLoading, error } = useBusinesses(filter)

  if (isLoading) {
    return (
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
    return (
      <div className="mt-8 flex flex-col items-start gap-4">
        <p className="text-muted-foreground">No businesses match your search and filters.</p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {businesses.map((business) => (
        <li key={business.id}>
          <BusinessCard business={business} />
        </li>
      ))}
    </ul>
  )
}
