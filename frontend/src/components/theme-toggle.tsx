import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

import { currentTheme, setTheme, type Theme } from '@/lib/theme'

// A toggle in the header: aria-pressed says whether dark mode is on, the label stays the same.
export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(currentTheme)
  const dark = theme === 'dark'

  function toggle() {
    const next: Theme = dark ? 'light' : 'dark'
    setTheme(next)
    setThemeState(next)
  }

  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      className="pressable flex size-10 items-center justify-center rounded-full bg-secondary text-foreground outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring"
    >
      {dark ? <Sun aria-hidden className="size-4" /> : <Moon aria-hidden className="size-4" />}
    </button>
  )
}
