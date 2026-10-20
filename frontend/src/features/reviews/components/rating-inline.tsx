import { Star } from 'lucide-react'

import { useReviews } from '../api/use-reviews'
import { averageRating, reviewCountLabel } from './average-rating'

type RatingInlineProps = {
  businessId: number
}

// One short line for a business card. Loads all reviews once (shared cache) instead of per card.
export function RatingInline({ businessId }: RatingInlineProps) {
  const { data } = useReviews()
  const reviews = data?.filter((r) => r.businessId === businessId) ?? []
  const average = averageRating(reviews)
  // Nothing while loading or without reviews: the card's other lines already say enough.
  if (!data || average === undefined) return null

  return (
    <span className="flex items-center gap-2 text-sm tabular-nums">
      <Star aria-hidden className="size-4 shrink-0 fill-foreground text-foreground" />
      <span className="font-medium text-foreground">{average.toFixed(1)}</span>
      <span className="sr-only">out of 5,</span>
      <span>({reviewCountLabel(reviews.length)})</span>
    </span>
  )
}
