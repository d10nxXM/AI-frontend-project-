import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { NewService } from '../types'
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

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewService) => servicesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<NewService> }) =>
      servicesApi.update(id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => servicesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })
}
