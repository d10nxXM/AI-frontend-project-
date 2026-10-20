import { useQuery } from '@tanstack/react-query'

import type { BusinessFilter } from '../types'
import { businessesApi } from './businesses-api'

export function useBusinesses(filter: BusinessFilter) {
  return useQuery({
    queryKey: ['businesses', filter],
    queryFn: () => businessesApi.list(filter),
  })
}

export function useBusiness(id: number) {
  return useQuery({
    queryKey: ['businesses', id],
    queryFn: () => businessesApi.get(id),
  })
}
