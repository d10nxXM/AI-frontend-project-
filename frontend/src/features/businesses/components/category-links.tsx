import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { categoryIcons } from '@/lib/categories'

import { useBusinesses } from '../api/use-businesses'
import { categories, categoryPluralLabels } from './category-meta'

// One link per category to the filtered business list, with how many places it has.
export function CategoryLinks() {
  const { data: businesses, isLoading, error } = useBusinesses({})

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {categories.map((category) => (
          <Skeleton key={category} className="h-20" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive">Categories failed to load. Please try again.</p>
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {categories.map((category) => {
        const Icon = categoryIcons[category]
        const count = businesses?.filter((b) => b.category === category).length ?? 0
        return (
          <li key={category}>
            <Link
              to={`/businesses?category=${category}`}
              aria-label={`${categoryPluralLabels[category]}, ${count} ${count === 1 ? 'place' : 'places'}`}
              className="flex items-center gap-4 rounded-lg border p-4 outline-none transition-colors hover:border-foreground/30 focus-visible:ring-3 focus-visible:ring-ring"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon aria-hidden className="size-6" />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="font-semibold">{categoryPluralLabels[category]}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {count} {count === 1 ? 'place' : 'places'}
                </span>
              </span>
              <ChevronRight aria-hidden className="size-4 text-muted-foreground" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
