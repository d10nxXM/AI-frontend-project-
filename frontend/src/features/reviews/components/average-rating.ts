import type { Review } from '../types'

// Average to one decimal, e.g. 4.7, or undefined when there are no reviews yet.
export function averageRating(reviews: Pick<Review, 'rating'>[]) {
  if (reviews.length === 0) return undefined
  const sum = reviews.reduce((total, r) => total + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export const reviewCountLabel = (count: number) => `${count} ${count === 1 ? 'review' : 'reviews'}`
