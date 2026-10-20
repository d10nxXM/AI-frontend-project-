// Favorite business ids, kept only in this browser. Not personal data (only public business ids),
// and saved only when the client taps a heart. Works the same when storage is empty or blocked.
const KEY = 'zakazi.favorites'
// Keeps storage small even if something writes junk.
const MAX_FAVORITES = 100

// Reads whatever is stored and keeps only positive whole numbers, without duplicates.
export function parseFavorites(raw: string | null): number[] {
  if (!raw) return []
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    // Stops after MAX_FAVORITES valid ids, so a huge stored array is not walked to the end.
    const ids = new Set<number>()
    for (const id of value) {
      if (ids.size >= MAX_FAVORITES) break
      if (Number.isInteger(id) && id > 0) ids.add(id)
    }
    return [...ids]
  } catch {
    return []
  }
}

function read() {
  try {
    return parseFavorites(localStorage.getItem(KEY))
  } catch {
    return []
  }
}

let favorites: readonly number[] = read()
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

// Another tab changed the favorites (or cleared all storage, which sends key null): pick up the
// new list, so the next heart tap does not write an old, already forgotten list back.
function onStorage(event: StorageEvent) {
  if (event.key !== KEY && event.key !== null) return
  favorites = parseFavorites(event.key === null ? null : event.newValue)
  notify()
}

export function subscribeFavorites(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}

export const getFavorites = () => favorites

export function toggleFavorite(id: number) {
  favorites = favorites.includes(id)
    ? favorites.filter((favorite) => favorite !== id)
    : [...favorites, id].slice(-MAX_FAVORITES)
  try {
    localStorage.setItem(KEY, JSON.stringify(favorites))
  } catch {
    // Storage is full or blocked: the heart still works until the page is reloaded.
  }
  notify()
}
