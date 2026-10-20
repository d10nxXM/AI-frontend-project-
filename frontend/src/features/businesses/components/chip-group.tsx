import { Button } from '@/components/ui/button'

type ChipGroupProps<T extends string> = {
  label: string
  options: { value: T; label: string }[]
  value: T | undefined
  onChange: (value: T | undefined) => void
}

// Single-choice chips with an "All" option; clicking the active chip again clears it.
export function ChipGroup<T extends string>({ label, options, value, onChange }: ChipGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-full text-sm text-muted-foreground sm:w-16">{label}</span>
      <Button
        size="sm"
        variant={value === undefined ? 'secondary' : 'outline'}
        aria-pressed={value === undefined}
        onClick={() => onChange(undefined)}
      >
        All
      </Button>
      {options.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={value === option.value ? 'secondary' : 'outline'}
          aria-pressed={value === option.value}
          onClick={() => onChange(value === option.value ? undefined : option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
