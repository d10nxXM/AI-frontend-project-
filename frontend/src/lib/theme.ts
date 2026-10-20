// Light or dark mode. The `.dark` class on <html> switches the tokens in index.css.
// The choice is kept only in this browser; without one, the system setting decides.
// index.html applies it before React starts, so the page does not flash light first.
export type Theme = 'light' | 'dark'

export const THEME_KEY = 'zakazi.theme'

export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export const currentTheme = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light'

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Storage blocked: the switch still works until the page is reloaded.
  }
}
