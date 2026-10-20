import { Star } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

import { useCreateReview, useReviews } from '../api/use-reviews'
import type { NewReview } from '../types'
import { RatingStars } from './rating-stars'
import { shortName } from './short-name'
import { reviewSchema } from './review-schema'

type ReviewFormProps = {
  // The past booking being rated.
  booking: Pick<NewReview, 'businessId' | 'bookingId' | 'clientName'>
}

// "Rate your visit" for a past booking, or the client's review once it is sent (one per booking).
// The stars are real radio buttons, so arrow keys and screen readers work as in any form.
export function ReviewForm({ booking }: ReviewFormProps) {
  const id = useId()
  const { data: existing, isLoading, error } = useReviews({ bookingId: booking.bookingId })
  const createReview = useCreateReview()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [ratingError, setRatingError] = useState('')

  if (isLoading) return <Skeleton className="h-40" />
  if (error) return <p className="text-sm text-destructive">Your review could not be loaded.</p>

  const review = existing?.[0]
  if (review) {
    return (
      <section aria-labelledby={`${id}-yours`} className="flex flex-col gap-2 rounded-lg border p-4">
        <h2 id={`${id}-yours`} className="font-semibold">
          Your review
        </h2>
        <p className="flex items-center gap-2 text-sm">
          <RatingStars rating={review.rating} />
          <span className="font-semibold tabular-nums">{review.rating} out of 5</span>
        </p>
        {review.comment && <p className="text-sm">{review.comment}</p>}
        <p className="text-xs text-muted-foreground">Shown on the business page as “{review.authorName}”.</p>
      </section>
    )
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = reviewSchema.safeParse({ rating, comment })
    if (!result.success) {
      setRatingError(result.error.issues.find((i) => i.path[0] === 'rating')?.message ?? '')
      return
    }
    setRatingError('')
    createReview.mutate({ ...booking, ...result.data })
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4 rounded-lg border p-4">
      <h2 className="font-semibold">Rate your visit</h2>

      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={ratingError ? `${id}-rating-error` : undefined}
      >
        <legend className="mb-2 text-sm font-medium">Your rating</legend>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className="cursor-pointer rounded-sm p-1 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring"
            >
              <input
                type="radio"
                name={`${id}-rating`}
                value={value}
                checked={rating === value}
                onChange={() => {
                  setRating(value)
                  setRatingError('')
                }}
                className="sr-only"
              />
              <Star
                aria-hidden
                className={
                  value <= rating ? 'size-7 fill-foreground text-foreground' : 'size-7 text-muted-foreground'
                }
              />
              <span className="sr-only">
                {value} {value === 1 ? 'star' : 'stars'}
              </span>
            </label>
          ))}
          <span className="ml-2 text-sm tabular-nums" aria-live="polite">
            {rating > 0 ? `${rating} out of 5` : 'Not rated yet'}
          </span>
        </div>
        {ratingError && (
          <p id={`${id}-rating-error`} className="text-sm text-destructive">
            {ratingError}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-comment`}>
          Comment <span className="font-normal text-muted-foreground">(optional, shown publicly)</span>
        </Label>
        <Textarea
          id={`${id}-comment`}
          rows={3}
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Shown publicly as <span className="font-medium text-foreground">“{shortName(booking.clientName)}”</span>, with
        your rating and comment.
      </p>

      {createReview.isError && (
        <p role="alert" className="text-sm text-destructive">
          The review could not be sent. Please try again.
        </p>
      )}

      <Button type="submit" disabled={createReview.isPending} className="w-full sm:w-auto sm:self-end">
        {createReview.isPending ? 'Sending…' : 'Send review'}
      </Button>
    </form>
  )
}
