import { cva } from 'class-variance-authority'
import { Check } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

import { useServices } from '../api/use-services'
import type { Service } from '../types'

const serviceVariants = cva(
  'flex w-full items-start justify-between gap-4 p-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring',
  {
    variants: {
      selected: { true: 'bg-muted', false: '' },
      selectable: { true: 'hover:bg-muted/50 active:bg-muted', false: '' },
    },
  },
)

type ServicesListProps = {
  businessId: number
  // With onSelect the rows become buttons and the chosen one is marked "Selected".
  selectedId?: number
  onSelect?: (service: Service) => void
  // Chosen once the services have loaded, e.g. from "Book again" (?service=1). Ignored when the
  // business no longer offers it.
  preselectId?: number
}

// A business's services as a plain divided list, with loading, empty and error states.
export function ServicesList({ businessId, selectedId, onSelect, preselectId }: ServicesListProps) {
  const { data: services, isLoading, error } = useServices(businessId)

  // Preselect only once, so the client can still pick another service afterwards.
  const preselected = useRef(false)
  useEffect(() => {
    if (preselected.current || !services || !onSelect || preselectId === undefined) return
    preselected.current = true
    const service = services.find((s) => s.id === preselectId)
    if (service && selectedId === undefined) onSelect(service)
  }, [services, onSelect, preselectId, selectedId])

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
    <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-card">
      {services.map((service) => {
        const selected = service.id === selectedId
        const content = (
          <>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{service.name}</span>
              <span className="text-sm text-muted-foreground">{service.description}</span>
              {/* Under the description, so it does not squeeze the name on a phone. */}
              {selected && (
                <span className="flex items-center gap-1 text-xs font-medium">
                  <Check aria-hidden className="size-3" />
                  Selected
                </span>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 tabular-nums">
              <span className="font-semibold">€{service.price}</span>
              <span className="text-sm text-muted-foreground">{service.durationMinutes} min</span>
            </div>
          </>
        )

        return (
          <li key={service.id}>
            {onSelect ? (
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(service)}
                className={serviceVariants({ selected, selectable: true })}
              >
                {content}
              </button>
            ) : (
              <div className={serviceVariants({ selected: false, selectable: false })}>{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
