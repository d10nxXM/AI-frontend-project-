// A client's rating of a business after a past (not cancelled) booking. Public, so it shows
// only a short author name ("Milena V."), never the full name or phone.
export type Review = {
  id: number
  businessId: number
  bookingId: number
  rating: number
  comment?: string
  authorName: string
  createdAt: string
}

// What the client sends. The mock builds authorName from clientName; the real backend takes the
// author and business from the signed-in user and the booking (docs/entities.md).
export type NewReview = Pick<Review, 'businessId' | 'bookingId' | 'rating' | 'comment'> & {
  clientName: string
}

export type ReviewFilter = {
  businessId?: number
  bookingId?: number
}
