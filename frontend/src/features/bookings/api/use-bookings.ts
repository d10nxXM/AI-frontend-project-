import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { NewBooking } from '../types'
import { bookingsApi } from './bookings-api'

export function useBookings(search: string) {
  return useQuery({
    queryKey: ['bookings', search],
    queryFn: () => bookingsApi.list(search),
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bookingsApi.update(id, { status: 'cancelled' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewBooking) => bookingsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}
