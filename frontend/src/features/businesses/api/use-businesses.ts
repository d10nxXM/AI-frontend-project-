import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { NotFoundError } from '@/lib/mock-db'

import type { BusinessFilter } from '../types'
import { businessesApi } from './businesses-api'

export function useBusinesses(filter: BusinessFilter) {
  return useQuery({
    queryKey: ['businesses', filter],
    queryFn: () => businessesApi.list(filter),
    // Keep showing the last results while a new filter loads, instead of skeletons.
    placeholderData: keepPreviousData,
  })
}

export function useBusiness(id: number) {
  return useQuery({
    queryKey: ['businesses', id],
    queryFn: () => businessesApi.get(id),
    // A missing business will not appear on retry, so show the not-found state right away.
    retry: (failureCount, error) => !(error instanceof NotFoundError) && failureCount < 3,
  })
}
