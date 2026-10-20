import { useSearchParams } from 'react-router'

import { Input } from '@/components/ui/input'
import { BusinessFilters } from '@/features/businesses/components/business-filters'
import { BusinessesList } from '@/features/businesses/components/businesses-list'
import type { Business, BusinessFilter } from '@/features/businesses/types'
import { useSlots } from '@/features/slots/api/use-slots'
import { NextFreeTime } from '@/features/slots/components/next-free-time'
import { isCategory } from '@/lib/categories'
import { localNow } from '@/lib/local-time'
import { useDebouncedValue } from '@/lib/use-debounced-value'

// Filters live in the URL (/businesses?search=&category=&city=&available=today), so a search
// can be shared, the home page can link into it, and the back button restores it.
export function Businesses() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category')
  const filter: BusinessFilter = {
    search: params.get('search') ?? undefined,
    category: isCategory(category) ? category : undefined,
    city: params.get('city') ?? undefined,
  }
  const freeToday = params.get('available') === 'today'
  // Typing updates the input at once, the list only after a short pause.
  const debouncedFilter = useDebouncedValue(filter)

  // "Free today" = a free slot later today. Businesses and slots are separate features,
  // so the route combines them: slots say which business ids qualify.
  const now = localNow()
  const freeSlotsToday = useSlots({ date: now.slice(0, 10), status: 'free' })
  const freeTodayIds = new Set(freeSlotsToday.data?.filter((s) => s.startsAt >= now).map((s) => s.businessId))

  // Typing replaces the history entry, so Back does not step through every letter.
  const setUrl = (next: BusinessFilter, available: boolean, replace = false) => {
    const entries = Object.entries(next).filter((entry): entry is [string, string] => Boolean(entry[1]))
    if (available) entries.push(['available', 'today'])
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
          onChange={(e) => setUrl({ ...filter, search: e.target.value }, freeToday, true)}
          className="md:max-w-xs"
        />
      </div>

      <BusinessFilters
        filter={filter}
        onChange={(next) => setUrl(next, freeToday)}
        freeToday={freeToday}
        onFreeTodayChange={(next) => setUrl(filter, next)}
      />
      <BusinessesList
        filter={debouncedFilter}
        onClearFilters={() => setUrl({}, false)}
        include={freeToday ? (business: Business) => freeTodayIds.has(business.id) : undefined}
        waiting={freeToday && freeSlotsToday.isLoading}
        renderExtra={(business) => <NextFreeTime businessId={business.id} />}
      />
    </section>
  )
}
