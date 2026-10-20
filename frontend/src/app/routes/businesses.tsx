import { useSearchParams } from 'react-router'

import { Input } from '@/components/ui/input'
import { BusinessFilters } from '@/features/businesses/components/business-filters'
import { BusinessesList } from '@/features/businesses/components/businesses-list'
import type { BusinessFilter } from '@/features/businesses/types'
import { isCategory } from '@/lib/categories'
import { useDebouncedValue } from '@/lib/use-debounced-value'

// Filters live in the URL (/businesses?search=&category=&city=), so a search can be
// shared, the home page can link into it, and the back button restores it.
export function Businesses() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category')
  const filter: BusinessFilter = {
    search: params.get('search') ?? undefined,
    category: isCategory(category) ? category : undefined,
    city: params.get('city') ?? undefined,
  }
  // Typing updates the input at once, the list only after a short pause.
  const debouncedFilter = useDebouncedValue(filter)

  // Typing replaces the history entry, so Back does not step through every letter.
  const changeFilter = (next: BusinessFilter, replace = false) => {
    const entries = Object.entries(next).filter((entry): entry is [string, string] => Boolean(entry[1]))
    setParams(new URLSearchParams(entries), { replace })
  }

  return (
    <section>
      <title>Businesses · Zakazi.me</title>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="text-3xl font-bold">Businesses</h1>
        <Input
          aria-label="Search businesses"
          placeholder="Search by name"
          value={filter.search ?? ''}
          onChange={(e) => changeFilter({ ...filter, search: e.target.value }, true)}
          className="md:max-w-xs"
        />
      </div>

      <BusinessFilters filter={filter} onChange={changeFilter} />
      <BusinessesList filter={debouncedFilter} onClearFilters={() => changeFilter({})} />
    </section>
  )
}
