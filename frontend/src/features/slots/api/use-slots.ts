import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { localNow } from '@/lib/local-time'

import type { SlotFilter, TimeRange, TimeSlot } from '../types'
import { planSlots, type SlotPlan } from './plan-slots'
import { slotsInRange } from './slot-range'
import { slotsApi } from './slots-api'

export class SlotBookedError extends Error {
  constructor() {
    super('A booked time slot cannot be deleted')
  }
}

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

// Owner: publishes back-to-back free slots on one day. Times that overlap a published slot or
// already passed are skipped. The backend repeats these checks in POST /slots.
export function usePublishSlots() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (plan: SlotPlan) => {
      const existing = await slotsApi.list({ businessId: plan.businessId, date: plan.date })
      const { slots, skipped } = planSlots(plan, existing, localNow())
      const created = await Promise.all(slots.map((slot) => slotsApi.create(slot)))
      return { created, skipped }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['slots'] }),
  })
}

// Owner: deletes a free slot. A booked one is refused (the backend refuses it too).
export function useDeleteSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const slot = await slotsApi.get(id)
      if (slot.status === 'booked') throw new SlotBookedError()
      await slotsApi.remove(id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['slots'] }),
  })
}
