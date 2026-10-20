import { useMemo, useSyncExternalStore } from 'react'

import { getFavorites, subscribeFavorites, toggleFavorite } from './favorites-store'

// Favorite businesses, shared by every heart on the page and kept in sync across tabs.
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribeFavorites, getFavorites)
  const ids = useMemo(() => new Set(favorites), [favorites])
  return { ids, toggle: toggleFavorite }
}
