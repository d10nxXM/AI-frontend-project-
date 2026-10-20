import { NotFoundError, delay } from '@/lib/mock-db'

import { shortName } from '../components/short-name'
import type { NewReview, Review, ReviewFilter } from '../types'

// Reviews from other clients' past visits (their bookings are not in this client's mock list).
let reviews: Review[] = [
  {
    id: 1,
    businessId: 1,
    bookingId: 901,
    rating: 5,
    comment: 'Lana really listened to what I wanted. Best colour I have had in years.',
    authorName: 'Jelena M.',
    createdAt: '2026-10-02',
  },
  {
    id: 2,
    businessId: 1,
    bookingId: 902,
    rating: 4,
    comment: 'Great cut, but I waited about ten minutes past my time.',
    authorName: 'Ivana K.',
    createdAt: '2026-10-09',
  },
  {
    id: 3,
    businessId: 1,
    bookingId: 903,
    rating: 5,
    authorName: 'Sara D.',
    createdAt: '2026-10-14',
  },
  {
    id: 4,
    businessId: 2,
    bookingId: 904,
    rating: 5,
    comment: 'Clean fade and a proper hot towel shave. Booking a free slot took a minute.',
    authorName: 'Marko P.',
    createdAt: '2026-10-05',
  },
  {
    id: 5,
    businessId: 2,
    bookingId: 905,
    rating: 4,
    comment: 'Good barbers, the shop gets loud on Saturdays.',
    authorName: 'Nikola R.',
    createdAt: '2026-10-11',
  },
  {
    id: 6,
    businessId: 3,
    bookingId: 906,
    rating: 5,
    comment: 'The coach fixed my deadlift form in one session.',
    authorName: 'Stefan B.',
    createdAt: '2026-10-07',
  },
  {
    id: 7,
    businessId: 3,
    bookingId: 907,
    rating: 3,
    comment: 'Good equipment, but the changing room was crowded at 18:00.',
    authorName: 'Luka V.',
    createdAt: '2026-10-12',
  },
  {
    id: 8,
    businessId: 4,
    bookingId: 908,
    rating: 5,
    comment: 'Yoga on the terrace at sunset, highly recommended.',
    authorName: 'Ana T.',
    createdAt: '2026-10-10',
  },
  {
    id: 9,
    businessId: 5,
    bookingId: 909,
    rating: 4,
    comment: 'Oil change done on time and they showed me the worn brake pads.',
    authorName: 'Dejan S.',
    createdAt: '2026-10-08',
  },
  {
    id: 10,
    businessId: 6,
    bookingId: 910,
    rating: 2,
    comment: 'Screen replaced, but it took two days instead of the promised hour.',
    authorName: 'Milica J.',
    createdAt: '2026-10-13',
  },
]

const matches = (review: Review, { businessId, bookingId }: ReviewFilter) =>
  (businessId === undefined || review.businessId === businessId) &&
  (bookingId === undefined || review.bookingId === bookingId)


export class DuplicateReviewError extends Error {
  constructor() {
    super('This booking already has a review.')
  }
}

export const reviewsApi = {
  // Newest first.
  list: (filter: ReviewFilter = {}) =>
    delay(
      reviews
        .filter((r) => matches(r, filter))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id),
    ),

  get: (id: number) => {
    const review = reviews.find((r) => r.id === id)
    if (!review) return Promise.reject(new NotFoundError('Review', id))
    return delay(review)
  },

  create: ({ clientName, ...input }: NewReview) => {
    // One review per booking.
    if (reviews.some((r) => r.bookingId === input.bookingId))
      return Promise.reject(new DuplicateReviewError())
    const review: Review = {
      ...input,
      authorName: shortName(clientName),
      id: Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
    }
    reviews = [review, ...reviews]
    return delay(review)
  },

  update: (id: number, changes: Partial<Pick<Review, 'rating' | 'comment'>>) => {
    reviews = reviews.map((r) => (r.id === id ? { ...r, ...changes } : r))
    return reviewsApi.get(id)
  },

  remove: (id: number) => {
    reviews = reviews.filter((r) => r.id !== id)
    return delay(undefined)
  },
}
