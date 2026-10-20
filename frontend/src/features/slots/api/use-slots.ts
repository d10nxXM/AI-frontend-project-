import { useQuery } from '@tanstack/react-query'

import type { SlotFilter } from '../types'
import { slotsApi } from './slots-api'

export function useSlots(filter: SlotFilter) {
  return useQuery({
    queryKey: ['slots', filter],
    queryFn: () => slotsApi.list(filter),
  })
}
