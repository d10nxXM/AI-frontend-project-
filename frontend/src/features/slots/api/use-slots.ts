import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { SlotFilter } from '../types'
import { slotsApi } from './slots-api'

export function useSlots(filter: SlotFilter) {
  return useQuery({
    queryKey: ['slots', filter],
    queryFn: () => slotsApi.list(filter),
  })
}

// Marks a slot as taken after a booking. Mock only: the real POST /bookings does this itself.
export function useBookSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => slotsApi.update(id, { status: 'booked' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['slots'] }),
  })
}
