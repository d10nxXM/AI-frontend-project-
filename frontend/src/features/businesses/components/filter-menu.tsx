import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// An active filter turns dark-filled like an iOS chip, not only a slightly different gray.
export const activeFilter =
  'aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground/90 aria-pressed:[&_svg]:text-background'

// Radix radio items need a string value; "All" uses one no option can have.
const ALL = '\u0000all'

type FilterMenuProps<T extends string> = {
  label: string
  options: { value: T; label: string }[]
  value: T | undefined
  onChange: (value: T | undefined) => void
}

// Single-choice dropdown with an "All" option. The button shows the chosen option, and its
// accessible name keeps the label ("Category: Gym") so it reads well without the open menu.
export function FilterMenu<T extends string>({ label, options, value, onChange }: FilterMenuProps<T>) {
  const selected = options.find((option) => option.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={activeFilter}
          aria-pressed={selected !== undefined}
          aria-label={`${label}: ${selected?.label ?? 'All'}`}
        >
          {selected?.label ?? label}
          <ChevronDown aria-hidden="true" className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuRadioGroup
          value={selected?.value ?? ALL}
          onValueChange={(next) => onChange(options.find((option) => option.value === next)?.value)}
        >
          <DropdownMenuRadioItem value={ALL}>All</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
