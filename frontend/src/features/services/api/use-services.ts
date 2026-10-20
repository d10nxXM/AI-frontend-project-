import { useQuery } from '@tanstack/react-query'

import { servicesApi } from './services-api'

export function useServices(businessId?: number) {
  return useQuery({
    queryKey: ['services', { businessId }],
    queryFn: () => servicesApi.list(businessId),
  })
}

export function useService(id: number) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => servicesApi.get(id),
  })
}
