import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { categoryIcons } from '@/lib/categories'

import { useBusinesses } from '../api/use-businesses'
import { categories, categoryPluralLabels } from './category-meta'

// One link per category to the filtered business list, with how many places it has.
// Phones: one grouped list like iOS Settings, rows split by inset separators. Wider: three tiles.
export function CategoryLinks() {
  const { data: businesses, isLoading, error } = useBusinesses({})

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {categories.map((category) => (
          <Skeleton key={category} className="h-20 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive">Categories failed to load. Please try again.</p>
  }

  return (
    <ul className="overflow-hidden rounded-2xl bg-card sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:bg-transparent">
      {categories.map((category) => {
        const Icon = categoryIcons[category]
        const count = businesses?.filter((b) => b.category === category).length ?? 0
        return (
          <li key={category} className="group/row">
            <Link
              to={`/businesses?category=${category}`}
              aria-label={`${categoryPluralLabels[category]}, ${count} ${count === 1 ? 'place' : 'places'}`}
              className="pressable flex items-center gap-4 bg-card pl-4 outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset active:bg-muted sm:rounded-2xl sm:py-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Icon aria-hidden className="size-5" />
              </span>
              {/* The separator starts at the text, not the icon, as in iOS lists. */}
              <span className="flex flex-1 items-center gap-4 py-3 pr-4 group-[&:not(:first-child)]/row:border-t sm:py-0 sm:group-[&:not(:first-child)]/row:border-t-0">
                <span className="flex flex-1 flex-col">
                  <span className="font-semibold">{categoryPluralLabels[category]}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {count} {count === 1 ? 'place' : 'places'}
                  </span>
                </span>
                <ChevronRight aria-hidden className="size-4 text-muted-foreground" />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
