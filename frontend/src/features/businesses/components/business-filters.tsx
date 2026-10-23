import { Clock, Heart, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useBusinesses } from '../api/use-businesses'
import type { BusinessFilter } from '../types'
import { categories, categoryLabels } from './category-meta'
import { activeFilter, FilterMenu } from './filter-menu'

type BusinessFiltersProps = {
  filter: BusinessFilter
  onChange: (filter: BusinessFilter) => void
  // "Free today" is decided by the slots feature; the filter only shows the choice.
  freeToday?: boolean
  onFreeTodayChange?: (freeToday: boolean) => void
  favoritesOnly?: boolean
  onFavoritesOnlyChange?: (favoritesOnly: boolean) => void
  // Clears every filter in this bar; the search box is separate and stays.
  onReset?: () => void
}

// One row of compact filters: dropdowns for single choices, toggle buttons for on/off filters.
export function BusinessFilters({
  filter,
  onChange,
  freeToday,
  onFreeTodayChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  onReset,
}: BusinessFiltersProps) {
  // Cities come from the unfiltered list so every city stays selectable.
  const { data: all } = useBusinesses({})
  const cities = [...new Set(all?.map((b) => b.city))].sort()
  const anyActive = Boolean(filter.category || filter.city || freeToday || favoritesOnly)

  return (
    <div role="group" aria-label="Filters" className="mt-6 flex flex-wrap items-center gap-2">
      <FilterMenu
        label="Category"
        options={categories.map((c) => ({ value: c, label: categoryLabels[c] }))}
        value={filter.category}
        onChange={(category) => onChange({ ...filter, category })}
      />
      {cities.length > 0 && (
        <FilterMenu
          label="City"
          options={cities.map((c) => ({ value: c, label: c }))}
          value={filter.city}
          onChange={(city) => onChange({ ...filter, city })}
        />
      )}
      {onFreeTodayChange && (
        <Button
          size="sm"
          variant="outline"
          className={activeFilter}
          aria-pressed={Boolean(freeToday)}
          onClick={() => onFreeTodayChange(!freeToday)}
        >
          <Clock aria-hidden="true" />
          Free today
        </Button>
      )}
      {onFavoritesOnlyChange && (
        <Button
          size="sm"
          variant="outline"
          className={activeFilter}
          aria-pressed={Boolean(favoritesOnly)}
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        >
          <Heart aria-hidden="true" />
          Favorites
        </Button>
      )}
      {onReset && anyActive && (
        <Button size="sm" variant="ghost" onClick={onReset}>
          <X aria-hidden="true" />
          Reset
        </Button>
      )}
    </div>
  )
}
