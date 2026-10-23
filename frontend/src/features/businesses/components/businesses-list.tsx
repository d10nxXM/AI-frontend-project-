import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import type { ReactNode } from 'react'

import { useBusinesses } from '../api/use-businesses'
import type { Business, BusinessFilter } from '../types'
import { BusinessCard } from './business-card'

type BusinessesListProps = {
  filter: BusinessFilter
  onClearFilters?: () => void
  // Show only the first few (e.g. on the home page).
  limit?: number
  // Extra filter from another feature (e.g. free today); `waiting` while its data loads.
  include?: (business: Business) => boolean
  waiting?: boolean
  // Extra line on each card, e.g. the next free time from the slots feature.
  renderExtra?: (business: Business) => ReactNode
  // Shown instead of the default text when nothing matches (e.g. no favorites yet).
  emptyMessage?: string
}

// Businesses with all three states: loading, empty and error.
export function BusinessesList({
  filter,
  onClearFilters,
  limit,
  include,
  waiting = false,
  renderExtra,
  emptyMessage = 'No businesses match your search and filters.',
}: BusinessesListProps) {
  const { data, isLoading, error } = useBusinesses(filter)
  const businesses = include ? data?.filter(include) : data

  if (isLoading || waiting) {
    return (
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl sm:h-80" />
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
        <p className="text-muted-foreground">{emptyMessage}</p>
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
      {businesses.slice(0, limit).map((business) => (
        <li key={business.id}>
          <BusinessCard business={business} extra={renderExtra?.(business)} />
        </li>
      ))}
    </ul>
  )
}
