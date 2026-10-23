import { Skeleton } from '@/components/ui/skeleton'

import { useReviews } from '../api/use-reviews'
import { RatingStars } from './rating-stars'

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

type ReviewsListProps = {
  businessId: number
}

// A business's reviews, newest first, with loading, empty and error states.
export function ReviewsList({ businessId }: ReviewsListProps) {
  const { data: reviews, isLoading, error } = useReviews({ businessId })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  if (error) return <p className="text-destructive">Reviews failed to load. Please try again.</p>

  if (!reviews || reviews.length === 0) {
    return <p className="text-muted-foreground">No reviews yet. Clients can rate a visit after it.</p>
  }

  return (
    <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-card">
      {reviews.map((review) => (
        <li key={review.id} className="flex flex-col gap-1 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm">
              <RatingStars rating={review.rating} />
              <span className="font-semibold tabular-nums">{review.rating} out of 5</span>
            </span>
            <span className="min-w-0 text-xs break-words text-muted-foreground tabular-nums">
              {review.authorName} · {dateFormat.format(new Date(`${review.createdAt}T00:00Z`))}
            </span>
          </div>
          {review.comment && <p className="text-sm">{review.comment}</p>}
        </li>
      ))}
    </ul>
  )
}
