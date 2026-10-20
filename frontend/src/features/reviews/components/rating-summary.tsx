import { Skeleton } from '@/components/ui/skeleton'

import { useReviews } from '../api/use-reviews'
import { averageRating, reviewCountLabel } from './average-rating'
import { RatingStars } from './rating-stars'

type RatingSummaryProps = {
  businessId: number
}

// "★★★★★ 4.7 · 3 reviews" under a business name.
export function RatingSummary({ businessId }: RatingSummaryProps) {
  const { data: reviews, isLoading, error } = useReviews({ businessId })

  if (isLoading) return <Skeleton className="h-5 w-40" />
  if (error) return <p className="text-sm text-destructive">Reviews could not be loaded.</p>

  const average = averageRating(reviews ?? [])
  if (average === undefined) return <p className="text-sm text-muted-foreground">No reviews yet</p>

  return (
    <p className="flex items-center gap-2 text-sm">
      <RatingStars rating={average} />
      <span className="font-semibold tabular-nums">{average.toFixed(1)}</span>
      <span className="sr-only">out of 5,</span>
      <span className="text-muted-foreground">· {reviewCountLabel(reviews?.length ?? 0)}</span>
    </p>
  )
}
