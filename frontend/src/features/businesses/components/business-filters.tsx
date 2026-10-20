import { useBusinesses } from '../api/use-businesses'
import type { BusinessFilter } from '../types'
import { categories, categoryLabels } from './category-meta'
import { ChipGroup } from './chip-group'

type BusinessFiltersProps = {
  filter: BusinessFilter
  onChange: (filter: BusinessFilter) => void
  // "Free today" is decided by the slots feature; the filter only shows the choice.
  freeToday?: boolean
  onFreeTodayChange?: (freeToday: boolean) => void
}

export function BusinessFilters({ filter, onChange, freeToday, onFreeTodayChange }: BusinessFiltersProps) {
  // Cities come from the unfiltered list so every city stays selectable.
  const { data: all } = useBusinesses({})
  const cities = [...new Set(all?.map((b) => b.city))].sort()

  return (
    <div className="mt-6 flex flex-col gap-3">
      <ChipGroup
        label="Category"
        options={categories.map((c) => ({ value: c, label: categoryLabels[c] }))}
        value={filter.category}
        onChange={(category) => onChange({ ...filter, category })}
      />
      {cities.length > 0 && (
        <ChipGroup
          label="City"
          options={cities.map((c) => ({ value: c, label: c }))}
          value={filter.city}
          onChange={(city) => onChange({ ...filter, city })}
        />
      )}
      {onFreeTodayChange && (
        <ChipGroup
          label="When"
          options={[{ value: 'today', label: 'Free today' }]}
          value={freeToday ? 'today' : undefined}
          onChange={(value) => onFreeTodayChange(value === 'today')}
        />
      )}
    </div>
  )
}
