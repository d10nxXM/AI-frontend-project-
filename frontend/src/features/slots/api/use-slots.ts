import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { SlotFilter, TimeRange, TimeSlot } from '../types'
import { slotsInRange } from './slot-range'
import { slotsApi } from './slots-api'

export function useSlots(filter: SlotFilter) {
  return useQuery({
    queryKey: ['slots', filter],
    queryFn: () => slotsApi.list(filter),
  })
}

// Sets every slot a booking covers to `status`. Mock only: the real POST and PATCH
// /bookings do this on the backend, so these hooks go away with it.
async function setRangeStatus(range: TimeRange, status: TimeSlot['status']) {
  const daySlots = await slotsApi.list({ businessId: range.businessId, date: range.startsAt.slice(0, 10) })
  const covered = slotsInRange(daySlots, range.startsAt, range.durationMinutes)
  await Promise.all(covered.map((slot) => slotsApi.update(slot.id, { status })))
}

export function useBookRange() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (range: TimeRange) => setRangeStatus(range, 'booked'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['slots'] }),
  })
}

export function useReleaseRange() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (range: TimeRange) => setRangeStatus(range, 'free'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['slots'] }),
  })
}
