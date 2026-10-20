import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { NewReview, ReviewFilter } from '../types'
import { reviewsApi } from './reviews-api'

export function useReviews(filter: ReviewFilter = {}) {
  return useQuery({
    queryKey: ['reviews', filter],
    queryFn: () => reviewsApi.list(filter),
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewReview) => reviewsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
}
