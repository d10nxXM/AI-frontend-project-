import { useSearchParams } from 'react-router'

import { Input } from '@/components/ui/input'
import { BusinessFilters } from '@/features/businesses/components/business-filters'
import { BusinessesList } from '@/features/businesses/components/businesses-list'
import { useFavorites } from '@/features/businesses/hooks/use-favorites'
import type { Business, BusinessFilter } from '@/features/businesses/types'
import { RatingInline } from '@/features/reviews/components/rating-inline'
import { useSlots } from '@/features/slots/api/use-slots'
import { NextFreeTime } from '@/features/slots/components/next-free-time'
import { isCategory } from '@/lib/categories'
import { localNow } from '@/lib/local-time'
import { useDebouncedValue } from '@/lib/use-debounced-value'

type Toggles = { freeToday: boolean; favoritesOnly: boolean }

// Filters live in the URL (/businesses?search=&category=&city=&available=today&favorites=1), so a
// search can be shared, the home page can link into it, and the back button restores it.
export function Businesses() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category')
  const filter: BusinessFilter = {
    search: params.get('search') ?? undefined,
    category: isCategory(category) ? category : undefined,
    city: params.get('city') ?? undefined,
  }
  const toggles: Toggles = {
    freeToday: params.get('available') === 'today',
    favoritesOnly: params.get('favorites') === '1',
  }
  // Typing updates the input at once, the list only after a short pause.
  const debouncedFilter = useDebouncedValue(filter)
  const favorites = useFavorites()

  // "Free today" = a free slot later today. Businesses and slots are separate features,
  // so the route combines them: slots say which business ids qualify.
  const now = localNow()
  const freeSlotsToday = useSlots({ date: now.slice(0, 10), status: 'free' })
  const freeTodayIds = new Set(freeSlotsToday.data?.filter((s) => s.startsAt >= now).map((s) => s.businessId))

  const include =
    toggles.freeToday || toggles.favoritesOnly
      ? (business: Business) =>
          (!toggles.freeToday || freeTodayIds.has(business.id)) &&
          (!toggles.favoritesOnly || favorites.ids.has(business.id))
      : undefined

  // Typing replaces the history entry, so Back does not step through every letter.
  const setUrl = (next: BusinessFilter, nextToggles: Toggles, replace = false) => {
    const entries = Object.entries(next).filter((entry): entry is [string, string] => Boolean(entry[1]))
    if (nextToggles.freeToday) entries.push(['available', 'today'])
    if (nextToggles.favoritesOnly) entries.push(['favorites', '1'])
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
          onChange={(e) => setUrl({ ...filter, search: e.target.value }, toggles, true)}
          className="md:max-w-xs"
        />
      </div>

      <BusinessFilters
        filter={filter}
        onChange={(next) => setUrl(next, toggles)}
        freeToday={toggles.freeToday}
        onFreeTodayChange={(freeToday) => setUrl(filter, { ...toggles, freeToday })}
        favoritesOnly={toggles.favoritesOnly}
        onFavoritesOnlyChange={(favoritesOnly) => setUrl(filter, { ...toggles, favoritesOnly })}
        onReset={() => setUrl({ search: filter.search }, { freeToday: false, favoritesOnly: false })}
      />
      <BusinessesList
        filter={debouncedFilter}
        onClearFilters={() => setUrl({}, { freeToday: false, favoritesOnly: false })}
        include={include}
        waiting={toggles.freeToday && freeSlotsToday.isLoading}
        renderExtra={(business) => (
          <>
            <RatingInline businessId={business.id} />
            <NextFreeTime businessId={business.id} />
          </>
        )}
        emptyMessage={
          toggles.favoritesOnly && favorites.ids.size === 0
            ? 'No favorites yet. Tap the heart on a business to save it.'
            : undefined
        }
      />
    </section>
  )
}
