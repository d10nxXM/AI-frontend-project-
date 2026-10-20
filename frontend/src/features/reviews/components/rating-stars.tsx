import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

type RatingStarsProps = {
  rating: number
  className?: string
}

// Five stars, filled up to the rounded rating. Dark, not red (red is only for the main action),
// and the number is always written out next to them, so the rating is not shown by color alone.
export function RatingStars({ rating, className }: RatingStarsProps) {
  const filled = Math.round(rating)
  return (
    <span className={cn('flex items-center gap-0.5', className)} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={i < filled ? 'size-4 fill-foreground text-foreground' : 'size-4 text-muted-foreground'}
        />
      ))}
    </span>
  )
}
