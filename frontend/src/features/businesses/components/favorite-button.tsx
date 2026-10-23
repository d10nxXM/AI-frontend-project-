import { cva } from 'class-variance-authority'
import { Heart } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useFavorites } from '../hooks/use-favorites'
import type { Business } from '../types'

// Dark when saved, not red: red is only for the main action on a screen (DESIGN.md).
const heartVariants = cva('size-5', {
  variants: { saved: { true: 'fill-foreground text-foreground', false: 'text-muted-foreground' } },
})

type FavoriteButtonProps = {
  business: Pick<Business, 'id' | 'name'>
  className?: string
}

// A toggle: aria-pressed says whether this business is a favorite, the label stays the same.
export function FavoriteButton({ business, className }: FavoriteButtonProps) {
  const { ids, toggle } = useFavorites()
  const saved = ids.has(business.id)

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`Favorite ${business.name}`}
      title={saved ? 'Remove from favorites' : 'Save to favorites'}
      onClick={() => toggle(business.id)}
      className={cn(
        // Glass, because on wider screens it floats over the cover photo.
        'glass pressable flex size-10 items-center justify-center rounded-full outline-none hover:bg-card focus-visible:ring-3 focus-visible:ring-ring',
        className,
      )}
    >
      <Heart aria-hidden className={heartVariants({ saved })} />
    </button>
  )
}
