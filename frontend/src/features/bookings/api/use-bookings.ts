import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { NotFoundError } from '@/lib/mock-db'

import type { NewBooking } from '../types'
import { bookingsApi } from './bookings-api'

export function useBookings(search: string) {
  return useQuery({
    queryKey: ['bookings', search],
    queryFn: () => bookingsApi.list(search),
  })
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingsApi.get(id),
    // A missing booking will not appear on retry, so show the not-found state right away.
    retry: (failureCount, error) => !(error instanceof NotFoundError) && failureCount < 3,
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

export function useRescheduleBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, slot }: { id: number; slot: { id: number; startsAt: string } }) =>
      bookingsApi.update(id, { slotId: slot.id, startsAt: slot.startsAt }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}
