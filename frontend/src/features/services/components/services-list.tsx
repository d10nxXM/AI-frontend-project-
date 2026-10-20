import { Skeleton } from '@/components/ui/skeleton'

import { useServices } from '../api/use-services'

type ServicesListProps = {
  businessId: number
}

// A business's services as a plain divided list, with loading, empty and error states.
export function ServicesList({ businessId }: ServicesListProps) {
  const { data: services, isLoading, error } = useServices(businessId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive">Services failed to load. Please try again.</p>
  }

  if (!services || services.length === 0) {
    return <p className="text-muted-foreground">This business has not listed any services yet.</p>
  }

  return (
    <ul className="divide-y rounded-lg border">
      {services.map((service) => (
        <li key={service.id} className="flex items-start justify-between gap-4 p-4">
          <div className="flex flex-col gap-1">
            <span className="font-medium">{service.name}</span>
            <span className="text-sm text-muted-foreground">{service.description}</span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 tabular-nums">
            <span className="font-semibold">€{service.price}</span>
            <span className="text-sm text-muted-foreground">{service.durationMinutes} min</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
